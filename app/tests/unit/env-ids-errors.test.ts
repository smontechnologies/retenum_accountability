import { afterEach, describe, expect, it } from "vitest";
import { env, resetEnvCache } from "@/server/lib/env";
import { hashToken, newReference, newSecretToken } from "@/server/lib/ids";
import { AppError, toPublicError } from "@/server/lib/errors";

describe("environment validation (NFR-09)", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
    resetEnvCache();
  });

  it("defaults payments to test mode", () => {
    resetEnvCache();
    expect(env().PAYMENTS_MODE).toBe("test");
  });

  it("fails fast in production without a database URL or strong secret", () => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "short";
    delete process.env.DATABASE_URL;
    resetEnvCache();
    expect(() => env()).toThrow(/BETTER_AUTH_SECRET.*DATABASE_URL|DATABASE_URL.*BETTER_AUTH_SECRET/s);
  });
});

describe("ids and tokens (SEC-06)", () => {
  it("secret tokens have >=32 bytes of entropy and only the hash is derived", () => {
    const { token, hash } = newSecretToken();
    expect(Buffer.from(token, "base64url").length).toBe(32);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });

  it("payment references are unique and time-sortable", () => {
    const a = newReference("RTN", 1_700_000_000_000);
    const b = newReference("RTN", 1_700_000_000_001);
    expect(a).toMatch(/^RTN-[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(a < b).toBe(true);
  });
});

describe("public errors (security checklist #10)", () => {
  it("hides internal error details", () => {
    expect(toPublicError(new Error("db password is hunter2"))).toEqual({
      code: "INTERNAL",
      message: "Something went wrong. Please try again.",
      status: 500,
    });
  });
  it("passes through typed app errors", () => {
    expect(toPublicError(new AppError("FORBIDDEN", "No")).status).toBe(403);
  });
});
