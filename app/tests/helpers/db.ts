import { PGlite } from "@electric-sql/pglite";
import { createPgliteDatabase, type Database } from "@/server/db/client";
import { runMigrations } from "@/server/db/migrate";

/** Fresh in-memory Postgres (PGlite) with all real migrations applied. One per test file/suite. */
export async function createTestDb(): Promise<{ db: Database; client: PGlite; close: () => Promise<void> }> {
  const client = new PGlite();
  const db = createPgliteDatabase(client) as unknown as Database;
  await runMigrations(db);
  return { db, client, close: () => client.close() };
}
