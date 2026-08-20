import { sql } from '@/db/client';

async function migrate() {
  const sqlFile = Bun.file(new URL('./db.sql', import.meta.url));
  const sqlText = await sqlFile.text();

  console.log('🚀 Starting migration...');

  try {
    // Run the migration inside a transaction.
    // If any statement fails, all changes will be rolled back.
    await sql.begin(async (tx) => {
      await tx.unsafe(sqlText);
    });

    console.log('✅ Migration executed successfully');
  } catch (err) {
    // The transaction has already been rolled back at this point.
    console.error('❌ Migration failed, changes were rolled back:', err);
    process.exit(1);
  } finally {
    // Close the database connection regardless of whether the migration succeeded or failed.
    await sql.close();
  }
}

migrate();
