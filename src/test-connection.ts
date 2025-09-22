// src/test-connection.ts
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Conexión a Supabase (pooler) OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error conectando:', err);
    process.exit(1);
  });
