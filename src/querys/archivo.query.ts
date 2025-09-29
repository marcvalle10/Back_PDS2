import { DataSource } from 'typeorm';
import { ValidacionResultado } from '../entities';
import { repo as R } from './common';
import { AuditoriaCargas } from '../entities';

// /archivo/:id/validaciones
export async function getValidaciones(ds: DataSource, archivoId: number) {
  return await R(ds, ValidacionResultado).find({
    where: { archivo: { id: archivoId } } as any,
    order: { id: 'ASC' } as any,
  });
}
//
export async function getAuditoria(ds: DataSource, archivoId: number) {
  return await R(ds, AuditoriaCargas).find({
    where: { archivo_id: archivoId } as any,
    order: { timestamp: "ASC" } as any,
  });
}

export async function getValidacionesPorSeveridad(ds: DataSource, archivoId: number, sev: string) {
  return await R(ds, ValidacionResultado).find({
    where: { archivo_id: archivoId, severidad: sev as any } as any,
  });
}