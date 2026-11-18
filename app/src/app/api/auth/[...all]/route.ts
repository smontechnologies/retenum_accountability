import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";
import { kickOutbox } from "@/server/outbox/kick";

// Created lazily so that building the app never opens a database connection.
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const res = await toNextJsHandler(getAuth()).GET(request);
  kickOutbox();
  return res;
}
export async function POST(request: Request) {
  const res = await toNextJsHandler(getAuth()).POST(request);
  kickOutbox(); // send verification / reset emails queued by this request
  return res;
}
