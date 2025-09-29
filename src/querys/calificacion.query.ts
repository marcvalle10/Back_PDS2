import { DataSource, DeepPartial } from 'typeorm';
import { Calificacion, Kardex } from '../entities';
import { repo as R, toStr } from './common';

// Upsert de calificación para un renglón de kardex
export async function upsertCalificacion(
  ds: DataSource,
  kardexId: number,
  vals: { ordinario?: unknown; extraordinario?: unknown; final?: unknown }
) {
  const repoK = R(ds, Kardex);
  const repoC = R(ds, Calificacion);

  const k = await repoK.findOne({
    where: { id: kardexId } as any,
    relations: ['materia'],
  });
  if (!k) throw new Error('Kardex no encontrado');

  let c = await repoC.findOne({ where: { kardex: { id: k.id } } as any });

  if (!c) {
    const payload: DeepPartial<Calificacion> = {
      kardex: { id: k.id } as any,
      materia: { id: k.materia.id } as any,
      ordinario: toStr(vals.ordinario),
      extraordinario: toStr(vals.extraordinario),
      final: toStr(vals.final),
      fecha_cierre: new Date() as any,
    };
    c = repoC.create(payload);
  } else {
    if (vals.ordinario !== undefined) (c as any).ordinario = String(vals.ordinario);
    if (vals.extraordinario !== undefined) (c as any).extraordinario = String(vals.extraordinario);
    if (vals.final !== undefined) (c as any).final = String(vals.final);
    (c as any).fecha_cierre = new Date();
  }

  return await repoC.save(c as DeepPartial<Calificacion>);
}
