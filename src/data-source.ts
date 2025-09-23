import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isDev =
  process.env.TS_NODE_DEV === 'true' ||
  process.env.TS_NODE === 'true' ||
  process.env.NODE_ENV !== 'production';

// Prefiere URL si existe (más simple y robusto)
const USE_URL = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',

  // 👉 Opción A: con URL (recomendada si tienes una)
  ...(USE_URL
    ? {
        url: process.env.DATABASE_URL, // debe traer ?sslmode=require
      }
    : {
        // 👉 Opción B: por campos sueltos (tus DB_* del .env)
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '6543', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }),

  ssl:
    process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false,

  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',

  entities: isDev
    ? ['src/**/*.entity.ts', 'src/entities/**/*.ts']
    : ['dist/**/*.entity.js', 'dist/entities/**/*.js'],
  migrations: isDev ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],

  namingStrategy: new SnakeNamingStrategy(),

  // 🛡️ HAZLA RESILIENTE
  extra: {
    // Pool
    max: 10,
    // Tiempo para abrir conexión (subido)
    connectionTimeoutMillis: 20000,
    // Cierra conexiones inactivas (mejor manejo tras sleep)
    idleTimeoutMillis: 30000,
    // Mantén vivo el socket
    keepAlive: true,
    // Inicia keepalive de inmediato en Windows
    keepAliveInitialDelayMillis: 0,

    // Evita timeouts de consulta del lado cliente (ajústalos si quieres)
    statement_timeout: 0,
    query_timeout: 0,
  },
});

export default AppDataSource;
