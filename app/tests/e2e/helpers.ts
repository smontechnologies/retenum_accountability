import { existsSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const MAIL_FILE = "../.data/e2e/emails.jsonl";

/** Waits for the newest email to `to` whose subject matches, and returns the first link in it. */
export async function linkFromEmail(to: string, subject: RegExp): Promise<string> {
  for (let i = 0; i < 75; i++) {
    if (existsSync(MAIL_FILE)) {
      const mails = readFileSync(MAIL_FILE, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as { to: string; subject: string; text: string });
      const mail = mails.reverse().find((m) => m.to === to && subject.test(m.subject));
      const url = mail && /https?:\/\/\S+/.exec(mail.text)?.[0];
      if (url) return url;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`No email to ${to} matching ${subject}`);
}

/** Registers and verifies a user through the real UI and email link; ends signed in on /app. */
export async function registerAndVerify(page: Page, name: string, email: string, password = "correct-horse-battery") {
  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await page.goto(await linkFromEmail(email, /Verify your email/));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function noHorizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Completes onboarding step 1 (FR-ONB-01): creates the user's first workspace; ends on the Overview. */
export async function onboardWorkspace(page: Page, name: string) {
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Business or trading name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
}

/**
 * Design quality gate for the current page (DES-08/09): WCAG 2.2 AA via axe in light AND dark, and
 * no horizontal overflow at 320 px. Restores the original theme and viewport afterwards.
 */
export async function expectDesignGate(page: Page, label: string) {
  const original = await page.locator("html").getAttribute("data-theme");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 2).join(" | ")}`), `${label} (${theme})`).toEqual([]);
  }
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t ?? "system"), original);
  const size = page.viewportSize();
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await noHorizontalOverflow(page), `${label} overflows at 320px`).toBeLessThanOrEqual(0);
  if (size) await page.setViewportSize(size);
}
