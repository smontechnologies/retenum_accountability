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

describe("production email configuration", () => {
  const saved2 = { ...process.env };
  afterEach(() => {
    process.env = { ...saved2 };
    resetEnvCache();
  });
  it("refuses non-Resend email modes in production", () => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "x".repeat(40);
    process.env.DATABASE_URL = "postgres://u:p@localhost/db";
    process.env.EMAIL_MODE = "file";
    resetEnvCache();
    expect(() => env()).toThrow(/EMAIL_MODE: Must be 'resend' in production/);
  });
});

describe("local production e2e exception", () => {
  const saved3 = { ...process.env };
  afterEach(() => {
    process.env = { ...saved3 };
    resetEnvCache();
  });
  const prod = (appUrl: string) => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "x".repeat(40);
    delete process.env.DATABASE_URL;
    process.env.EMAIL_MODE = "file";
    process.env.E2E_LOCAL_PRODUCTION = "1";
    process.env.APP_URL = appUrl;
    resetEnvCache();
  };
  it("allows the embedded database and file email only for localhost", () => {
    prod("http://localhost:3200");
    expect(env().E2E_LOCAL_PRODUCTION).toBe("1");
  });
  it("is refused for any real host, and the normal production rules apply", () => {
    prod("https://app.retenum.com");
    expect(() => env()).toThrow(/E2E_LOCAL_PRODUCTION: Only allowed when APP_URL is localhost/);
    expect(() => env()).toThrow(/DATABASE_URL/);
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
