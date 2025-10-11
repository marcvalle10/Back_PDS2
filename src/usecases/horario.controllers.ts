// src/usecases/horario.controllers.ts
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Inscripcion } from '../entities/Inscripcion';
import { Periodo } from '../entities/Periodo';
import { Grupo } from '../entities/Grupo';
import { Horario } from '../entities/Horario';

export const getHorarioActualAlumno = async (req: Request, res: Response) => {
  const alumnoId = Number(req.params.id);
  if (!alumnoId) return res.status(400).json({ error: 'id inválido' });

  const ds = AppDataSource;

  // 1) Determinar periodo "actual" (puedes mejorar esta heurística según tu modelo)
  const perRepo = ds.getRepository(Periodo);
  const periodos = await perRepo.find();
  // asume etiqueta más reciente lexicográfica como "actual" (22xx < 23xx < 24xx ...)
  const etiquetas = periodos.map((p: any) => String(p.etiqueta || p.nombre || '')).filter(Boolean).sort();
  const etiquetaActual = etiquetas.length ? etiquetas[etiquetas.length - 1] : null;
  if (!etiquetaActual) return res.status(404).json({ error: 'No hay periodo actual' });

  // 2) Confirmar que el alumno está inscrito en ese periodo
  const insRepo = ds.getRepository(Inscripcion);
  const ins = await insRepo.findOne({
    where: { alumno: { id: alumnoId } as any, periodo_etiqueta: etiquetaActual } as any,
  });
  if (!ins) return res.json({ periodo: etiquetaActual, grupos: [], horario: [] });

  // 3) Obtener grupos cursando por el alumno en ese periodo (requiere relación alumno↔grupo en tu modelo real)
  // Si aún no guardas "alumno_grupo", como alternativa temporal usa Kardex del periodo activo o tu tabla intermedia si ya existe.
  // Aquí asumo que tienes una tabla intermedia alumno_grupo (ajusta a tu estructura real):
  const qb = ds.createQueryBuilder()
    .select('g.id', 'grupo_id')
    .addSelect('g.clave', 'grupo_clave')
    .addSelect('m.id', 'materia_id')
    .addSelect('m.nombre', 'materia')
    .from(Grupo, 'g')
    .innerJoin('g.materia', 'm')
    .innerJoin('g.periodo', 'p')
    .innerJoin('alumno_grupo', 'ag', 'ag.grupo_id = g.id AND ag.alumno_id = :alumnoId', { alumnoId })
    .where('p.etiqueta = :et', { et: etiquetaActual });

  const grupos = await qb.getRawMany();

  // 4) Agendar/horarios por grupo
  const horariosRepo = ds.getRepository(Horario);
  const horarios = await horariosRepo
    .createQueryBuilder('h')
    .innerJoin('h.grupo', 'g')
    .where('g.id IN (:...ids)', { ids: grupos.map(g => g.grupo_id).concat(-1) })
    .getMany();

  // salida
  res.json({
    periodo: etiquetaActual,
    grupos,
    horario: horarios.map(h => ({
      grupo_id: (h as any).grupo?.id || undefined,
      dia: (h as any).dia,
      hora_inicio: (h as any).hora_inicio,
      hora_fin: (h as any).hora_fin,
      aula: (h as any).aula,
    })),
  });
};
