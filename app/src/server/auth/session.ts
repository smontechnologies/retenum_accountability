import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import type { Actor } from "../lib/actor";

export async function getSession() {
  // Read request headers first: this marks the route dynamic and avoids touching config at build time.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** For pages and actions that require a signed-in, verified user. */
export async function requireActor(next?: string): Promise<Actor> {
  const session = await getSession();
  if (!session) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (!session.user.emailVerified) redirect(`/check-email?email=${encodeURIComponent(session.user.email)}`);
  return { userId: session.user.id, email: session.user.email, emailVerified: session.user.emailVerified };
}

/** Only same-site relative paths are allowed as post-login destinations (open-redirect protection). */
export function safeNext(next: unknown, fallback = "/app"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
