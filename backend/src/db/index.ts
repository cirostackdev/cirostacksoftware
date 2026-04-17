import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { secrets } from '@/config/secrets.js';
import * as schema from './schema.js';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const client = postgres(secrets().postgresUrl, {
      max: 20,
      types: {
        // Parse PostgreSQL numeric/decimal as JS float instead of string
        numeric: { to: 0, from: [1700], parse: (v: string) => parseFloat(v) },
      },
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Convenience export — resolves lazily so it works after loadSecrets()
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
