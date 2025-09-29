import { DataSource } from 'typeorm';
import { Profesor } from '../entities';
import { repo as R } from './common';
import { AsignacionProfesor } from '../entities';

export async function getByNumeroEmpleado(ds: DataSource, num: number) {
  return await R(ds, Profesor).findOne({ where: { num_empleado: num } as any });
}
export async function gruposPorProfesor(ds: DataSource, profesorId: number, periodo?: string) {
  const qb = R(ds, AsignacionProfesor).createQueryBuilder("ap")
    .leftJoinAndSelect("ap.grupo", "g")
    .leftJoinAndSelect("g.materia", "m")
    .leftJoinAndSelect("g.periodo", "p")
    .where("ap.profesor_id = :id", { id: profesorId });
  if (periodo) qb.andWhere("p.etiqueta = :per", { per: periodo });
  return await qb.orderBy("m.codigo", "ASC").getMany();
}