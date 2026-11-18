import type { Database } from "../db/client";
import { securityAuditLog } from "../db/schema";

/** Security audit log entry (AUD-02). Append-only at the database level. */
export async function auditSecurity(
  db: Database,
  type: string,
  actorUserId: string | null,
  data: Record<string, unknown> = {},
): Promise<void> {
  await db.insert(securityAuditLog).values({ type, actorUserId, data });
}
