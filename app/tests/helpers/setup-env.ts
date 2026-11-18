// Deterministic test environment. No real secrets; email captured in memory.
(process.env as Record<string, string>).NODE_ENV = "test";
process.env.APP_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-0123456789";
process.env.EMAIL_MODE = "memory";
process.env.PAYMENTS_MODE = "test";
delete process.env.DATABASE_URL;
