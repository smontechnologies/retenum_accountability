import { expect, test, type Page } from "@playwright/test";
import { linkFromEmail, noHorizontalOverflow, onboardWorkspace, registerAndVerify } from "./helpers";

/** Sign out from wherever the current layout puts it (More sheet on mobile, sidebar on desktop). */
async function signOut(page: Page) {
  const more = page.getByRole("button", { name: "More" });
  if (await more.isVisible()) {
    await more.click();
    await page.getByRole("dialog").getByRole("button", { name: "Sign out" }).click();
  } else {
    await page.getByRole("complementary").getByRole("button", { name: "Sign out" }).first().click();
  }
  await expect(page).toHaveURL(/\/sign-in/);
}

test("UJ-1: register, verify, create a workspace, see plan limits, sign out and back in", async ({ page }, info) => {
  const email = `ada-${info.project.name}@studio.ng`;
  const password = "correct-horse-battery";

  // Validation errors are shown next to fields and announced.
  await page.goto("/sign-up");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  // The summary names each problem in plain words, and focus moves to the first field to fix.
  const summary = page.getByRole("main").getByRole("alert");
  await expect(summary).toContainText("Fix these");
  await expect(summary).toContainText("Password: use at least 10 characters");
  await expect(summary).not.toContainText("check");
  await expect(page.getByLabel("Your name")).toBeFocused();
  await expect(page.getByText("Use at least 10 characters", { exact: true })).toBeVisible(); // inline, under the field

  await page.getByLabel("Your name").fill("Ada Obi");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

  // Unverified users cannot sign in.
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("verify your email");

  // The signed-in area redirects anonymous visitors.
  await page.goto("/app");
  await expect(page).toHaveURL(/\/sign-in/);

  // Verify via the emailed link → onboarding starts with the workspace (FR-ONB-01).
  await page.goto(await linkFromEmail(email, /Verify your email/));
  await expect(page.getByRole("heading", { name: "Set up your business" })).toBeVisible();
  await onboardWorkspace(page, "Ada Studio");
  await expect(page.getByText("Your workspace is ready")).toBeVisible();

  // The workspace and its plan limits.
  await page.goto("/app/business");
  await expect(page.getByRole("heading", { level: 1, name: "Ada Studio" })).toBeVisible();
  await expect(page.getByText("1 of 1 seat used on the free plan.")).toBeVisible();

  // Free plan seat limit is enforced with a clear message (FR-WS-07).
  await page.getByLabel("Email", { exact: true }).fill("tunde@studio.ng");
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("free plan allows 1 seat");

  // The owner has no Leave/Remove action on their own row.
  await expect(page.getByRole("button", { name: "Leave" })).toHaveCount(0);

  // Sign out, wrong password gives a non-revealing message, right password works.
  await signOut(page);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Email or password is incorrect.");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Password")).toHaveValue("");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
});

test("FR-ID-04: reset a forgotten password via the emailed link", async ({ page }, info) => {
  const email = `reset-${info.project.name}@example.com`;
  await registerAndVerify(page, "Reset Person", email, "original-password-1");
  await onboardWorkspace(page, "Reset Co");
  await signOut(page);

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("main").getByRole("status").first()).toContainText("If an account exists");

  await page.goto(await linkFromEmail(email, /Reset your Retenum password/));
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await page.getByLabel("New password").fill("replacement-password-2");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("Password changed. Sign in with your new password.")).toBeVisible();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("replacement-password-2");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
});

test("invalid invitation links show a clear message and no workspace details", async ({ page }) => {
  await page.goto("/invite/not-a-real-token");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("This invitation link is not valid.");
});

test("no horizontal scrolling on public pages (NFR-01)", async ({ page }) => {
  for (const path of ["/", "/sign-up", "/sign-in", "/forgot-password", "/offline.html"]) {
    await page.goto(path);
    expect(await noHorizontalOverflow(page), `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});

test("forms submitted before JavaScript loads post to the server and never put values in the URL (security)", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/sign-up");
  await expect(page.locator("form").first()).toHaveAttribute("method", /post/i);
  await page.getByLabel("Your name").fill("No Script");
  await page.getByLabel("Email").fill(`nojs-${info.project.name}@example.com`);
  await page.getByLabel("Password").fill("no-script-password-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForLoadState("load");
  expect(page.url()).not.toContain("password");
  expect(page.url()).not.toContain("no-script-password-1");
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await context.close();
});

test("onboarding: no app screen without a workspace; New engagement always available and creates nothing (FR-ONB-01/02, FR-ENG-11)", async ({ page }, info) => {
  await registerAndVerify(page, "New Person", `onboard-${info.project.name}@example.com`);
  // Every app route leads to onboarding until a workspace exists.
  for (const path of ["/app", "/app/engagements", "/app/payments", "/app/settings", "/app/business"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/onboarding/);
  }
  await onboardWorkspace(page, "First Co");
  // Overview: the button is in the header AND in the first-engagement prompt.
  await expect(page.getByRole("link", { name: "New engagement" })).toHaveCount(2);
  await page.goto("/app/engagements");
  await expect(page.getByRole("main").getByRole("link", { name: "New engagement" }).first()).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "New engagement" }).first().click();
  await expect(page).toHaveURL(/\/app\/engagements\/new/);
  await expect(page.getByText("Nothing has been created")).toBeVisible();
  // Onboarding is not shown again once a workspace exists.
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/app$/);
});
