import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from './naming';
import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 6543),       // pooler
  username: process.env.PGUSER,                   // postgres.<project-ref>
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },             // requerido en Supabase
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),

  // evita el error de tipos usando rutas (TS en dev, JS en prod)
  entities: [isProd ? 'dist/entities/**/*.js' : 'src/entities/**/*.ts'],
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
});
