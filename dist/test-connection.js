"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/test-connection.ts
const data_source_1 = require("./data-source");
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('✅ Conexión a Supabase (pooler) OK');
    process.exit(0);
})
    .catch((err) => {
    console.error('❌ Error conectando:', err);
    process.exit(1);
});
