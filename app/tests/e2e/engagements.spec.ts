import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { expectDesignGate, linkFromEmail, MAIL_FILE, onboardWorkspace, registerAndVerify } from "./helpers";

/** The 6-digit code from the newest sign-in-code email to `to`. */
async function codeFromEmail(to: string): Promise<string> {
  for (let i = 0; i < 75; i++) {
    const mails = readFileSync(MAIL_FILE, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as { to: string; subject: string });
    const m = mails.reverse().find((x) => x.to === to && /sign-in code/.test(x.subject));
    if (m) return /(\d{6})/.exec(m.subject)![1]!;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`No code email to ${to}`);
}

/** Optional screenshots for design review: SHOTS=1 pnpm exec playwright test engagements */
async function shot(page: Page, name: string, project: string) {
  if (process.env.SHOTS === "1") await page.screenshot({ path: `../.data/shots/${name}-${project}.png`, fullPage: true });
}

/** "+ Add step" → choose a step type → fill the drawer. */
async function addStep(page: Page, type: string, fill: (d: ReturnType<Page["getByRole"]>) => Promise<void>) {
  await page.getByRole("button", { name: "Add step" }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(`^${type}`) }).click();
  const drawer = page.getByRole("dialog");
  await fill(drawer);
  await drawer.getByRole("button", { name: "Add to agreement" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

async function addItem(page: Page, button: RegExp, fill: (d: ReturnType<Page["getByRole"]>) => Promise<void>, submit = "Add to agreement") {
  await page.getByRole("button", { name: button }).first().click();
  const drawer = page.getByRole("dialog");
  await fill(drawer);
  await drawer.getByRole("button", { name: submit }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

test("UJ-2: create an engagement, send it, the client signs in with a code, asks for changes, then confirms → Active v1", async ({ page, browser }, info) => {
  const p = info.project.name;
  const clientEmail = `ngozi-${p}@kolafoods.ng`;

  // Payee sets up and drafts.
  await registerAndVerify(page, "Ada Obi", `ada-uj2-${p}@studio.ng`);
  await onboardWorkspace(page, "Ada Studio");
  await page.getByRole("link", { name: "New engagement" }).first().click();
  await page.getByLabel("Engagement name").fill("Q1 Campaign");
  await page.getByLabel("Business or person").fill("Kola Foods");
  await page.getByLabel("Contact name").fill("Ngozi Okafor");
  await page.getByLabel("Contact email").fill(clientEmail);
  await page.getByRole("button", { name: "Continue to the agreement" }).click();
  await expect(page.getByText("Draft created")).toBeVisible();

  // Not ready to send yet: the reasons are listed (no empty engagements).
  await expect(page.getByText("Add at least one deliverable: what will be delivered.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send for confirmation" })).toBeDisabled();

  // Bubble-style step flow (D-65): "+ Add step" picks the step type...
  await addStep(page, "Deliverable", async (d) => {
    await d.getByLabel("What will be delivered").fill("Three concepts");
    await d.getByLabel("Price (₦)").fill("600000");
    await d.getByLabel("Definition of done").fill("Three concepts delivered as PDF");
  });
  await addStep(page, "Deliverable", async (d) => {
    await d.getByLabel("What will be delivered").fill("Launch assets");
    await d.getByLabel("Price (₦)").fill("900,000");
  });
  // ...and the "+" under a step adds what happens because of it.
  await addItem(page, /Payment when confirmed/, async (d) => {
    await d.getByLabel("Payment name").fill("Deposit");
    await d.getByLabel("Amount (₦)").fill("600000");
  });
  const launchStep = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Launch assets/ }) });
  await launchStep.getByRole("button", { name: /Payment when accepted/ }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toContainText('Becomes due when "Launch assets" is accepted.');
  await drawer.getByLabel("Payment name").fill("Balance");
  await drawer.getByLabel("Amount (₦)").fill("900000");
  await drawer.getByRole("button", { name: "Add to agreement" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(launchStep).toContainText("Balance becomes due when this is accepted");
  await expect(page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Agreement confirmed/ }) })).toContainText("Deposit becomes due when the agreement is confirmed");

  // Reorder while it's a draft.
  await page.getByRole("button", { name: 'Move "Launch assets" up' }).click();
  await expect(page.getByRole("heading", { level: 3 }).nth(1)).toContainText("Launch assets");
  await page.getByRole("button", { name: 'Move "Launch assets" down' }).click();
  await expect(page.getByRole("heading", { level: 3 }).nth(1)).toContainText("Three concepts");
  await expect(page.getByRole("region", { name: "Financial position" })).toContainText("₦1,500,000.00");
  await expect(page.getByText(/Before you can send this/)).toHaveCount(0);
  await expectDesignGate(page, "draft agreement editor");
  await shot(page, "s2-draft-editor", p);
  await page.getByRole("button", { name: "Add step" }).click();
  await expectDesignGate(page, "add step menu");
  await shot(page, "s2-add-step-menu", p);
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Send for confirmation" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Send for confirmation" }).click();
  await expect(page.getByText("Sent for confirmation")).toBeVisible();
  await expect(page.getByText("Waiting for Kola Foods")).toBeVisible();

  // Client: separate browser, link + email code, no password, no workspace.
  const clientContext = await browser.newContext();
  const client = await clientContext.newPage();
  await client.goto(await linkFromEmail(clientEmail, /asked you to confirm/));
  await expect(client.getByRole("heading", { name: "Q1 Campaign" })).toBeVisible();
  await expectDesignGate(client, "counterparty link page");
  await client.getByRole("button", { name: `Email a sign-in code to ${clientEmail}` }).click();
  await client.getByLabel("Sign-in code").fill(await codeFromEmail(clientEmail));
  await client.getByRole("button", { name: "Continue" }).click();
  await expect(client.getByRole("heading", { name: "Your response" })).toBeVisible();
  await expect(client.getByRole("heading", { name: /Three concepts/ })).toBeVisible();
  await expectDesignGate(client, "counterparty review and response");
  await shot(client, "s2-client-review", p);

  // Confirm requires the acknowledgement.
  await client.getByRole("button", { name: "Confirm agreement" }).click();
  await expect(client.getByRole("main").getByRole("alert").first()).toContainText("Tick the confirmation to continue");

  // Ask for changes instead.
  await client.getByRole("radio", { name: /Ask for changes/ }).check();
  await client.getByLabel("What needs to change").fill("Please add social cut-downs.");
  await client.getByRole("button", { name: "Send request for changes" }).click();
  await expect(client.getByText("Request sent")).toBeVisible();

  // Counterparty-only user is not forced into onboarding.
  await client.goto("/app");
  await expect(client.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();

  // Payee revises and resends.
  await page.goto(page.url().replace(/\?.*$/, "") + "/agreement");
  await expect(page.getByText("Kola Foods asked for changes")).toBeVisible();
  await addStep(page, "Deliverable", async (d) => {
    await d.getByLabel("What will be delivered").fill("Social cut-downs");
    await d.getByLabel("Price (₦)").fill("0");
  });
  await page.getByRole("button", { name: "Send for confirmation" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Send for confirmation" }).click();
  await expect(page.getByText("Sent for confirmation")).toBeVisible();

  // Client confirms the revised version from the new link.
  await client.goto(await linkFromEmail(clientEmail, /asked you to confirm/));
  await client.getByRole("button", { name: "Review the agreement" }).click();
  await expect(client.getByRole("heading", { name: /Social cut-downs/ })).toBeVisible();
  await client.getByRole("checkbox").check();
  await client.getByRole("button", { name: "Confirm agreement" }).click();
  await expect(client.getByText("Agreement confirmed")).toBeVisible();
  await expect(client.getByText("Version 1", { exact: true })).toBeVisible();

  // Payee sees it active, with the deposit due.
  await page.reload();
  await expect(page.getByText("Version 1", { exact: true })).toBeVisible();
  await expect(page.locator("[data-status='active']").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Financial position" })).toContainText("₦600,000.00");
  await expectDesignGate(page, "active engagement overview");
  await shot(page, "s2-active-overview", p);
  await page.getByRole("navigation", { name: "Engagement sections" }).getByRole("link", { name: "Activity" }).click();
  await expect(page.getByText("confirmed the agreement. It is now version 1 of the shared record.")).toBeVisible();
  await clientContext.close();
});
