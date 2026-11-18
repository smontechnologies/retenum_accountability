import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
// Outside app/: files inside the project trigger dev-server reloads.
const DATA = "../.data/e2e";

/**
 * End-to-end tests (TD-18) against a fresh local database, driving the installed Google Chrome
 * (Playwright's bundled Chromium does not support macOS 13). Emails are written to a file.
 * Dev server uses webpack: Turbopack dev mode reload-loops on this machine (see build plan log).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // The dev server compiles each route on first request; allow for that.
  expect: { timeout: 20_000 },
  timeout: 120_000,
  reporter: [["list"]],
  outputDir: "../.data/test-results",
  use: { baseURL: `http://localhost:${PORT}`, channel: "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 }, channel: "chrome" } },
  ],
  webServer: {
    command: `rm -rf ${DATA} && pnpm db:migrate && pnpm exec next dev --webpack -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      APP_URL: `http://localhost:${PORT}`,
      PGLITE_DIR: `${DATA}/db`,
      EMAIL_MODE: "file",
      EMAIL_FILE: `${DATA}/emails.jsonl`,
      BETTER_AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-000000",
    },
  },
});
