import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { dispatchOutbox, enqueueEmail, MAX_ATTEMPTS, nextAttemptDelayMs } from "@/server/outbox/outbox";
import { createMemoryEmailSender } from "@/server/outbox/email";
import { outbox } from "@/server/db/schema";
import type { Database } from "@/server/db/client";

let db: Database;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(async () => close());

const msg = (to: string) => ({ to, subject: "Hello", text: "Body" });

describe("transactional outbox (TD-12)", () => {
  it("only keeps messages whose business transaction committed", async () => {
    await expect(
      db.transaction(async (tx) => {
        await enqueueEmail(tx as unknown as Database, msg("rolled-back@example.com"));
        throw new Error("abort");
      }),
    ).rejects.toThrow("abort");
    const rows = await db.select().from(outbox).where(eq(outbox.status, "pending"));
    expect(rows.find((r) => (r.payload as { to: string }).to === "rolled-back@example.com")).toBeUndefined();
  });

  it("delivers pending messages once", async () => {
    const sender = createMemoryEmailSender();
    const id = await enqueueEmail(db, msg("a@example.com"));
    const first = await dispatchOutbox(db, sender);
    expect(first.sent).toBeGreaterThanOrEqual(1);
    const second = await dispatchOutbox(db, sender);
    expect(second.sent).toBe(0);
    expect(sender.sent.filter((m) => m.to === "a@example.com")).toHaveLength(1);
    const [row] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(row!.status).toBe("sent");
  });

  it("retries with back-off and dead-letters after the maximum attempts", async () => {
    const sender = createMemoryEmailSender();
    const id = await enqueueEmail(db, msg("flaky@example.com"));
    let now = new Date();
    sender.failNext = MAX_ATTEMPTS;
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      await dispatchOutbox(db, sender, now);
      const [row] = await db.select().from(outbox).where(eq(outbox.id, id));
      expect(row!.attempts).toBe(i);
      expect(row!.status).toBe(i === MAX_ATTEMPTS ? "dead" : "pending");
      now = new Date(row!.nextAttemptAt.getTime() + 1);
    }
    expect(sender.sent.find((m) => m.to === "flaky@example.com")).toBeUndefined();
  });

  it("does not resend before the back-off time", async () => {
    const sender = createMemoryEmailSender();
    const id = await enqueueEmail(db, msg("later@example.com"));
    const now = new Date();
    sender.failNext = 1;
    await dispatchOutbox(db, sender, now);
    await dispatchOutbox(db, sender, new Date(now.getTime() + 1000)); // too early
    const [row] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(row!.attempts).toBe(1);
    expect(nextAttemptDelayMs(1)).toBe(60_000);
    expect(nextAttemptDelayMs(20)).toBe(3_600_000);
  });
});
