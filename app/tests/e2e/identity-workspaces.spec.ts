import { readFileSync, existsSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const MAIL_FILE = "../.data/e2e/emails.jsonl";

/** Waits for the newest email to `to` whose subject matches, and returns the first link in it. */
async function linkFromEmail(to: string, subject: RegExp): Promise<string> {
  for (let i = 0; i < 50; i++) {
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

async function signUp(page: Page, name: string, email: string, password: string) {
  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
}

test("UJ-1: register, verify, create a workspace, see plan limits, sign out and back in", async ({ page }, info) => {
  const email = `ada-${info.project.name}@studio.ng`;
  const password = "correct-horse-battery";

  // Validation errors are shown next to fields and announced.
  await page.goto("/sign-up");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("check the highlighted fields");
  await expect(page.getByText("Use at least 10 characters")).toBeVisible();

  await signUp(page, "Ada Obi", email, password);

  // Unverified users cannot sign in.
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("verify your email");

  // The signed-in area redirects anonymous visitors.
  await page.goto("/app");
  await expect(page).toHaveURL(/\/sign-in/);

  // Verify via the emailed link → lands in the app, signed in.
  await page.goto(await linkFromEmail(email, /Verify your email/));
  await expect(page.getByRole("heading", { name: "Your workspaces" })).toBeVisible();

  // Create a workspace.
  await page.getByLabel("Business or trading name").fill("Ada Studio");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: "Ada Studio" })).toBeVisible();
  await expect(page.getByText("You: owner")).toBeVisible();
  await expect(page.getByText("Seats: 1 of 1")).toBeVisible();

  // Free plan seat limit is enforced with a clear message (FR-WS-07).
  await page.getByLabel("Email").fill("tunde@studio.ng");
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("free plan allows 1 seat");

  // The owner cannot leave without transferring ownership: no leave button for the owner.
  await expect(page.getByRole("button", { name: "Leave workspace" })).toHaveCount(0);

  // Sign out, wrong password gives a non-revealing message, right password works.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Email or password is incorrect.");
  // The email survives the failed attempt; the password is never echoed back.
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Password")).toHaveValue("");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("link", { name: /Ada Studio/ })).toBeVisible();
});

test("FR-ID-04: reset a forgotten password via the emailed link", async ({ page }, info) => {
  const email = `reset-${info.project.name}@example.com`;
  await signUp(page, "Reset Person", email, "original-password-1");
  await page.goto(await linkFromEmail(email, /Verify your email/));
  await expect(page.getByRole("heading", { name: "Your workspaces" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText("If an account exists");

  await page.goto(await linkFromEmail(email, /Reset your Retenum password/));
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await page.getByLabel("New password").fill("replacement-password-2");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText("Password changed");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("replacement-password-2");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Your workspaces" })).toBeVisible();
});

test("invalid invitation links show a clear message and no workspace details", async ({ page }) => {
  await page.goto("/invite/not-a-real-token");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("This invitation link is not valid.");
});

test("no horizontal scrolling on key pages (NFR-01)", async ({ page }) => {
  for (const path of ["/", "/sign-up", "/sign-in", "/forgot-password"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
