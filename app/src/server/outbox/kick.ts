import { after } from "next/server";
import { getDb } from "../db/client";
import { logger } from "../lib/logger";
import { dispatchOutbox } from "./outbox";
import { getEmailSender } from "./senders";

/** Send queued messages after the response is sent (best effort; cron retries the rest). */
export function kickOutbox(): void {
  after(async () => {
    try {
      await dispatchOutbox(getDb(), getEmailSender());
    } catch (err) {
      logger.warn("outbox kick failed", { error: String(err) });
    }
  });
}
