import path from "node:path";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "./client";

export const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");

/** Applies all SQL migrations in ./drizzle. Works for both drivers. */
export async function runMigrations(db: Database): Promise<void> {
  // Both migrators accept the drizzle instance; the driver is detected from the session type.
  const client = (db as unknown as { $client?: object }).$client;
  const isPglite = Boolean(client && "waitReady" in client);
  if (isPglite) await migratePglite(db as unknown as Parameters<typeof migratePglite>[0], { migrationsFolder: MIGRATIONS_FOLDER });
  else await migratePg(db as unknown as Parameters<typeof migratePg>[0], { migrationsFolder: MIGRATIONS_FOLDER });
}
