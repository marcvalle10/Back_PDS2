import { DataSource } from 'typeorm';
import { Kardex, Materia, Periodo } from '../entities';
import { repo as R } from './common';
import { Alumno } from "../entities";
import { Inscripcion } from "../entities";
import { OptativaProgreso } from '../entities';



// /alumno/:id/avance  -> { creditos_aprobados, promedio }
export async function getAvance(ds: DataSource, alumnoId: number) {
  const r1 = await R(ds, Kardex)
    .createQueryBuilder('k')
    .select('COALESCE(SUM(m.creditos),0)', 'sum')
    .leftJoin('k.materia', 'm')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere("k.estatus ILIKE 'ACREDIT%'") 
    .getRawOne<{ sum: string }>();

  const r2 = await R(ds, Kardex)
    .createQueryBuilder('k')
    .select('ROUND(AVG(k.calificacion)::numeric,2)', 'prom')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere('k.calificacion IS NOT NULL')
    .getRawOne<{ prom: string }>();

  return {
    alumno_id: alumnoId,
    creditos_aprobados: Number(r1?.sum ?? 0),
    promedio: r2?.prom != null ? Number(r2.prom) : null,
  };
}

// /alumno/:id/creditos-por-tipo
export async function getCreditosPorTipo(ds: DataSource, alumnoId: number) {
  const obl = await R(ds, Kardex)
    .createQueryBuilder('k')
    .select('COALESCE(SUM(m.creditos),0)', 'sum')
    .leftJoin('k.materia', 'm')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere("k.estatus ILIKE 'ACREDIT%'")
    .andWhere("m.tipo = 'OBLIGATORIA'")
    .getRawOne<{ sum: string }>();

  const opt = await R(ds, Kardex)
    .createQueryBuilder('k')
    .select('COALESCE(SUM(m.creditos),0)', 'sum')
    .leftJoin('k.materia', 'm')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere("k.estatus ILIKE 'ACREDIT%'")
    .andWhere("m.tipo = 'OPTATIVA'")
    .getRawOne<{ sum: string }>();

  return {
    alumno_id: alumnoId,
    obligatorias_aprobadas: Number(obl?.sum ?? 0),
    optativas_aprobadas: Number(opt?.sum ?? 0),
  };
}

// /alumno/:id/kardex/periodo/:periodoId
export async function getKardexPorPeriodo(
  ds: DataSource,
  alumnoId: number,
  periodoId: number
) {
  return await R(ds, Kardex)
    .createQueryBuilder('k')
    .leftJoinAndSelect('k.materia', 'm')
    .leftJoinAndSelect('k.periodo', 'p')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere('k.periodo_id = :p', { p: periodoId })
    .orderBy('m.codigo', 'ASC')
    .getMany();
}

// /alumno/:id/kardex/materia/:materiaId
export async function getHistorialMateria(
  ds: DataSource,
  alumnoId: number,
  materiaId: number
) {
  return await R(ds, Kardex)
    .createQueryBuilder('k')
    .leftJoinAndSelect('k.materia', 'm')
    .leftJoinAndSelect('k.periodo', 'p')
    .where('k.alumno_id = :id', { id: alumnoId })
    .andWhere('k.materia_id = :m', { m: materiaId })
    .orderBy('p.anio', 'DESC')
    .addOrderBy('p.ciclo', 'DESC')
    .getMany();
}

/** Alumno por matrícula */
export async function getByMatricula(ds: DataSource, matricula: string) {
  return await R(ds, Alumno).findOne({ where: { matricula } as any });
}

/** Inscripciones de un alumno (con periodo) */
export async function getInscripciones(ds: DataSource, alumnoId: number) {
  return await R(ds, Inscripcion)
    .createQueryBuilder("i")
    .leftJoinAndSelect("i.periodo", "p")
    .where("i.alumno_id = :id", { id: alumnoId })
    .orderBy("p.anio", "DESC")
    .addOrderBy("p.ciclo", "DESC")
    .getMany();
}
export async function getKardex(ds: DataSource, alumnoId: number) {
  return await R(ds, Kardex).createQueryBuilder("k")
    .leftJoinAndSelect("k.materia", "m")
    .leftJoinAndSelect("k.periodo", "p")
    .where("k.alumno_id = :id", { id: alumnoId })
    .orderBy("p.anio", "DESC").addOrderBy("p.ciclo", "DESC")
    .getMany();
}

export async function getKardexPorPeriodoEtiqueta(
  ds: DataSource, alumnoId: number, etiqueta: string
) {
  return await R(ds, Kardex).createQueryBuilder("k")
    .leftJoinAndSelect("k.materia", "m")
    .leftJoinAndSelect("k.periodo", "p")
    .where("k.alumno_id = :id", { id: alumnoId })
    .andWhere("p.etiqueta = :et", { et: etiqueta })
    .orderBy("m.codigo", "ASC")
    .getMany();
}

/** Buscar alumnos con paginación */
export async function buscar(
  ds: DataSource, q: string, p: number, limit: number
) {
  const qb = R(ds, Alumno).createQueryBuilder("a");

  const term = (q || "").trim();
  if (term) {
    qb.where(
      `(a.nombre ILIKE :q OR a.apellido_paterno ILIKE :q OR a.apellido_materno ILIKE :q OR a.matricula ILIKE :q)`,
      { q: `%${term}%` }
    );
  }

  const page = Math.max(1, Number(p || 1));
  const size = Math.max(1, Math.min(100, Number(limit || 20)));

  qb.orderBy("a.apellido_paterno", "ASC")
    .addOrderBy("a.apellido_materno", "ASC")
    .addOrderBy("a.nombre", "ASC")
    .skip((page - 1) * size)
    .take(size);

  const [data, total] = await qb.getManyAndCount();
  return { data, total };
}

/** Avance de optativas (cursados vs requeridos) */
export async function avanceOptativas(ds: DataSource, alumnoId: number) {
  const raw = await R(ds, Kardex)
    .createQueryBuilder("k")
    .select("COALESCE(SUM(m.creditos), 0)", "sum")
    .leftJoin("k.materia", "m")
    .where("k.alumno_id = :id", { id: alumnoId })
    .andWhere("k.estatus ILIKE 'ACREDIT%'")
    .andWhere("m.tipo = 'OPTATIVA'")
    .getRawOne();

  const cursados = Number((raw as any)?.sum ?? 0);

  const prog = await R(ds, OptativaProgreso).findOne({
    where: { alumno_id: alumnoId } as any,
  });
  const req = Number(prog?.creditos_optativos_requeridos ?? 0);

  return {
    alumno_id: alumnoId,
    creditos_optativos_cursados: cursados,
    creditos_optativos_requeridos: req,
    restante: Math.max(0, req - cursados),
  };
}