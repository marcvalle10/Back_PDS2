import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { AppDataSource } from '../data-source';
import { parseMateriasWithUserReader } from './materias.fileReader.adapter';

import { ArchivoCargado } from '../entities/ArchivoCargado';
import { AuditoriaCargas } from '../entities/AuditoriaCargas';
import { ValidacionResultado } from '../entities/ValidacionResultado';
import { PlanEstudio } from '../entities/PlanEstudio';
import { Materia } from '../entities/Materia';
import { PlanMalla } from '../entities/PlanMalla';
import type { DeepPartial } from 'typeorm';

const logAuditoria = async (archivoId: number, etapa: string, estado: string, detalle?: string) => {
  const repo = AppDataSource.getRepository(AuditoriaCargas);
  const payload: any = { etapa, estado, detalle };
  if ('archivo' in repo.metadata.propertiesMap) payload.archivo = { id: archivoId };
  else payload.archivo_id = archivoId;
  await repo.save(repo.create(payload));
};

const escribirValidaciones = async (
  archivoId: number,
  mensajes: { severidad: 'INFO'|'WARNING'|'ERROR', codigo: string, descripcion: string, fila?: string }[]
) => {
  if (!mensajes.length) return;
  const repo = AppDataSource.getRepository(ValidacionResultado);
  const rows: DeepPartial<ValidacionResultado>[] = mensajes.map(m => {
    const r: any = { severidad: m.severidad, regla_codigo: m.codigo, descripcion: m.descripcion, fila_origen: m.fila };
    if ('archivo' in repo.metadata.propertiesMap) r.archivo = { id: archivoId };
    else r.archivo_id = archivoId;
    return r;
  });
  await repo.save(rows);
};

// POST /archivo-cargas/materias/pdf
export const postMateriasPdf = (baseDir: string) => async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Falta archivo "file" (multipart).' });

    const fullPath = path.resolve(req.file.path);
    const pdf = await fs.readFile(fullPath);
    const hash = crypto.createHash('sha256').update(pdf).digest('hex');

    const finalPath = path.join(baseDir, `${hash}.pdf`);
    await fs.rename(fullPath, finalPath).catch(async () => { await fs.unlink(fullPath).catch(() => void 0); });

    const repoAC = AppDataSource.getRepository(ArchivoCargado);
    const payload: any = { tipo: 'MATERIAS_PDF', estado_proceso: 'PENDIENTE', hash };
    if ('nombre_archivo' in repoAC.metadata.propertiesMap) payload.nombre_archivo = req.file.originalname;
    else if ('nombreArchivo' in repoAC.metadata.propertiesMap) payload.nombreArchivo = req.file.originalname;
    else if ('original_filename' in repoAC.metadata.propertiesMap) payload.original_filename = req.file.originalname;

    const ac = await repoAC.save(repoAC.create(payload as DeepPartial<ArchivoCargado>));
    await logAuditoria(ac.id, 'UPLOAD', 'OK', `PDF ${req.file.originalname} (${hash})`);

    return res.status(201).json({ archivoId: ac.id, estado: ac.estado_proceso, hash });
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al subir materias/plan', detail: e?.message });
  }
};

// POST /archivo-cargas/materias/process/:archivoId
export const processMateriasArchivo = (baseDir: string) => async (req: Request, res: Response) => {
  const archivoId = Number(req.params.archivoId);
  if (!archivoId) return res.status(400).json({ error: 'archivoId inválido' });

  const repoAC = AppDataSource.getRepository(ArchivoCargado);
  const ac = await repoAC.findOne({ where: { id: archivoId } });
  if (!ac) return res.status(404).json({ error: 'archivo_cargado no encontrado' });

  try {
    ac.estado_proceso = 'EN_PROCESO';
    await repoAC.save(ac);

    const filePath = path.join(baseDir, `${ac.hash}.pdf`);
    const { cabecera, materias, warnings } = await parseMateriasWithUserReader(filePath);

    // 1) Resolver/crear PlanEstudio a partir de cabecera.plan
    const planRepo = AppDataSource.getRepository(PlanEstudio);
    const planNum = String(cabecera?.plan ?? '').replace(/\D+/g, '');
    let plan: PlanEstudio | null = await planRepo.findOne({
      where: [
        { nombre: planNum } as any,
        { clave:  planNum } as any,
        { plan:   planNum } as any
      ] as any
    });

    if (!plan) {
      const p: Partial<PlanEstudio> = { nombre: planNum || 'PLAN' };
      if ('clave' in planRepo.metadata.propertiesMap) (p as any).clave = planNum;
      if ('total_creditos' in planRepo.metadata.propertiesMap) (p as any).total_creditos = 0;
      plan = await planRepo.save(planRepo.create(p as DeepPartial<PlanEstudio>));
    }

    // 2) Upsert de Materias y PlanMalla
    const matRepo = AppDataSource.getRepository(Materia);
    const mallaRepo = AppDataSource.getRepository(PlanMalla);

    // Helpers para mapear nombres reales de PlanMalla (camel/snake)
    const setPlanRef = (obj: any, value: any) => {
      if ('plan_estudio' in mallaRepo.metadata.propertiesMap) obj.plan_estudio = value;
      else if ('planEstudio' in mallaRepo.metadata.propertiesMap) obj.planEstudio = value;
      else obj.plan = value; // fallback
    };
    const setMateriaRef = (obj: any, value: any) => {
      obj.materia = value; // usualmente 'materia'
    };
    const setPrereqRef = (obj: any, value: any) => {
      if ('prerrequisito' in mallaRepo.metadata.propertiesMap) obj.prerrequisito = value;
      else if ('preRequisito' in mallaRepo.metadata.propertiesMap) obj.preRequisito = value;
      else if ('requisito' in mallaRepo.metadata.propertiesMap) obj.requisito = value;
    };
    const setSemestreSugerido = (obj: any, value: number) => {
      if ('semestre_sugerido' in mallaRepo.metadata.propertiesMap) obj.semestre_sugerido = value;
      else obj.semestreSugerido = value;
    };

    let upserts = 0;

    for (const row of (materias || [])) {
      const codigo = row.clave;                // p.ej. "0868"
      const nombre = row.nombre;
      const creditos = Number(row.creditos ?? 0);
      const prereqClave = row.requisitos || null;

      // upsert Materia
      let mat: Materia | null = await matRepo.findOne({
        where: [{ codigo }, { clave: codigo }] as any
      });

      if (!mat) {
        const nuevo: any = { nombre };
        if ('codigo' in matRepo.metadata.propertiesMap) nuevo.codigo = codigo;
        else if ('clave' in matRepo.metadata.propertiesMap) nuevo.clave = codigo;
        if ('creditos' in matRepo.metadata.propertiesMap) nuevo.creditos = creditos;

        mat = await matRepo.save(matRepo.create(nuevo as DeepPartial<Materia>));
      } else {
        let changed = false;
        if ((mat as any).nombre !== nombre) { (mat as any).nombre = nombre; changed = true; }
        if ('creditos' in mat && (mat as any).creditos !== creditos) { (mat as any).creditos = creditos; changed = true; }
        if (changed) await matRepo.save(mat);
      }

      // prerrequisito si existe
      let prereq: Materia | null = null;
      if (prereqClave) {
        prereq = await matRepo.findOne({ where: [{ codigo: prereqClave }, { clave: prereqClave }] as any });
      }

      // Garantiza que TS sepa que mat no es null
      if (!mat) throw new Error('Materia no resuelta tras upsert');

      // where dinámico para PlanMalla existente
      const where: any = {};
      if ('plan_estudio' in mallaRepo.metadata.propertiesMap) where.plan_estudio = { id: (plan as any).id };
      else if ('planEstudio' in mallaRepo.metadata.propertiesMap) where.planEstudio = { id: (plan as any).id };
      else where.plan = { id: (plan as any).id };
      where.materia = { id: mat.id };

      let pm = await mallaRepo.findOne({ where });

      if (!pm) {
        const createObj: any = {};
        setPlanRef(createObj, plan);
        setMateriaRef(createObj, mat);
        setSemestreSugerido(createObj, 0); // no viene en PDF
        setPrereqRef(createObj, prereq ?? null);

        pm = mallaRepo.create(createObj as DeepPartial<PlanMalla>);
      } else {
        // actualizar sólo el prerequisito
        setPrereqRef(pm as any, prereq ?? null);
      }

      await mallaRepo.save(pm);
      upserts++;
    }

    // 3) Validaciones y auditoría
    await escribirValidaciones(
      ac.id,
      (warnings || []).map((w: string) => ({
        severidad: 'WARNING' as const,
        codigo: 'PARSER_WARN',
        descripcion: w
      }))
    );

    await logAuditoria(ac.id, 'PROCESS', 'OK', `Materias procesadas/actualizadas=${upserts}`);

    ac.estado_proceso = 'COMPLETADO';
    await repoAC.save(ac);

    return res.json({ archivoId: ac.id, upserts, warnings });
  } catch (e: any) {
    await logAuditoria(archivoId, 'PROCESS', 'ERROR', e?.stack || e?.message);
    // best-effort
    try {
      const repoAC2 = AppDataSource.getRepository(ArchivoCargado);
      const ac2 = await repoAC2.findOne({ where: { id: archivoId } });
      if (ac2) { ac2.estado_proceso = 'ERROR'; await repoAC2.save(ac2); }
    } catch { /* ignore */ }

    return res.status(500).json({ error: 'Error al procesar materias/plan', detail: e?.message });
  }
};
