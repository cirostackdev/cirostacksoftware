import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadSecrets } from '../config/secrets.js';

async function runMigrations() {
  await loadSecrets();
  const { secrets } = await import('../config/secrets.js');
  const client = postgres(secrets().postgresUrl, { max: 1 });
  const db = drizzle(client);

  console.log('[migrate] running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('[migrate] done');
  await client.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('[migrate] error:', err);
  process.exit(1);
});
