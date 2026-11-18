/** Typed application errors. Services throw these; the web layer maps them to responses. */
export type ErrorCode = "VALIDATION" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL";

const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
  get httpStatus(): number {
    return HTTP_STATUS[this.code];
  }
}

export const validationError = (m: string, d?: Record<string, unknown>) => new AppError("VALIDATION", m, d);
export const forbidden = (m = "You do not have permission to do this.") => new AppError("FORBIDDEN", m);
export const notFound = (m = "Not found.") => new AppError("NOT_FOUND", m);
export const conflict = (m: string, d?: Record<string, unknown>) => new AppError("CONFLICT", m, d);

/** Safe, user-facing representation. Internal errors never leak details (security checklist #10). */
export function toPublicError(err: unknown): { code: ErrorCode; message: string; status: number } {
  if (err instanceof AppError) return { code: err.code, message: err.message, status: err.httpStatus };
  return { code: "INTERNAL", message: "Something went wrong. Please try again.", status: 500 };
}
