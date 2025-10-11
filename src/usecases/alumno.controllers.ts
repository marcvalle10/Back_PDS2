import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Alumno } from '../entities/Alumno';
import { Kardex } from '../entities/Kardex';
import { Materia } from '../entities/Materia';
import { Periodo } from '../entities/Periodo';
import { PlanEstudio } from '../entities/PlanEstudio';
import { PlanMalla } from '../entities/PlanMalla'; // la entidad la añado abajo

// Helpers --------------------------------------------------------------

const findPlanEstudioForAlumno = async (alumno: Alumno) => {
  // Soporta distintos nombres de relación/campo (planEstudio | plan_estudio | plan)
  const aluRepo = AppDataSource.getRepository(Alumno);

  // Si ya viene cargado:
  const anyAlu: any = alumno as any;
  if (anyAlu.planEstudio || anyAlu.plan_estudio || anyAlu.plan) {
    return (anyAlu.planEstudio || anyAlu.plan_estudio || anyAlu.plan) as PlanEstudio;
  }

  // Recargar con posibles relaciones
  const a = await aluRepo.findOne({
    where: { id: alumno.id },
    relations: ['planEstudio', 'plan_estudio', 'plan']
  });

  const aa: any = a;
  return (aa?.planEstudio || aa?.plan_estudio || aa?.plan) as PlanEstudio | undefined;
};

const getPeriodoActualEtiqueta = async (): Promise<string | null> => {
  const perRepo = AppDataSource.getRepository(Periodo);
  const all = await perRepo.find();
  if (!all.length) return null;
  // asume etiqueta como "2252", "2241", etc.
  const etiquetas = all
    .map((p: any) => String(p.etiqueta || p.nombre || ''))
    .filter(Boolean)
    .sort(); // lexicográfico funciona para 22xx, 23xx, 24xx...
  return etiquetas.length ? etiquetas[etiquetas.length - 1] : null;
};

const getPromedioGlobal = async (alumnoId: number) => {
  // promedio de calificaciones numéricas asentadas
  const kRepo = AppDataSource.getRepository(Kardex);
  const rows = await kRepo.find({
    where: { alumno: { id: alumnoId } as any }
  });
  const nums = rows
    .map((r: any) => typeof r.calificacion === 'number' ? Number(r.calificacion) : NaN)
    .filter((n) => !Number.isNaN(n));
  const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
  return Number(avg.toFixed(2));
};

const getPromedioDePeriodo = async (alumnoId: number, etiqueta: string) => {
  const kRepo = AppDataSource.getRepository(Kardex);
  const pRepo = AppDataSource.getRepository(Periodo);
  const per = await pRepo.findOne({ where: { etiqueta } });
  if (!per) return 0;

  const rows = await kRepo.find({
    where: { alumno: { id: alumnoId } as any, periodo: { id: per.id } as any }
  });
  const nums = rows
    .map((r: any) => typeof r.calificacion === 'number' ? Number(r.calificacion) : NaN)
    .filter((n) => !Number.isNaN(n));
  const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
  return Number(avg.toFixed(2));
};

const getUltimoPeriodoConNotas = async (alumnoId: number): Promise<string | null> => {
  // Detecta TODOS los periodos del alumno con alguna calificación numérica asentada; toma el antecedente al "actual".
  const kRepo = AppDataSource.getRepository(Kardex);
  const pRepo = AppDataSource.getRepository(Periodo);

  const rows = await kRepo.find({ where: { alumno: { id: alumnoId } as any }, relations: ['periodo'] });
  const etiquetas = Array.from(
    new Set(
      rows
        .filter((r: any) => r.periodo && typeof r.calificacion === 'number')
        .map((r: any) => String(r.periodo.etiqueta || ''))
        .filter(Boolean)
    )
  ).sort();

  if (!etiquetas.length) return null;
  const actual = await getPeriodoActualEtiqueta();
  // si el actual aparece y hay uno anterior, usa el anterior; si no, usa el último disponible
  const idx = etiquetas.indexOf(actual || '');
  if (idx > 0) return etiquetas[idx - 1];
  return etiquetas[etiquetas.length - 1];
};

const getCreditosAprobados = async (alumnoId: number) => {
  const kRepo = AppDataSource.getRepository(Kardex);
  const mRepo = AppDataSource.getRepository(Materia);
  const rows = await kRepo.find({
    where: { alumno: { id: alumnoId } as any },
    relations: ['materia']
  });

  let suma = 0;
  for (const r of rows as any[]) {
    const est = String(r.estatus || '').toUpperCase();
    const passed = est === 'APROBADA' || est === 'ACREDITADA';
    if (passed) {
      const mat: any = r.materia;
      const c = Number(mat?.creditos ?? 0);
      if (!Number.isNaN(c)) suma += c;
    }
  }
  return suma;
};

// AR3 – Header con KPIs -----------------------------------------------

export const getResumenAlumno = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const aluRepo = AppDataSource.getRepository(Alumno);
  const alumno = await aluRepo.findOne({ where: { id } });
  if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });

  // promedio global
  const promedio_global = await getPromedioGlobal(id);

  // promedio semestre anterior
  const etiquetaPrev = await getUltimoPeriodoConNotas(id);
  const promedio_sem_anterior = etiquetaPrev ? await getPromedioDePeriodo(id, etiquetaPrev) : 0;

  // créditos y porcentaje
  const creditos = await getCreditosAprobados(id);
  const plan = await findPlanEstudioForAlumno(alumno);
  const totalPlan = Number((plan as any)?.total_creditos ?? (plan as any)?.totalCreditos ?? 0);
  const porcentaje = totalPlan ? Number(((creditos / totalPlan) * 100).toFixed(2)) : 0;

  // flags (parametrizados por ENV o defaults)
  const SS_PCT_MIN = Number(process.env.SS_CREDITOS_MIN_PCT ?? 0.7);
  const PP_PCT_MIN = Number(process.env.PP_CREDITOS_MIN_PCT ?? 0.6);
  const puede_servicio = totalPlan ? (creditos / totalPlan) >= SS_PCT_MIN : false;
  const puede_practicas = totalPlan ? (creditos / totalPlan) >= PP_PCT_MIN : false;

  // nivel de inglés
  const nivel_ingles = (alumno as any).nivel_ingles_actual ?? (alumno as any).nivelInglesActual ?? null;

  return res.json({
    promedio_global,
    promedio_sem_anterior,
    creditos,
    porcentaje,
    puede_servicio,
    puede_practicas,
    nivel_ingles
  });
};

// AR6 – Nivel de inglés ------------------------------------------------

export const getInglesAlumno = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const aluRepo = AppDataSource.getRepository(Alumno);
  const alumno = await aluRepo.findOne({ where: { id } });
  if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });

  const nivel_actual = (alumno as any).nivel_ingles_actual ?? (alumno as any).nivelInglesActual ?? 0;
  const estrellas_total = Number(process.env.INGLES_ESTRELLAS_TOTAL ?? 5);
  const estrellas_llenas = Math.max(0, Math.min(estrellas_total, Number(nivel_actual) || 0));
  const extras = {
    plan_requerido: Number(process.env.INGLES_REQUERIDO ?? 5),
  };

  return res.json({ nivel_actual, estrellas_total, estrellas_llenas, extras });
};

// AR7 – Elegibilidad ---------------------------------------------------

export const getElegibilidadAlumno = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const aluRepo = AppDataSource.getRepository(Alumno);
  const alumno = await aluRepo.findOne({ where: { id } });
  if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });

  const plan = await findPlanEstudioForAlumno(alumno);
  const totalPlan = Number((plan as any)?.total_creditos ?? (plan as any)?.totalCreditos ?? 0);

  const promedio_global = await getPromedioGlobal(id);
  const creditos = await getCreditosAprobados(id);

  // Umbrales (ENV con defaults razonables)
  const SS_PCT_MIN = Number(process.env.SS_CREDITOS_MIN_PCT ?? 0.7);
  const PP_PCT_MIN = Number(process.env.PP_CREDITOS_MIN_PCT ?? 0.6);
  const MOV_CREDITOS_MIN = Number(process.env.MOV_CREDITOS_MIN ?? 80);
  const MOV_PROMEDIO_MIN = Number(process.env.MOV_PROMEDIO_MIN ?? 85);

  const pct = totalPlan ? (creditos / totalPlan) : 0;

  const motivos: string[] = [];
  const servicio_social = totalPlan ? pct >= SS_PCT_MIN : false;
  if (!servicio_social) motivos.push(`Servicio Social: se requiere ${(SS_PCT_MIN*100).toFixed(0)}% de créditos del plan.`);

  const practicas = totalPlan ? pct >= PP_PCT_MIN : false;
  if (!practicas) motivos.push(`Prácticas: se requiere ${(PP_PCT_MIN*100).toFixed(0)}% de créditos del plan.`);

  const movilidad = (creditos >= MOV_CREDITOS_MIN) && (promedio_global >= MOV_PROMEDIO_MIN);
  if (!movilidad) {
    if (creditos < MOV_CREDITOS_MIN) motivos.push(`Movilidad: se requieren ≥ ${MOV_CREDITOS_MIN} créditos.`);
    if (promedio_global < MOV_PROMEDIO_MIN) motivos.push(`Movilidad: promedio ≥ ${MOV_PROMEDIO_MIN}.`);
  }

  return res.json({
    servicio_social,
    practicas,
    movilidad,
    motivos
  });
};

// AR4/5 – Malla (faltantes, colores) ----------------------------------

/**
 * Reglas de color:
 * - 'cursada'   → existe kardex con estatus APROBADA o ACREDITADA
 * - 'reprobada' → existe kardex con estatus REPROBADA (y no hay aprobada)
 * - 'inscrita'  → en periodo actual con calificación null o estatus tipo INS/EN_CURSO
 * - 'pendiente' → sin registros
 */
export const getMallaAlumno = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const semestre = req.query.semestre ? Number(req.query.semestre) : undefined;
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const aluRepo = AppDataSource.getRepository(Alumno);
  const mallaRepo = AppDataSource.getRepository(PlanMalla);
  const kRepo = AppDataSource.getRepository(Kardex);
  const perRepo = AppDataSource.getRepository(Periodo);

  const alumno = await aluRepo.findOne({ where: { id } });
  if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });

  const plan = await findPlanEstudioForAlumno(alumno);
  if (!plan) return res.status(400).json({ error: 'alumno sin plan de estudio' });

  const where: any = { plan_estudio: { id: (plan as any).id } };
  if (semestre) where.semestre_sugerido = semestre;

  const malla = await mallaRepo.find({
    where,
    relations: ['materia', 'prerrequisito']
  });

  const periodoActual = await getPeriodoActualEtiqueta();
  let perActual: Periodo | null = null;
  if (periodoActual) perActual = await perRepo.findOne({ where: { etiqueta: periodoActual } });

  // Pre-carga kardex del alumno
  const kx = await kRepo.find({
    where: { alumno: { id } as any },
    relations: ['materia', 'periodo']
  });

  const resp = malla.map((pm: any) => {
    const mat = pm.materia;
    const deMat = kx.filter((r) => r.materia?.id === mat.id);

    let estadoColor: 'cursada'|'reprobada'|'inscrita'|'pendiente' = 'pendiente';
    let periodo: string | undefined;

    const aprob = deMat.find((r) => String(r.estatus).toUpperCase() === 'APROBADA' || String(r.estatus).toUpperCase() === 'ACREDITADA');
    const reprob = deMat.find((r) => String(r.estatus).toUpperCase() === 'REPROBADA');
    const inscrita = deMat.find((r) => {
      const est = String(r.estatus || '').toUpperCase();
      const enCurso = est === 'INSCRITA' || est === 'INS' || est === 'EN_CURSO';
      const sinCalif = r.calificacion == null;
      const matchPeriodo = perActual ? (r.periodo?.id === perActual.id) : false;
      return enCurso || (sinCalif && matchPeriodo);
    });

    if (aprob) { estadoColor = 'cursada'; periodo = String(aprob.periodo?.etiqueta || ''); }
    else if (inscrita) { estadoColor = 'inscrita'; periodo = String(inscrita.periodo?.etiqueta || ''); }
    else if (reprob) { estadoColor = 'reprobada'; periodo = String(reprob.periodo?.etiqueta || ''); }
    else { estadoColor = 'pendiente'; }

    return {
      materia_id: mat.id,
      clave: mat.codigo ?? mat.clave ?? '',
      nombre: mat.nombre ?? '',
      semestre_sugerido: pm.semestre_sugerido,
      estadoColor,
      periodo,
      prerrequisito_id: pm.prerrequisito?.id ?? null
    };
  });

  res.json(resp);
};
