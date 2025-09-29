import { DataSource } from "typeorm";
import { Periodo } from "../entities";
import { repo as R } from "./common";

export async function getByEtiqueta(ds: DataSource, etiqueta: string) {
  return await R(ds, Periodo).findOne({ where: { etiqueta } as any });
}

export async function getActual(ds: DataSource) {
  const hoy = new Date().toISOString().slice(0, 10);
  return await R(ds, Periodo).createQueryBuilder("p")
    .where("p.fecha_inicio <= :hoy", { hoy })
    .andWhere("p.fecha_fin >= :hoy", { hoy })
    .orderBy("p.anio", "DESC").addOrderBy("p.ciclo", "DESC")
    .getOne();
}

export async function getProximos(ds: DataSource, n: number) {
  const hoy = new Date().toISOString().slice(0, 10);
  return await R(ds, Periodo).createQueryBuilder("p")
    .where("p.fecha_inicio > :hoy", { hoy })
    .orderBy("p.fecha_inicio", "ASC")
    .limit(n).getMany();
}
