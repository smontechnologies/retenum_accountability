import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, type Database } from "../db/client";
import { account, session, user, verification } from "../db/schema";
import { env } from "../lib/env";
import { enqueueEmail } from "../outbox/outbox";

/**
 * Authentication (TD-05). FR-ID-01 (password policy), FR-ID-02 (verification required),
 * FR-ID-03 (sessions), FR-ID-04 (reset). Counterparty email-OTP (FR-ID-05) is added in Slice 2.
 */
export function createAuth(db: Database, options: { secret?: string; baseURL?: string } = {}) {
  const e = env();
  const secret = options.secret ?? e.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured");

  return betterAuth({
    secret,
    baseURL: options.baseURL ?? e.APP_URL,
    database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 30 * 60,
      sendResetPassword: async ({ user: u, url }) => {
        await enqueueEmail(db, {
          to: u.email,
          subject: "Reset your Retenum password",
          text: `Use this link within 30 minutes to reset your password: ${url}\nIf you did not ask for this, ignore this email.`,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user: u, url }) => {
        await enqueueEmail(db, {
          to: u.email,
          subject: "Verify your email for Retenum",
          text: `Confirm your email address to start using Retenum: ${url}`,
        });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // absolute 30 days
      updateAge: 60 * 60 * 24, // refresh daily while active
    },
    rateLimit: { enabled: e.NODE_ENV === "production", window: 60, max: 30 },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;
export function getAuth(): Auth {
  if (!instance) instance = createAuth(getDb());
  return instance;
}
