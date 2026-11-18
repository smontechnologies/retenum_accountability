import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * Database access (TD-03/TD-04). Production/staging: node-postgres pool on DATABASE_URL.
 * Local dev without DATABASE_URL: embedded PGlite persisted to PGLITE_DIR. Tests create their own
 * in-memory instances via tests/helpers/db.ts.
 */
/** Driver-agnostic database type: both drivers extend PgDatabase. Transactions also satisfy it. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

let instance: Database | undefined;

export function createPgliteDatabase(client: PGlite) {
  return drizzlePglite(client, { schema });
}

export function getDb(): Database {
  if (instance) return instance;
  const e = env();
  if (e.DATABASE_URL) {
    instance = drizzlePg(new Pool({ connectionString: e.DATABASE_URL, max: 5 }), { schema }) as unknown as Database;
  } else {
    // PGlite does not create missing parent directories.
    mkdirSync(path.dirname(path.resolve(e.PGLITE_DIR)), { recursive: true });
    instance = createPgliteDatabase(new PGlite(e.PGLITE_DIR)) as unknown as Database;
  }
  return instance;
}

/** For tests only: inject a database. */
export function setDbForTesting(db: Database | undefined): void {
  instance = db;
}

export { schema };
