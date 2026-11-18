import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { logger } from "@/server/lib/logger";

export const dynamic = "force-dynamic";

/** Liveness + database reachability (architecture §11). Reveals no internals. */
export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch (err) {
    logger.error("health check failed", { error: String(err) });
    return Response.json({ status: "error" }, { status: 503 });
  }
}
