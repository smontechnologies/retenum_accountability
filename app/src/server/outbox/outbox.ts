import { and, asc, eq, lte } from "drizzle-orm";
import type { Database } from "../db/client";
import { outbox } from "../db/schema";
import { newId } from "../lib/ids";
import { logger } from "../lib/logger";
import type { EmailMessage, EmailSender } from "./email";

export const MAX_ATTEMPTS = 8;

/** Enqueue inside the business transaction so the message exists iff the action committed (TD-12). */
export async function enqueueEmail(tx: Database, message: EmailMessage): Promise<string> {
  const id = newId();
  await tx.insert(outbox).values({ id, kind: "email", payload: message as unknown as Record<string, unknown> });
  return id;
}

/** Exponential back-off: 1, 2, 4 ... minutes, capped at 60. */
export function nextAttemptDelayMs(attempts: number): number {
  return Math.min(60, 2 ** Math.max(0, attempts - 1)) * 60_000;
}

/**
 * Send due messages. Safe to run concurrently with itself only on a single worker in the MVP;
 * failures are retried and never affect the business action that enqueued them.
 */
export async function dispatchOutbox(db: Database, sender: EmailSender, now: Date = new Date(), limit = 50) {
  const due = await db
    .select()
    .from(outbox)
    .where(and(eq(outbox.status, "pending"), lte(outbox.nextAttemptAt, now)))
    .orderBy(asc(outbox.createdAt))
    .limit(limit);

  let sent = 0;
  let failed = 0;
  for (const item of due) {
    try {
      if (item.kind !== "email") throw new Error(`Unknown outbox kind: ${item.kind}`);
      await sender.send(item.payload as unknown as EmailMessage);
      await db.update(outbox).set({ status: "sent", sentAt: now, attempts: item.attempts + 1 }).where(eq(outbox.id, item.id));
      sent++;
    } catch (err) {
      const attempts = item.attempts + 1;
      const dead = attempts >= MAX_ATTEMPTS;
      await db
        .update(outbox)
        .set({
          attempts,
          status: dead ? "dead" : "pending",
          lastError: String(err).slice(0, 500),
          nextAttemptAt: new Date(now.getTime() + nextAttemptDelayMs(attempts)),
        })
        .where(eq(outbox.id, item.id));
      failed++;
      logger.warn("outbox delivery failed", { id: item.id, attempts, dead });
    }
  }
  return { sent, failed };
}
