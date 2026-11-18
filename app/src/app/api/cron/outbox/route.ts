import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/server/db/client";
import { env } from "@/server/lib/env";
import { dispatchOutbox } from "@/server/outbox/outbox";
import { getEmailSender } from "@/server/outbox/senders";

export const dynamic = "force-dynamic";

/** Retries pending notifications (TD-12). Protected by CRON_SECRET (Vercel Cron sends it as a bearer token). */
export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const ok = !!secret && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ error: "unauthorised" }, { status: 401 });
  const result = await dispatchOutbox(getDb(), getEmailSender());
  return Response.json(result);
}
