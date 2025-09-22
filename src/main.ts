import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { PlanEstudio } from './entities';

async function bootstrap() {
  const ds = await AppDataSource.initialize();
  const repo = ds.getRepository(PlanEstudio);

  const plan = repo.create({
    nombre: 'IS-UNISON',
    version: '2025',
    total_creditos: 300,
    semestres_sugeridos: 9
  });

  await repo.save(plan);
  console.log('OK -> plan_estudio id:', plan.id);

  await ds.destroy();
}

bootstrap().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
