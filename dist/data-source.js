"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const isDev = process.env.TS_NODE_DEV === 'true' ||
    process.env.TS_NODE === 'true' ||
    process.env.NODE_ENV !== 'production';
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: process.env.TYPEORM_LOGGING === 'true',
    // 👇 En dev usa .ts dentro de src; en prod usa .js dentro de dist
    entities: isDev
        ? ['src/**/*.entity.ts', 'src/entities/**/*.ts']
        : ['dist/**/*.entity.js', 'dist/entities/**/*.js'],
    migrations: isDev
        ? ['src/migrations/*.ts']
        : ['dist/migrations/*.js'],
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,
});
exports.default = exports.AppDataSource;
