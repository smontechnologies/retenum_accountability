import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { createAuth, type Auth } from "@/server/auth/auth";
import { account, outbox, user } from "@/server/db/schema";
import type { Database } from "@/server/db/client";

let db: Database;
let close: () => Promise<void>;
let auth: Auth;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  auth = createAuth(db);
});
afterAll(async () => close());

describe("authentication foundation (FR-ID-01, FR-ID-02)", () => {
  it("registers a user, stores only a password hash, and queues a verification email", async () => {
    await auth.api.signUpEmail({ body: { name: "Ada Obi", email: "ada@example.com", password: "correct-horse-battery" } });
    const [u] = await db.select().from(user).where(eq(user.email, "ada@example.com"));
    expect(u).toBeDefined();
    expect(u!.emailVerified).toBe(false);
    const [acc] = await db.select().from(account).where(eq(account.userId, u!.id));
    expect(acc!.password).toBeTruthy();
    expect(acc!.password).not.toContain("correct-horse-battery");
    const queued = await db.select().from(outbox);
    expect(queued.some((r) => (r.payload as { to: string; subject: string }).to === "ada@example.com")).toBe(true);
  });

  it("refuses sign-in until the email is verified", async () => {
    await expect(
      auth.api.signInEmail({ body: { email: "ada@example.com", password: "correct-horse-battery" } }),
    ).rejects.toThrow();
  });

  it("allows sign-in after verification and rejects a wrong password", async () => {
    await db.update(user).set({ emailVerified: true }).where(eq(user.email, "ada@example.com"));
    const ok = await auth.api.signInEmail({ body: { email: "ada@example.com", password: "correct-horse-battery" } });
    expect(ok.user.email).toBe("ada@example.com");
    await expect(auth.api.signInEmail({ body: { email: "ada@example.com", password: "wrong-password-123" } })).rejects.toThrow();
  });

  it("rejects passwords shorter than 10 characters", async () => {
    await expect(
      auth.api.signUpEmail({ body: { name: "Short", email: "short@example.com", password: "abc12345" } }),
    ).rejects.toThrow();
    const rows = await db.select().from(user).where(eq(user.email, "short@example.com"));
    expect(rows).toHaveLength(0);
  });

  it("does not create or alter an account on duplicate registration, without revealing that the email exists", async () => {
    // With verification required, Better Auth answers like a normal sign-up (enumeration-safe)
    // but must not create a second user or change the existing one.
    const res = await auth.api.signUpEmail({
      body: { name: "Ada Again", email: "ada@example.com", password: "another-strong-pass" },
    });
    expect(res.token).toBeNull();
    const rows = await db.select().from(user).where(eq(user.email, "ada@example.com"));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.name).toBe("Ada Obi");
    // the original password still works, the attacker's does not
    await expect(
      auth.api.signInEmail({ body: { email: "ada@example.com", password: "another-strong-pass" } }),
    ).rejects.toThrow();
    const ok = await auth.api.signInEmail({ body: { email: "ada@example.com", password: "correct-horse-battery" } });
    expect(ok.user.name).toBe("Ada Obi");
  });
});
