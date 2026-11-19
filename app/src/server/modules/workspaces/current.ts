import { cookies } from "next/headers";
import type { Database } from "../../db/client";
import type { Actor } from "../../lib/actor";
import { listWorkspacesForUser } from "./service";

export const WORKSPACE_COOKIE = "rtn_ws";

/**
 * The workspace the user is currently working in. The cookie is only a hint: it is honoured only if
 * the user is still a member; otherwise the first membership is used (security: no cross-tenant access).
 */
export async function getCurrentWorkspace(db: Database, actor: Actor, preferredId?: string) {
  const memberships = await listWorkspacesForUser(db, actor.userId);
  const hint = preferredId ?? (await cookies()).get(WORKSPACE_COOKIE)?.value;
  const current = memberships.find((m) => m.id === hint) ?? memberships[0] ?? null;
  return { current, memberships };
}
