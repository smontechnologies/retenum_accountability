import { existsSync, readFileSync } from "node:fs";
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
