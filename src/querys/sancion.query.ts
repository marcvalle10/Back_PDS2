import { DataSource } from 'typeorm';
import { Sancion } from '../entities';
import { repo as R } from './common';

// (ajusta filtro exacto si en tu main usabas otro)
export async function getByProfesor(ds: DataSource, profesorId: number) {
  return await R(ds, Sancion).find({
    where: { profesor: { id: profesorId } } as any,
    order: { fecha: 'DESC' } as any,
  });
}
export async function buscar(ds: DataSource, f: { alumno_id?: number; profesor_id?: number; desde?: string; hasta?: string; }) {
  const qb = R(ds, Sancion).createQueryBuilder("s");
  if (f.alumno_id) qb.andWhere("s.alumno_id = :a", { a: f.alumno_id });
  if (f.profesor_id) qb.andWhere("s.profesor_id = :p", { p: f.profesor_id });
  if (f.desde) qb.andWhere("s.fecha >= :d", { d: f.desde });
  if (f.hasta) qb.andWhere("s.fecha <= :h", { h: f.hasta });
  return await qb.orderBy("s.fecha", "DESC").getMany();
}