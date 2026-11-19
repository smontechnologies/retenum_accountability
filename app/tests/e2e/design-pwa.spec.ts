import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { noHorizontalOverflow, onboardWorkspace, registerAndVerify } from "./helpers";

const PUBLIC_PAGES = ["/", "/sign-in", "/sign-up", "/forgot-password", "/offline.html", "/invite/not-a-real-token"];
// /dev/components is development-only (404 in production) and is reviewed separately.
const APP_PAGES = ["/app", "/app/engagements", "/app/engagements/new", "/app/payments", "/app/activity", "/app/business", "/app/business/new", "/app/settings"];
const WIDTHS = [320, 390, 768, 1024, 1280, 1536];

async function createWorkspace(page: Page, name: string) {
  await onboardWorkspace(page, name);
}

async function signedInUser(browser: Browser, email: string) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await registerAndVerify(page, "Design Check", email);
  await createWorkspace(page, "Design Studio");
  return { context, page };
}

// Visual/a11y matrices set their own viewports, so they run once (desktop project).
test.describe("design system gate (DES-08, DES-09)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "matrix runs once"));

  for (const theme of ["light", "dark"] as const) {
    test(`axe finds no WCAG 2.2 AA violations in ${theme} theme`, async ({ browser }) => {
      const { context, page } = await signedInUser(browser, `axe-${theme}@example.com`);
      // Choose the theme the way a user does, so it is saved to the account (which wins on app pages).
      await page.goto("/app/settings");
      await page.getByRole("radio", { name: theme === "dark" ? /Dark/ : /Light/ }).check();
      await page.getByRole("button", { name: "Save appearance" }).click();
      await expect(page.getByRole("status").filter({ hasText: "Appearance saved." })).toBeVisible();
      for (const path of [...PUBLIC_PAGES, ...APP_PAGES]) {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
        expect(summary, `${path} (${theme})`).toEqual([]);
      }
      await context.close();
    });
  }

  test("onboarding page passes axe and has no overflow in both themes", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await registerAndVerify(page, "Onboard Check", "onboard-axe@example.com");
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => v.id), theme).toEqual([]);
      expect(await noHorizontalOverflow(page)).toBeLessThanOrEqual(0);
    }
    await context.close();
  });

  test("no horizontal overflow at 320–1536 px, and the right navigation pattern per size", async ({ browser }) => {
    const { context, page } = await signedInUser(browser, "responsive@example.com");
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [...PUBLIC_PAGES, ...APP_PAGES]) {
        await page.goto(path);
        expect(await noHorizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
      await page.goto("/app");
      const bottomNav = page.locator("nav[aria-label='Main']").filter({ has: page.getByRole("button", { name: "More" }) });
      if (width < 768) {
        await expect(bottomNav, `bottom nav at ${width}`).toBeVisible();
      } else {
        await expect(bottomNav, `no bottom nav at ${width}`).toBeHidden();
        await expect(page.getByRole("complementary").locator("nav[aria-label='Main']").filter({ visible: true }), `side navigation at ${width}`).toHaveCount(1);
      }
    }
    await context.close();
  });
});

test("theme choice persists across reloads and on a second device (DES-02/03)", async ({ browser }, info) => {
  const email = `theme-${info.project.name}@example.com`;
  const first = await browser.newContext();
  const page = await first.newPage();
  await registerAndVerify(page, "Theme Person", email);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await onboardWorkspace(page, "Theme Co");

  await page.goto("/app/settings");
  await page.getByRole("radio", { name: /Dark/ }).check();
  await page.getByRole("button", { name: "Save appearance" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Appearance saved." })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(14, 14, 14)");
  await first.close();

  // Second device: fresh browser, sign in → the saved theme is applied.
  const second = await browser.newContext();
  const p2 = await second.newPage();
  await p2.goto("/sign-in");
  await p2.getByLabel("Email").fill(email);
  await p2.getByLabel("Password").fill("correct-horse-battery");
  await p2.getByRole("button", { name: "Sign in" }).click();
  await expect(p2.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  await expect(p2.locator("html")).toHaveAttribute("data-theme", "dark");
  await second.close();
});

test.describe("progressive web app (PWA-01…08)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "runs once"));

  test("manifest is valid and every icon is a real PNG of the stated size", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const m = await res.json();
    expect(m).toMatchObject({ name: "Retenum", short_name: "Retenum", start_url: "/app", display: "standalone" });
    const purposes = m.icons.map((i: { purpose: string }) => i.purpose);
    expect(purposes).toContain("maskable");
    for (const icon of m.icons as Array<{ src: string; sizes: string }>) {
      const r = await request.get(icon.src);
      expect(r.ok(), icon.src).toBe(true);
      expect(r.headers()["content-type"]).toContain("image/png");
      const buf = await r.body();
      const [w, h] = [buf.readUInt32BE(16), buf.readUInt32BE(20)];
      expect(`${w}x${h}`, icon.src).toBe(icon.sizes);
    }
    const apple = await request.get("/apple-icon");
    expect(apple.ok()).toBe(true);
  });

  test("service worker is served uncached, registers, and offline navigation shows the offline page", async ({ page, context, request }) => {
    const sw = await request.get("/sw.js");
    expect(sw.headers()["cache-control"]).toContain("no-store");

    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload(); // now controlled by the worker
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    await page.goto("/sign-in").catch(() => undefined);
    await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible();
    await context.setOffline(false);
  });

  test("going offline shows the banner and blocks submission; nothing is queued (PWA-03/06/07)", async ({ page, context }) => {
    await page.goto("/forgot-password");
    await context.setOffline(true);
    await expect(page.getByRole("status").filter({ hasText: "You're offline" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeDisabled();
    await expect(page.getByText("Available when you're back online.")).toBeVisible();
    await context.setOffline(false);
    await expect(page.getByRole("status").filter({ hasText: "Back online." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeEnabled();
  });
});
