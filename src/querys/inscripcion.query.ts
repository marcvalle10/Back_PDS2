import { DataSource } from "typeorm";
import { Inscripcion, Periodo } from "../entities";
import { repo as R } from "./common";

export async function crear(ds: DataSource, alumnoId: number, periodoEtiqueta: string) {
  const periodo = await R(ds, Periodo).findOne({ where: { etiqueta: periodoEtiqueta } as any });
  if (!periodo) throw new Error("Periodo no existe");
  const ins = R(ds, Inscripcion).create({
    alumno_id: alumnoId,
    periodo_id: (periodo as any).id,
    estatus: "INSCRITO",
  } as any);
  return await R(ds, Inscripcion).save(ins);
}

export async function porPeriodoEtiqueta(ds: DataSource, alumnoId: number, etiqueta: string) {
  return await R(ds, Inscripcion).createQueryBuilder("i")
    .leftJoinAndSelect("i.periodo", "p")
    .where("i.alumno_id = :id", { id: alumnoId })
    .andWhere("p.etiqueta = :et", { et: etiqueta })
    .getMany();
}
