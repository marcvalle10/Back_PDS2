import { DataSource, DeepPartial } from 'typeorm';
import { Kardex } from '../entities';
import { repo as R } from './common';

// POST crear renglón de kardex (usa body tal como venía en main)
export async function createRow(ds: DataSource, payload: DeepPartial<Kardex>) {
  const repo = R(ds, Kardex);
  const k = repo.create(payload);
  return await repo.save(k);
}
export async function crearPorIds(
  ds: DataSource,
  payload: DeepPartial<Kardex> & { alumno_id: number; materia_id: number; periodo_id: number; }
) {
  const k = R(ds, Kardex).create({
    alumno_id: payload.alumno_id,
    materia_id: payload.materia_id,
    periodo_id: payload.periodo_id,
    estatus: (payload as any).estatus,
    calificacion: (payload as any).calificacion ?? null,
  } as any);
  return await R(ds, Kardex).save(k);
}