import { DataSource } from 'typeorm';
import { Materia } from '../entities';
import { repo as R } from './common';
import { Grupo } from '../entities';

export async function getByCodigo(ds: DataSource, codigo: string) {
  return await R(ds, Materia).findOne({ where: { codigo } as any });
}
export async function buscar(ds: DataSource, q: string, tipo: "OBLIGATORIA"|"OPTATIVA"|undefined, p: number, limit: number) {
  const qb = R(ds, Materia).createQueryBuilder("m");
  if (q) qb.where("(m.codigo ILIKE :q OR m.nombre ILIKE :q)", { q: `%${q}%` });
  if (tipo) qb.andWhere("m.tipo = :t", { t: tipo });
  qb.orderBy("m.codigo", "ASC").skip((p - 1) * limit).take(limit);
  const [data, total] = await qb.getManyAndCount();
  return { data, total };
}

export async function gruposPorMateria(ds: DataSource, codigo: string, periodo?: string) {
  const qb = R(ds, Grupo).createQueryBuilder("g")
    .leftJoinAndSelect("g.materia", "m")
    .leftJoinAndSelect("g.periodo", "p")
    .where("m.codigo = :codigo", { codigo });
  if (periodo) qb.andWhere("p.etiqueta = :per", { per: periodo });
  return await qb.orderBy("g.clave_grupo", "ASC").getMany();
}