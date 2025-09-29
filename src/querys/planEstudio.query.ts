import { DataSource } from "typeorm";
import { Materia } from "../entities";
import { repo as R } from "./common";

export async function materiasDePlan(ds: DataSource, planId: number, tipo?: "OBLIGATORIA"|"OPTATIVA") {
  const qb = R(ds, Materia).createQueryBuilder("m")
    .where("m.plan_estudio_id = :id", { id: planId });
  if (tipo) qb.andWhere("m.tipo = :tipo", { tipo });
  return await qb.orderBy("m.codigo", "ASC").getMany();
}
