"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const data_source_1 = require("./data-source");
const entities_1 = require("./entities");
async function bootstrap() {
    const ds = await data_source_1.AppDataSource.initialize();
    const repo = ds.getRepository(entities_1.PlanEstudio);
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
