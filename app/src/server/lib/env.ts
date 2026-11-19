import { z } from "zod";

/**
 * Validated environment configuration (TD-16, NFR-09).
 * Fails fast at first use if configuration is invalid.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_URL: z.url().default("http://localhost:3000"),
    DATABASE_URL: z.string().optional().transform((v) => (v ? v : undefined)),
    // Outside app/ so the dev server file watcher does not reload pages on every database write.
    PGLITE_DIR: z.string().default("../.data/pglite"),
    BETTER_AUTH_SECRET: z.string().optional(),
    EMAIL_MODE: z.enum(["console", "memory", "file", "resend"]).default("console"),
    EMAIL_FILE: z.string().default("../.data/emails.jsonl"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Retenum <no-reply@retenum.local>"),
    CRON_SECRET: z.string().optional(),
    PAYMENTS_MODE: z.enum(["test", "live"]).default("test"),
    /**
     * Local end-to-end testing of a PRODUCTION build (PWA/offline must be tested on a production build).
     * Only honoured when APP_URL is localhost; never relaxes a real deployment.
     */
    E2E_LOCAL_PRODUCTION: z.enum(["0", "1"]).default("0"),
  })
  .superRefine((env, ctx) => {
    const localE2e =
      env.E2E_LOCAL_PRODUCTION === "1" && ["localhost", "127.0.0.1"].includes(new URL(env.APP_URL).hostname);
    if (env.E2E_LOCAL_PRODUCTION === "1" && !localE2e) {
      ctx.addIssue({ code: "custom", path: ["E2E_LOCAL_PRODUCTION"], message: "Only allowed when APP_URL is localhost" });
    }
    if (env.NODE_ENV === "production") {
      if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
        ctx.addIssue({ code: "custom", path: ["BETTER_AUTH_SECRET"], message: "Required (32+ chars) in production" });
      }
      if (!env.DATABASE_URL && !localE2e) {
        ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "Required in production (PGlite is dev/test only)" });
      }
      if (env.EMAIL_MODE !== "resend" && !localE2e) {
        ctx.addIssue({ code: "custom", path: ["EMAIL_MODE"], message: "Must be 'resend' in production" });
      }
      if (env.EMAIL_MODE === "resend" && !env.RESEND_API_KEY) {
        ctx.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "Required when EMAIL_MODE=resend" });
      }
    }
  });

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid environment configuration: ${details}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/** Test helper: forget cached env so tests can change process.env. */
export function resetEnvCache(): void {
  cached = undefined;
}

/** Cookies are marked Secure whenever the app is served over https (always true for real deployments). */
export function secureCookies(): boolean {
  return new URL(env().APP_URL).protocol === "https:";
}
