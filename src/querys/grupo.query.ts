import { DataSource } from "typeorm";
import { Grupo, Horario, AsignacionProfesor } from "../entities";
import { repo as R } from "./common";

export async function oferta(ds: DataSource, periodo?: string, codigo?: string) {
  const qb = R(ds, Grupo).createQueryBuilder("g")
    .leftJoinAndSelect("g.materia", "m")
    .leftJoinAndSelect("g.periodo", "p");
  if (periodo) qb.andWhere("p.etiqueta = :per", { per: periodo });
  if (codigo) qb.andWhere("m.codigo = :cod", { cod: codigo });
  return await qb.orderBy("m.codigo", "ASC").getMany();
}

export async function horariosByGrupoId(ds: DataSource, grupoId: number) {
  return await R(ds, Horario).find({ where: { grupo_id: grupoId } as any });
}

export async function profesoresAsignados(ds: DataSource, grupoId: number) {
  return await R(ds, AsignacionProfesor).createQueryBuilder("ap")
    .leftJoinAndSelect("ap.profesor", "pr")
    .where("ap.grupo_id = :id", { id: grupoId })
    .getMany();
}

export async function horariosByClave(ds: DataSource, clave: string) {
  const g = await R(ds, Grupo).findOne({ where: { clave_grupo: clave } as any });
  if (!g) return null;
  const rows = await R(ds, Horario).find({ where: { grupo_id: (g as any).id } as any });
  return rows;
}
