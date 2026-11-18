import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";

// Created lazily so that building the app never opens a database connection.
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}
export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
