import { AppError, toPublicError } from "./errors";
import { logger } from "./logger";

/** What every server action returns to its form. */
export type FormState = { status: "idle" | "error" | "success"; message?: string; fields?: Record<string, string> };
export const IDLE: FormState = { status: "idle" };

/** Converts any thrown error into a safe form state. Never pass redirect() errors here. */
export function errorToFormState(err: unknown): FormState {
  if (err instanceof AppError) {
    const fields = (err.details as { fields?: Record<string, string> } | undefined)?.fields;
    return { status: "error", message: err.message, fields };
  }
  // Better Auth APIError carries a safe body message and code.
  const body = (err as { body?: { message?: string; code?: string } } | null)?.body;
  if (body?.message) return { status: "error", message: body.message, fields: body.code ? { _code: body.code } : undefined };
  logger.error("unhandled action error", { error: String(err) });
  return { status: "error", message: toPublicError(err).message };
}
