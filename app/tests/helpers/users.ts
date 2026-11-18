import { eq } from "drizzle-orm";
import type { Auth } from "@/server/auth/auth";
import type { Database } from "@/server/db/client";
import { user } from "@/server/db/schema";
import type { Actor } from "@/server/lib/actor";

/** Registers a user through the real auth flow, then marks the email verified (as the link would). */
export async function createUser(db: Database, auth: Auth, name: string, email: string, verified = true): Promise<Actor> {
  await auth.api.signUpEmail({ body: { name, email, password: "a-strong-test-password" } });
  if (verified) await db.update(user).set({ emailVerified: true }).where(eq(user.email, email));
  const [u] = await db.select().from(user).where(eq(user.email, email));
  return { userId: u!.id, email: u!.email, emailVerified: verified };
}
