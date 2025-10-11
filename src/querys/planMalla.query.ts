import { AppDataSource } from '../data-source';
import { PlanMalla } from '../entities/PlanMalla';

export const listMallaByPlan = async (planEstudioId: number, semestre?: number) => {
  const repo = AppDataSource.getRepository(PlanMalla);
  const where: any = { plan_estudio: { id: planEstudioId } };
  if (semestre) where.semestre_sugerido = semestre;
  return repo.find({ where, relations: ['materia', 'prerrequisito'] });
};
