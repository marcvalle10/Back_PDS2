import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { AppDataSource } from '../data-source';
import { parseKardexWithUserReader } from './kardex.fileReader.adapter';
import { KardexResumen } from '../entities/KardexResumen';

import { AuditoriaCargas } from '../entities/AuditoriaCargas';
import { ValidacionResultado } from '../entities/ValidacionResultado';
import { ArchivoCargado } from '../entities/ArchivoCargado';
import { Alumno } from '../entities/Alumno';
import { Periodo } from '../entities/Periodo';
import { Materia } from '../entities/Materia';
import { Kardex } from '../entities/Kardex';
import type { DeepPartial } from 'typeorm';

const logAuditoria = async (
  archivoId: number,
  etapa: string,
  estado: string,
  detalle?: string
) => {
  const repo = AppDataSource.getRepository(AuditoriaCargas);
  // Usa relación `archivo` si existe; si no, usa `archivo_id`
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
    const r: any = {
      severidad: m.severidad,
      regla_codigo: m.codigo,
      descripcion: m.descripcion,
      fila_origen: m.fila,
    };
    if ('archivo' in repo.metadata.propertiesMap) r.archivo = { id: archivoId };
    else r.archivo_id = archivoId;
    return r;
  });

  await repo.save(rows);
};

// POST /archivo-cargas/kardex/pdf
export const postKardexPdf = (baseDir: string) => async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Falta archivo "file" (multipart).' });

    // 1) calcular hash del archivo subido
    const fullPath = path.resolve(req.file.path);
    const pdf = await fs.readFile(fullPath);
    const hash = crypto.createHash('sha256').update(pdf).digest('hex');

    // 2) renombrar a <hash>.pdf (idempotencia)
    const finalPath = path.join(baseDir, `${hash}.pdf`);
    await fs.rename(fullPath, finalPath).catch(async () => {
      // si ya existe, borrar el temporal
      await fs.unlink(fullPath).catch(() => void 0);
    });

    // 3) insertar archivo_cargado
const repoAC = AppDataSource.getRepository(ArchivoCargado);

const payload: any = {
  tipo: 'KARDEX_PDF',
  estado_proceso: 'PENDIENTE',
  hash,
};
// nombre de archivo tolerante a distintos nombres de columna
if ('nombre_archivo' in repoAC.metadata.propertiesMap) payload.nombre_archivo = req.file.originalname;
else if ('nombreArchivo' in repoAC.metadata.propertiesMap) payload.nombreArchivo = req.file.originalname;
else if ('original_filename' in repoAC.metadata.propertiesMap) payload.original_filename = req.file.originalname;

if ('usuario' in repoAC.metadata.propertiesMap) {
  payload.usuario = (req as any).user?.email ?? 'anon';
}

// ⚠️ Corrección: tipar como entidad única
const entity = repoAC.create(payload as DeepPartial<ArchivoCargado>);
const ac: ArchivoCargado = await repoAC.save(entity);

await logAuditoria(ac.id, 'UPLOAD', 'OK', `PDF ${req.file.originalname} (${hash})`);
return res.status(201).json({ archivoId: ac.id, estado: ac.estado_proceso, hash });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error subiendo PDF' });
  }
};

// POST /archivo-cargas/kardex/process/:archivoId
export const processKardexArchivo = (baseDir: string) => async (req: Request, res: Response) => {
  const archivoId = Number(req.params.archivoId);
  if (!archivoId) return res.status(400).json({ error: 'archivoId inválido' });

  const repoAC = AppDataSource.getRepository(ArchivoCargado);
  const ac = await repoAC.findOne({ where: { id: archivoId } });
  if (!ac) return res.status(404).json({ error: 'archivo_cargado no encontrado' });

  try {
    ac.estado_proceso = 'EN_PROCESO';
    await repoAC.save(ac);

    const filePath = path.join(baseDir, `${ac.hash}.pdf`);
    // 1) Parsear usando TU lector (pasamos ruta del PDF)
    const { rows, warnings, meta, resumen } = await parseKardexWithUserReader(filePath);

    // 2) Resolver alumno (por expediente o matrícula)
    const aluRepo = AppDataSource.getRepository(Alumno);
    let alumno: Alumno | null = null;
    if (meta?.expediente) {
      alumno = await aluRepo.findOne({
        where: [
          { expediente: String(meta.expediente) } as any,
          { matricula: String(meta.expediente) } as any,
        ]
      });
    }

    const validations: {severidad:'INFO'|'WARNING'|'ERROR', codigo:string, descripcion:string, fila?:string}[] = [];
    if (!alumno) {
      validations.push({ severidad: 'ERROR', codigo: 'ALU_NOT_FOUND', descripcion: 'No se pudo resolver el alumno por expediente/matrícula del PDF.' });
    }

    // 3) Cache y “upsert” ligero de periodos por etiqueta (ej. "2232", "2241")
    const perRepo = AppDataSource.getRepository(Periodo);
    const perCache: Map<string, Periodo> = new Map();

    const getPeriodo = async (etiqueta: string): Promise<Periodo | null> => {
      if (!etiqueta) return null;

      if (perCache.has(etiqueta)) {
        return perCache.get(etiqueta)!;
      }

      let p = await perRepo.findOne({ where: { etiqueta } });
      if (!p) {
        const base: Partial<Periodo> = { etiqueta };
        if ('nombre' in perRepo.metadata.propertiesMap) {
          (base as any).nombre = etiqueta;
        }
        p = perRepo.create(base as DeepPartial<Periodo>);
        p = await perRepo.save(p);
      }

      perCache.set(etiqueta, p);
      return p;
    };

    // 4) Resolver materia por código e insertar en Kardex
    const matRepo = AppDataSource.getRepository(Materia);
    const kxRepo = AppDataSource.getRepository(Kardex);

    let inserted = 0;
    for (const r of rows) {
      const codigoCanon = r.materia_codigo.replace(/\s+/g, ''); // "08 6890" → "086890"
      const materia = await matRepo.findOne({
        where: [
          { codigo: codigoCanon } as any,
          { codigo: r.materia_codigo } as any
        ]
      });
      if (!materia) {
        validations.push({ severidad: 'WARNING', codigo: 'MAT_NOT_FOUND', descripcion: `No se encontró materia para código "${r.materia_codigo}" (${r.materia_nombre}).` });
        continue;
      }

      const periodo = r.periodo ? await getPeriodo(r.periodo) : null;
      if (!alumno || !periodo) {
        validations.push({ severidad: 'ERROR', codigo: 'ROW_SKIP', descripcion: `Fila omitida por falta de alumno/periodo (${r.materia_codigo}).` });
        continue;
      }

      // Evitar duplicado por unique(alumno, materia, periodo)
      const exists = await kxRepo.findOne({
        where: {
          alumno: { id: alumno.id },
          materia: { id: materia.id },
          periodo: { id: periodo.id }
        } as any
      });

      if (exists) {
        exists.calificacion = (r.calificacion ?? exists.calificacion) as any;
        exists.estatus = (r.estatus ?? exists.estatus) as any;
        await kxRepo.save(exists);
        continue;
      }

      const k = kxRepo.create({
        alumno,                 // relación
        materia,                // relación
        periodo,                // relación
        calificacion: r.calificacion as any,
        estatus: (r.estatus || 'APROBADA') as any,
      } as DeepPartial<Kardex>);

      // Campos opcionales si existen en tu entity
      if ('promedio_kardex' in k) (k as any).promedio_kardex = 0;
      if ('promedio_sem_act' in k) (k as any).promedio_sem_act = 0;

      await kxRepo.save(k);
      inserted++;
    }

    // 5) guardar resumen del kardex (si vino del parser)
    try {
      const kxResRepo = AppDataSource.getRepository(KardexResumen);
      const r = (resumen as any) || {};
      // r.promedios: { "<periodo>": 83.12, kardex: 86.4 }
      // r.creditos: { APR, REP, INS }
      // r.materias: { APR, REP, NMR, INS }
      const periodo = r?.promedios ? Object.keys(r.promedios).find((k: string) => k !== 'kardex') : null;
      const promedio_periodo = periodo ? Number(r.promedios[periodo]) : null;
      const promedio_kardex = r?.promedios?.kardex != null ? Number(r.promedios.kardex) : null;

      const entity = kxResRepo.create({
        archivo: ac,
        alumno: alumno ?? null,
        periodo: periodo ?? null,
        promedio_periodo,
        promedio_kardex,
        creditos_apr: r?.creditos?.APR ?? null,
        creditos_rep: r?.creditos?.REP ?? null,
        creditos_ins: r?.creditos?.INS ?? null,
        materias_apr: r?.materias?.APR ?? null,
        materias_rep: r?.materias?.REP ?? null,
        materias_nmr: r?.materias?.NMR ?? null,
        materias_ins: r?.materias?.INS ?? null
      });
      await kxResRepo.save(entity);
    } catch { /* opcional: log */ }

    // 6) guardar validaciones + auditoría
    await escribirValidaciones(ac.id, validations);
    for (const w of warnings) {
      await escribirValidaciones(ac.id, [{ severidad: 'WARNING', codigo: 'PARSER_WARN', descripcion: w }]);
    }
    await logAuditoria(ac.id, 'PROCESS', 'OK', `Insertadas=${inserted}, Warnings=${warnings.length}, Validaciones=${validations.length}`);

    ac.estado_proceso = 'COMPLETADO';
    await repoAC.save(ac);

    return res.json({ archivoId: ac.id, inserted, warnings, validations: validations.length, meta, resumen });
  } catch (e: any) {
    await logAuditoria(archivoId, 'PROCESS', 'ERROR', e?.stack || e?.message);
    ac.estado_proceso = 'ERROR';
    await repoAC.save(ac);
    return res.status(500).json({ error: 'Error al procesar el kardex', detail: e?.message });
  }
};

