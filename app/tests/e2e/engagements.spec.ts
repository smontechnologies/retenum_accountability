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

type Scope = ReturnType<Page["getByRole"]>;

/** Click a "+" (by its accessible name), pick a step type from the categorised menu, fill its form. */
async function addStep(page: Page, plus: string, type: string, fill: (d: Scope) => Promise<void>) {
  await page.getByRole("button", { name: plus }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(`^${type}`) }).click();
  const form = page.getByRole("dialog");
  await expect(form.getByRole("heading", { name: type })).toBeVisible();
  await fill(form);
  await form.getByRole("button", { name: "Add step" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

/** The property editor: right pane on wide screens, bottom sheet on phones. */
const properties = (page: Page) => page.getByRole("complementary", { name: "Property editor" }).or(page.getByRole("dialog"));

async function closeSheetIfOpen(page: Page) {
  if (await page.getByRole("dialog").isVisible()) {
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  }
}

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Engagement sections" }).getByRole("link", { name });

test("UJ-2 (D-67): guided questions write the agreement, edit it as workflows, send; the client asks for changes, then confirms → Active v1", async ({ page, browser }, info) => {
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

  // Guided start: plain questions, problems explained against their fields.
  await expect(page.getByRole("heading", { name: "Set up the agreement" })).toBeVisible();
  await page.getByRole("button", { name: "Set up the agreement" }).click();
  await expect(page.getByText(/Add at least one deliverable/).first()).toBeVisible();
  await expect(page.getByText(/Choose how you'll be paid/).first()).toBeVisible();
  await page.getByLabel("What").nth(0).fill("Three concepts");
  await page.getByLabel("Price (₦)").nth(0).fill("600000");
  await page.getByLabel("What").nth(1).fill("Launch assets");
  await page.getByLabel("Price (₦)").nth(1).fill("900,000");
  await expect(page.getByText("Total: ₦1,500,000.00")).toBeVisible();
  await page.getByRole("radio", { name: /Deposit, then the balance/ }).check();
  await page.getByLabel("Deposit", { exact: true }).fill("40%");
  await expect(page.getByText("Deposit ₦600,000.00, then a balance of ₦900,000.00.")).toBeVisible();
  await page.getByLabel("What they provide").fill("Brand assets");
  await expectDesignGate(page, "guided start");
  await shot(page, "g-guided-start", p);
  await page.getByRole("button", { name: "Set up the agreement" }).click();

  // It lands on the agreement it wrote, in plain clauses.
  await expect(page.getByText("Set up from your answers")).toBeVisible();
  const clauses = page.getByRole("region", { name: /Agreement between/ });
  await expect(clauses).toContainText("a) Kola Foods pays “Deposit”: ₦600,000.00, within 7 days.");
  await expect(clauses).toContainText("d) Kola Foods provides “Brand assets”.");
  await expect(clauses).toContainText("When “Launch assets” is accepted:");
  await expect(clauses).toContainText("a) Kola Foods pays “Balance”: ₦900,000.00, within 7 days.");
  await expect(page.getByRole("region", { name: "Financial position" })).toContainText("₦1,500,000.00");
  await shot(page, "g-generated-agreement", p);

  // Everything is ordinary workflows, editable in the editor.
  await section(page, "Workflows").click();
  const canvas = page.getByRole("region", { name: "Workflow canvas" });
  await expect(canvas).toContainText("When the agreement is confirmed");
  await expect(canvas).toContainText("Ada Studio delivers “Launch assets” for ₦900,000.00");
  await page.getByRole("navigation", { name: "Workflows" }).getByRole("link", { name: /Launch assets.*is accepted/ }).click();
  await canvas.getByRole("link", { name: /Balance/ }).click();
  const props = properties(page);
  await expect(props.getByRole("heading", { name: "Make a payment due", exact: true })).toBeVisible();
  // Money guardrail: no condition can decide whether money is owed.
  await expect(props.getByText(/This step is about money, so it always happens/)).toBeVisible();
  await expect(props.getByLabel("Only when", { exact: true })).toHaveCount(0);
  await closeSheetIfOpen(page);

  // Helpers can be conditional: a reminder workflow.
  await page.getByRole("button", { name: "New workflow" }).click();
  const nw = page.getByRole("dialog");
  await expect(nw.getByLabel("When this happens").locator("option", { hasText: "Another workflow finishes" })).toHaveCount(0);
  await nw.getByLabel("When this happens").selectOption({ label: "Someone doesn't respond in time" });
  await nw.getByRole("button", { name: "Create workflow" }).click();
  await expect(canvas).toContainText("When a request has no response within 3 working days");
  await closeSheetIfOpen(page);
  await page.getByRole("button", { name: "Add a step after the trigger" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: /^Unlock another workflow/ })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: /^Remind/ }).click();
  await page.getByRole("dialog").getByLabel("Who to remind").selectOption({ label: "Kola Foods (paying)" });
  await page.getByRole("dialog").getByRole("button", { name: "Add step" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await canvas.getByRole("link", { name: /Remind Kola Foods/ }).click();
  await expect(props.getByRole("heading", { name: "Remind", exact: true })).toBeVisible();
  await props.getByLabel("Only when", { exact: true }).selectOption({ label: "Days since the trigger" });
  await props.getByLabel("Is", { exact: true }).selectOption({ label: "Less than" });
  await props.getByLabel("Days", { exact: true }).fill("30");
  await props.getByRole("button", { name: "Save condition" }).click();
  await expect(canvas).toContainText("Only when fewer than 30 days have passed since this workflow started");
  await closeSheetIfOpen(page);
  await expect(page.getByRole("navigation", { name: "Workflows" })).toContainText("Reminders");
  await expect(page.getByText("Ready to send")).toBeVisible();
  await expectDesignGate(page, "workflow editor");
  await shot(page, "g-editor", p);

  // Read as agreement: the same workflows as numbered clauses, then send.
  await section(page, "Read as agreement").click();
  await expect(clauses).toContainText("a) Remind Kola Foods after 1 day, only if fewer than 30 days have passed since this workflow started.");
  await expectDesignGate(page, "read as agreement");
  await shot(page, "g-read-as-agreement", p);
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
  await expect(client.getByText("Ada Studio delivers “Three concepts” for ₦600,000.00.").first()).toBeVisible();
  await expectDesignGate(client, "counterparty review and response");
  await shot(client, "g-client-review", p);

  // The client sees the same workflows, read-only.
  await section(client, "Workflows").click();
  await expect(client.getByRole("region", { name: "Workflow canvas" })).toContainText("When the agreement is confirmed");
  await expect(client.getByRole("button", { name: /Add a step/ })).toHaveCount(0);
  await expect(client.getByRole("button", { name: "New workflow" })).toHaveCount(0);
  await section(client, "Read as agreement").click();

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

  // Payee revises the workflows and resends.
  await page.reload();
  await expect(page.getByText("Kola Foods asked for changes")).toBeVisible();
  await section(page, "Workflows").click();
  await addStep(page, "Add a step at the end", "Start a deliverable", async (d) => {
    await d.getByLabel("What will be delivered").fill("Social cut-downs");
    await d.getByLabel("Price (₦)").fill("0");
  });
  await section(page, "Read as agreement").click();
  await page.getByRole("button", { name: "Send for confirmation" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Send for confirmation" }).click();
  await expect(page.getByText("Sent for confirmation")).toBeVisible();

  // Client confirms the revised version from the new link.
  await client.goto(await linkFromEmail(clientEmail, /asked you to confirm/));
  await client.getByRole("button", { name: "Review the agreement" }).click();
  await expect(client.getByText(/Ada Studio delivers “Social cut-downs”/).first()).toBeVisible();
  await client.getByRole("checkbox").check();
  await client.getByRole("button", { name: "Confirm agreement" }).click();
  await expect(client.getByText("Agreement confirmed")).toBeVisible();
  await expect(client.getByText("Version 1", { exact: true })).toBeVisible();

  // Payee sees it active, locked, with the deposit due.
  await page.reload();
  await expect(page.getByText("Version 1", { exact: true })).toBeVisible();
  await expect(page.locator("[data-status='active']").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Financial position" })).toContainText("₦600,000.00");
  await section(page, "Workflows").click();
  await expect(page.getByRole("button", { name: /Add a step/ })).toHaveCount(0);
  await expectDesignGate(page, "active engagement workflows");
  await shot(page, "g-active", p);
  await section(page, "Run history").click();
  await expect(page.getByText("confirmed the agreement. It is now version 1 of the shared record.")).toBeVisible();
  await clientContext.close();
});
