import { pg } from '@/db/client';

async function migrate() {
  const sqlFile = Bun.file(new URL('./db.sql', import.meta.url));
  const sql = await sqlFile.text();

  console.log('🚀 Iniciando migración...');

  try {
    await pg.begin(async (tx) => {
      await tx.unsafe(sql);
    });
    console.log('✅ Migración ejecutada correctamente');
  } catch (err) {
    console.error('❌ Error en la migración, se hizo rollback:', err);
    process.exit(1);
  } finally {
    await pg.close();
  }
}

migrate();
