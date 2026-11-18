import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "../lib/env";
import { consoleEmailSender, createMemoryEmailSender, type EmailSender } from "./email";

/** Resend HTTP API (TD-14). Errors propagate so the outbox retries. */
function resendSender(apiKey: string, from: string): EmailSender {
  return {
    async send(message) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    },
  };
}

/** Development/e2e only: append each email as a JSON line (refused in production by env validation). */
function fileSender(file: string): EmailSender {
  return {
    async send(message) {
      mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
      appendFileSync(file, JSON.stringify({ ...message, at: new Date().toISOString() }) + "\n");
    },
  };
}

let memory: ReturnType<typeof createMemoryEmailSender> | undefined;

export function getEmailSender(): EmailSender {
  const e = env();
  if (e.EMAIL_MODE === "resend") return resendSender(e.RESEND_API_KEY ?? "", e.EMAIL_FROM);
  if (e.EMAIL_MODE === "file") return fileSender(e.EMAIL_FILE);
  if (e.EMAIL_MODE === "memory") return (memory ??= createMemoryEmailSender());
  return consoleEmailSender;
}
