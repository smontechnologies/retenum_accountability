import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, desc, eq } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { createUser } from "../helpers/users";
import { createAuth, type Auth } from "@/server/auth/auth";
import type { Database } from "@/server/db/client";
import { commitmentRevisions, engagementVersions, engagements, outbox, user, workflowSteps, workflows, workspaces } from "@/server/db/schema";
import { verifyEngagementChain } from "@/server/events/append";
import type { Actor } from "@/server/lib/actor";
import { AppError } from "@/server/lib/errors";
import {
  acceptEngagementInvitation,
  createDraft,
  getEngagementView,
  isCounterpartyAnywhere,
  listEngagementsForActor,
  previewEngagementInvitation,
  respondToBaseline,
  submitForConfirmation,
  withdrawEngagement,
} from "@/server/modules/engagements/service";
import { addStep, addWorkflow, guidedStart, moveStep, moveWorkflow, removeStep, removeWorkflow, setStepCondition, setWorkflowCondition, updateStep, updateWorkflowTrigger } from "@/server/modules/engagements/workflows";
import { createWorkspace } from "@/server/modules/workspaces/service";

let db: Database;
let auth: Auth;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await createTestDb());
  auth = createAuth(db);
});
afterAll(async () => close());

async function code(p: Promise<unknown>) {
  const e = await p.then(() => null, (x: unknown) => x);
  expect(e).toBeInstanceOf(AppError);
  return e as AppError;
}
const lastEmailTo = async (to: string) => {
  const rows = await db.select().from(outbox).orderBy(desc(outbox.createdAt));
  return rows.map((r) => r.payload as { to: string; subject: string; text: string }).find((m) => m.to === to)!;
};
const tokenFrom = (text: string) => /\/e\/([A-Za-z0-9_-]+)/.exec(text)![1]!;

/** Sign the counterparty in with an email code, exactly as the UI does (FR-ID-05). */
async function signInWithCode(email: string, name: string): Promise<Actor> {
  await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
  const mail = await lastEmailTo(email);
  const otp = /\b(\d{6})\b/.exec(mail.subject)![1]!;
  const res = await auth.api.signInEmailOTP({ body: { email, otp, name } });
  return { userId: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified };
}

async function payeeWithWorkspace(label: string, plan = "pro") {
  const actor = await createUser(db, auth, `${label} Owner`, `${label}@agency.ng`);
  const { id } = await createWorkspace(db, actor, { name: `${label} Studio`, type: "business", contactEmail: actor.email });
  await db.update(workspaces).set({ plan }).where(eq(workspaces.id, id));
  return { actor, workspaceId: id };
}

/**
 * Builds a complete agreement through the workflow API, as the editor does:
 *   "When the agreement is confirmed": Deposit due, start Three concepts, start Launch assets, client provides brand assets
 *   "When Launch assets is accepted": Balance due + notify payee
 */
async function readyDraft(actor: Actor, workspaceId: string, counterpartyEmail: string) {
  const { id } = await createDraft(db, actor, { workspaceId, title: "Q1 Campaign", initiatorSide: "payee", counterpartyOrg: "Kola Foods", counterpartyName: "Ngozi Okafor", counterpartyEmail });
  const main = (await getEngagementView(db, actor, id)).workflows[0]!.id;
  await addStep(db, actor, id, main, "make_payment_due", { title: "Deposit", amount: "600000", termsDays: "7" });
  const { id: conceptsStep } = await addStep(db, actor, id, main, "start_deliverable", { title: "Three concepts", price: "600,000", definitionOfDone: "3 concepts as PDF" });
  const { id: launchStep } = await addStep(db, actor, id, main, "start_deliverable", { title: "Launch assets", price: "900000" });
  await addStep(db, actor, id, main, "party_provides", { owedBySide: "payer", title: "Brand assets to agency", dueDate: "2027-01-10" });
  const v = await getEngagementView(db, actor, id);
  const concepts = v.workflows[0]!.steps.find((x) => x.id === conceptsStep)!.commitment!.id;
  const launch = v.workflows[0]!.steps.find((x) => x.id === launchStep)!.commitment!.id;
  const { id: onLaunch } = await addWorkflow(db, actor, id, { triggerType: "deliverable_accepted", commitmentId: launch });
  await addStep(db, actor, id, onLaunch, "make_payment_due", { title: "Balance", amount: "900000" });
  await addStep(db, actor, id, onLaunch, "notify", { who: "payee", message: "Balance is due" });
  return { id, concepts, launch, main, onLaunch, conceptsStep };
}

describe("creating drafts (FR-ENG-01..03, FR-WS-07, FR-ENG-12)", () => {
  it("creates a draft with both parties and records the event", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("create");
    const { id } = await createDraft(db, actor, { workspaceId, title: "Website", initiatorSide: "payee", counterpartyOrg: "Client Co", counterpartyName: "Bisi", counterpartyEmail: "Bisi@Client.ng" });
    const v = await getEngagementView(db, actor, id);
    expect(v.status).toBe("draft");
    expect(v.me.side).toBe("payee");
    expect(v.other).toMatchObject({ side: "payer", orgName: "Client Co", repEmail: "bisi@client.ng" });
    expect(v.events.map((e) => e.type)).toContain("engagement.draft_created");
  });

  it("refuses the creator's own email as the counterparty", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("self");
    const err = await code(createDraft(db, actor, { workspaceId, title: "X", initiatorSide: "payer", counterpartyOrg: "Me", counterpartyName: "Me", counterpartyEmail: actor.email }));
    expect((err.details as { fields: Record<string, string> }).fields.counterpartyEmail).toMatch(/not your own/);
  });

  it("still enforces a plan's active-engagement limit (drafts count) with a clear reason", async () => {
    // Free is unlimited for now (D-68); the mechanism stays, checked on Pro (10).
    const { actor, workspaceId } = await payeeWithWorkspace("limit", "pro");
    for (let i = 0; i < 10; i++) await createDraft(db, actor, { workspaceId, title: `J${i}`, initiatorSide: "payee", counterpartyOrg: "A", counterpartyName: "A", counterpartyEmail: `a${i}@a.ng` });
    const err = await code(createDraft(db, actor, { workspaceId, title: "Two", initiatorSide: "payee", counterpartyOrg: "B", counterpartyName: "B", counterpartyEmail: "b@b.ng" }));
    expect(err.details).toEqual({ reason: "plan_limit" });
  });

  it("refuses non-members", async () => {
    const { workspaceId } = await payeeWithWorkspace("owner2");
    const stranger = await createUser(db, auth, "Stranger", "stranger@x.ng");
    expect((await code(createDraft(db, stranger, { workspaceId, title: "X", initiatorSide: "payee", counterpartyOrg: "A", counterpartyName: "A", counterpartyEmail: "z@z.ng" }))).code).toBe("NOT_FOUND");
  });
});

describe("workflows: building the agreement (D-66, FR-WF-01…06, FR-ENG-12)", () => {
  it("starts every engagement with one empty 'agreement confirmed' workflow and can't be sent blank", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("empty");
    const { id } = await createDraft(db, actor, { workspaceId, title: "Empty", initiatorSide: "payee", counterpartyOrg: "C", counterpartyName: "C", counterpartyEmail: "c@c.ng" });
    const v = await getEngagementView(db, actor, id);
    expect(v.workflows).toHaveLength(1);
    expect(v.workflows[0]).toMatchObject({ triggerType: "agreement_confirmed", steps: [] });
    const err = await code(submitForConfirmation(db, actor, id));
    expect((err.details as { problems: string[] }).problems).toEqual([
      "Add a step that starts a deliverable: what will be delivered.",
      "Add a step that makes a payment due.",
      "Workflow “When the agreement is confirmed” has no steps. Add a step or remove the workflow.",
    ]);
  });

  it("creates commitments for commercial steps and derives payment triggers from the workflow trigger", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("build");
    const { id, launch, onLaunch } = await readyDraft(actor, workspaceId, "build-client@client.ng");
    const v = await getEngagementView(db, actor, id);
    expect(v.summary.agreedMinor).toBe(150_000_000n);
    expect(v.summary.scheduledMinor).toBe(150_000_000n);
    const deposit = v.items.find((c) => c.title === "Deposit")!;
    const balance = v.items.find((c) => c.title === "Balance")!;
    expect(deposit).toMatchObject({ trigger: "on_confirmation", termsDays: 7 });
    expect(balance).toMatchObject({ trigger: "on_acceptance", linkedCommitmentId: launch });
    expect(v.problems).toEqual([]);
    expect(v.clauses.map((c) => c.text)).toEqual(["When the agreement is confirmed:", "When “Launch assets” is accepted:"]);
    expect(v.clauses[1]!.lines).toEqual(["a) Kola Foods pays “Balance”: ₦900,000.00.", "b) Notify Ada Studio: “Balance is due”."].map((l) => l.replace("Ada Studio", "build Studio")));
    // Changing a workflow's trigger re-derives its payments' trigger.
    await updateWorkflowTrigger(db, actor, id, onLaunch, { triggerType: "date_reached", date: "2027-03-01" });
    const after = await getEngagementView(db, actor, id);
    expect(after.items.find((c) => c.title === "Balance")).toMatchObject({ trigger: "on_date", triggerDate: "2027-03-01", linkedCommitmentId: null });
  });

  it("validates steps, conditions and references, and protects things other workflows depend on", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("edit");
    const { id, main, conceptsStep, launch, onLaunch } = await readyDraft(actor, workspaceId, "edit-client@client.ng");
    expect((await code(addStep(db, actor, id, main, "start_deliverable", { title: "Bad", price: "12.345" }))).details).toMatchObject({ fields: { price: expect.any(String) } });
    expect((await code(addWorkflow(db, actor, id, { triggerType: "" }))).code).toBe("VALIDATION");
    const { id: note } = await addStep(db, actor, id, main, "notify", { who: "payer", message: "Heads up" });
    expect((await code(setStepCondition(db, actor, id, note, { conditionType: "delivered_before", conditionCommitmentId: launch }))).details).toMatchObject({ fields: { conditionDate: expect.any(String) } });
    await setStepCondition(db, actor, id, note, { conditionType: "outstanding_amount", conditionOp: "less", conditionAmount: "50,000" });
    const v = await getEngagementView(db, actor, id);
    expect(v.workflows[0]!.steps.find((x) => x.id === note)!.onlyWhen).toEqual({ type: "outstanding_amount", op: "less", amountMinor: "5000000" });
    // The Launch assets step is watched by another workflow: can't be removed.
    const launchStep = v.workflows[0]!.steps.find((x) => x.commitment?.id === launch)!;
    expect((await code(removeStep(db, actor, id, launchStep.id))).message).toMatch(/refers to this/);
    // Edit a deliverable in place.
    await updateStep(db, actor, id, conceptsStep, { title: "Three concepts (revised)", price: "650000" });
    expect((await getEngagementView(db, actor, id)).summary.agreedMinor).toBe(155_000_000n);
    // Remove the dependent workflow, then the step can go.
    await removeWorkflow(db, actor, id, onLaunch);
    await removeStep(db, actor, id, launchStep.id);
    const end = await getEngagementView(db, actor, id);
    expect(end.workflows).toHaveLength(1);
    expect(end.items.map((c) => c.title)).not.toContain("Launch assets");
  });

  it("reorders steps and workflows while drafting; everything is locked once sent", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("order");
    const { id, main, conceptsStep, onLaunch } = await readyDraft(actor, workspaceId, "order-client@client.ng");
    const titles = async () => (await getEngagementView(db, actor, id)).workflows[0]!.steps.map((x) => x.commitment?.title);
    expect((await titles()).slice(0, 2)).toEqual(["Deposit", "Three concepts"]);
    await moveStep(db, actor, id, conceptsStep, "up");
    expect((await titles()).slice(0, 2)).toEqual(["Three concepts", "Deposit"]);
    await moveStep(db, actor, id, conceptsStep, "up"); // edge: no-op
    expect((await titles())[0]).toBe("Three concepts");
    // "+" after the trigger and after a specific step insert at that point.
    await addStep(db, actor, id, main, "notify", { who: "payer", message: "first", insertAfter: "trigger" });
    await addStep(db, actor, id, main, "notify", { who: "payer", message: "second", insertAfter: conceptsStep });
    const steps = (await getEngagementView(db, actor, id)).workflows[0]!.steps;
    expect(steps[0]!.params.message).toBe("first");
    expect(steps[steps.findIndex((x) => x.id === conceptsStep) + 1]!.params.message).toBe("second");
    await moveWorkflow(db, actor, id, onLaunch, "up");
    expect((await getEngagementView(db, actor, id)).workflows[0]!.id).toBe(onLaunch);
    await moveWorkflow(db, actor, id, onLaunch, "down");
    await submitForConfirmation(db, actor, id);
    expect((await code(addStep(db, actor, id, main, "notify", { who: "both" }))).code).toBe("CONFLICT");
    expect((await code(moveStep(db, actor, id, conceptsStep, "down"))).code).toBe("CONFLICT");
    expect((await code(addWorkflow(db, actor, id, { triggerType: "change_confirmed" }))).code).toBe("CONFLICT");
  });
});

describe("free plan (D-68)", () => {
  it("lets a free workspace create as many engagements as it needs", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("unlimited", "free");
    for (let i = 0; i < 4; i++) {
      await createDraft(db, actor, { workspaceId, title: `Job ${i}`, initiatorSide: "payee", counterpartyOrg: "C", counterpartyName: "C", counterpartyEmail: `c${i}@c.ng` });
    }
    expect(await listEngagementsForActor(db, actor, workspaceId)).toHaveLength(4);
  });
});

describe("guided start and the money guardrail (D-67)", () => {
  const fresh = async (tag: string) => {
    const { actor, workspaceId } = await payeeWithWorkspace(tag);
    const { id } = await createDraft(db, actor, { workspaceId, title: "Kitchen", initiatorSide: "payee", counterpartyOrg: "Kola Foods", counterpartyName: "N", counterpartyEmail: `${tag}-c@c.ng` });
    return { actor, id };
  };
  const answers = { d_title_0: "Design", d_price_0: "400000", d_title_1: "Build", d_price_1: "1,100,000", d_due_1: "2027-04-01", plan: "deposit_balance", deposit: "30%", balanceWhen: "final_accepted", termsDays: "5", provides: "Site access", providesBy: "2027-01-15" };

  it("generates ordinary, ready-to-send workflows from a few answers", async () => {
    const { actor, id } = await fresh("guided");
    await guidedStart(db, actor, id, answers);
    const v = await getEngagementView(db, actor, id);
    expect(v.problems).toEqual([]);
    expect(v.summary.agreedMinor).toBe(150_000_000n);
    expect(v.summary.scheduledMinor).toBe(150_000_000n);
    expect(v.clauses.map((c) => c.text)).toEqual(["When the agreement is confirmed:", "When “Build” is accepted:"]);
    expect(v.clauses[0]!.lines[0]).toBe("a) Kola Foods pays “Deposit”: ₦450,000.00, within 5 days.");
    expect(v.clauses[1]!.lines).toEqual(["a) Kola Foods pays “Balance”: ₦1,050,000.00, within 5 days."]);
    const build = v.items.find((c) => c.title === "Build")!;
    expect(v.items.find((c) => c.title === "Balance")).toMatchObject({ trigger: "on_acceptance", linkedCommitmentId: build.id });
    expect(v.items.find((c) => c.title === "Site access")).toMatchObject({ kind: "party_obligation", owedBySide: "payer", dueDate: "2027-01-15" });
    // It's never run over existing work.
    expect((await code(guidedStart(db, actor, id, answers))).message).toMatch(/already has steps/);
    // And everything stays editable like any workflow.
    await addStep(db, actor, id, v.workflows[0]!.id, "start_deliverable", { title: "Snagging", price: "0" });
    expect((await getEngagementView(db, actor, id)).items.map((c) => c.title)).toContain("Snagging");
  });

  it("reports answer problems against their fields and creates nothing", async () => {
    const { actor, id } = await fresh("guided-bad");
    const err = await code(guidedStart(db, actor, id, { ...answers, deposit: "2,000,000" }));
    expect(err.details).toMatchObject({ fields: { deposit: "The deposit must be less than the total (₦1,500,000.00)" } });
    expect((await getEngagementView(db, actor, id)).items).toEqual([]);
  });

  it("refuses conditions that would decide whether money is owed", async () => {
    const { actor, id } = await fresh("guard");
    await guidedStart(db, actor, id, { ...answers, plan: "per_deliverable" });
    const v = await getEngagementView(db, actor, id);
    const payStep = v.workflows[1]!.steps[0]!;
    const cond = { conditionType: "days_since_trigger", conditionOp: "less", conditionDays: "30" };
    expect((await code(setStepCondition(db, actor, id, payStep.id, cond))).message).toMatch(/can't decide whether money is owed/);
    expect((await code(setWorkflowCondition(db, actor, id, v.workflows[1]!.id, cond))).message).toMatch(/can't decide whether money is owed/);
    // Helpers can be conditional; a conditional workflow can't then take money.
    const { id: remindFlow } = await addWorkflow(db, actor, id, { triggerType: "no_response", days: "3" });
    const { id: remind } = await addStep(db, actor, id, remindFlow, "remind", { who: "payer", afterDays: "1" });
    await setStepCondition(db, actor, id, remind, cond);
    await setWorkflowCondition(db, actor, id, remindFlow, { conditionType: "change_confirmed" });
    expect((await code(addStep(db, actor, id, remindFlow, "make_payment_due", { title: "Sneaky", amount: "1" }))).message).toMatch(/can't contain money/);
    expect((await getEngagementView(db, actor, id)).problems).toEqual([]);
  });
});

describe("submission, counterparty access and confirmation (FR-BAS, FR-ID-05, AC-BAS-1/2)", () => {
  it("runs the full journey: draft hidden → submit → code sign-in → request changes → resubmit → confirm → v1", async () => {
    const { actor: payee, workspaceId } = await payeeWithWorkspace("journey");
    const clientEmail = "ngozi@kolafoods.ng";
    const { id } = await readyDraft(payee, workspaceId, clientEmail);

    // Draft is invisible to anyone outside the initiator's workspace.
    const outsider = await createUser(db, auth, "Outsider", "outsider@x.ng");
    expect((await code(getEngagementView(db, outsider, id))).code).toBe("NOT_FOUND");

    const { seq } = await submitForConfirmation(db, payee, id);
    expect(seq).toBe(1);
    expect((await getEngagementView(db, payee, id)).status).toBe("awaiting_confirmation");
    // Direct edits are refused once sent (AC-BAS-2).
    expect((await code(addStep(db, payee, id, (await getEngagementView(db, payee, id)).workflows[0]!.id, "start_deliverable", { title: "Sneaky", price: "1" }))).code).toBe("CONFLICT");

    const invite = await lastEmailTo(clientEmail);
    expect(invite.subject).toContain("asked you to confirm");
    const token = tokenFrom(invite.text);
    expect(await previewEngagementInvitation(db, token)).toMatchObject({ status: "valid", email: clientEmail, fromOrg: "journey Studio" });

    // A different person cannot use the link; the payee's own team cannot accept it either.
    const wrong = await signInWithCode("someone-else@kolafoods.ng", "Someone");
    expect((await code(acceptEngagementInvitation(db, wrong, token))).code).toBe("FORBIDDEN");

    // Counterparty signs in with an email code (no password) and accepts.
    const client = await signInWithCode(clientEmail, "Ngozi Okafor");
    expect(client.emailVerified).toBe(true);
    const [u] = await db.select().from(user).where(eq(user.email, clientEmail));
    expect(u!.name).toBe("Ngozi Okafor");
    await acceptEngagementInvitation(db, client, token);
    expect(await isCounterpartyAnywhere(db, client.userId)).toBe(true);

    const cv = await getEngagementView(db, client, id);
    expect(cv.me.side).toBe("payer");
    expect(cv.can.respond).toBe(true);
    expect(cv.can.editDraft).toBe(false);
    expect((await getEngagementView(db, payee, id)).can.respond).toBe(false); // can't confirm your own proposal
    expect((await code(respondToBaseline(db, payee, id, { response: "confirm", submissionId: cv.latestSubmission!.id, acknowledged: "yes" }))).code).toBe("FORBIDDEN");

    // Acknowledgement is required to confirm.
    expect((await code(respondToBaseline(db, client, id, { response: "confirm", submissionId: cv.latestSubmission!.id } as never))).code).toBe("VALIDATION");

    // Request changes → back to draft; the client still sees what was sent to them.
    await respondToBaseline(db, client, id, { response: "request_changes", submissionId: cv.latestSubmission!.id, comment: "Please split the deposit." });
    expect((await getEngagementView(db, payee, id)).status).toBe("draft");
    const clientViewOfDraft = await getEngagementView(db, client, id);
    expect(clientViewOfDraft.items.map((c) => c.title)).toContain("Three concepts");
    expect(clientViewOfDraft.clauses.length).toBeGreaterThan(0); // reads the snapshot the client was sent
    expect(clientViewOfDraft.can.respond).toBe(false);

    // Payee edits and resubmits; the old link stops working.
    await addStep(db, payee, id, (await getEngagementView(db, payee, id)).workflows[0]!.id, "start_deliverable", { title: "Social cut-downs", price: "100000" });
    const { seq: seq2 } = await submitForConfirmation(db, payee, id);
    expect(seq2).toBe(2);
    expect((await previewEngagementInvitation(db, token)).status).toBe("revoked");
    const token2 = tokenFrom((await lastEmailTo(clientEmail)).text);
    await acceptEngagementInvitation(db, client, token2);

    // Responding to an outdated version is refused.
    const v2 = await getEngagementView(db, client, id);
    expect((await code(respondToBaseline(db, client, id, { response: "confirm", submissionId: cv.latestSubmission!.id, acknowledged: "yes" }))).code).toBe("CONFLICT");

    // Confirm → active version 1; deposit becomes due; history verifies.
    await respondToBaseline(db, client, id, { response: "confirm", submissionId: v2.latestSubmission!.id, acknowledged: "yes" });
    const active = await getEngagementView(db, payee, id);
    expect(active.status).toBe("active");
    expect(active.engagement.currentVersion).toBe(1);
    expect(active.figures.agreed).toBe(160_000_000n);
    expect(active.figures.due).toBe(60_000_000n);
    const [ver] = await db.select().from(engagementVersions).where(eq(engagementVersions.engagementId, id));
    expect(ver).toMatchObject({ version: 1, cause: "baseline" });
    const revs = await db.select().from(commitmentRevisions);
    expect(revs.some((r) => r.versionFrom === 0 && active.items.some((c) => c.id === r.commitmentId))).toBe(false);
    expect((await code(respondToBaseline(db, client, id, { response: "confirm", submissionId: v2.latestSubmission!.id, acknowledged: "yes" }))).code).toBe("FORBIDDEN");
    expect((await code(addStep(db, payee, id, active.workflows[0]!.id, "start_deliverable", { title: "After", price: "1" }))).code).toBe("CONFLICT");
    // Workflows and steps are version 1 of the agreement now.
    expect((await db.select().from(workflows).where(eq(workflows.engagementId, id))).every((w) => w.versionFrom === 1)).toBe(true);
    expect((await db.select().from(workflowSteps)).filter((x) => active.workflows.some((w) => w.id === x.workflowId)).every((x) => x.versionFrom === 1)).toBe(true);
    const snap = v2.latestSubmission!.snapshot as { clauses: Array<{ text: string }> };
    expect(snap.clauses.map((c) => c.text)).toEqual(active.clauses.map((c) => c.text)); // what was confirmed = what is shown
    expect(await verifyEngagementChain(db, id)).toBeNull();
    expect(active.events.map((e) => e.type)).toEqual(
      expect.arrayContaining(["baseline.submitted", "invitation.accepted", "baseline.changes_requested", "baseline.resubmitted", "baseline.confirmed"]),
    );

    // Lists: the client sees it as a counterparty; the payee's workspace list includes it.
    const clientList = await listEngagementsForActor(db, client, null);
    expect(clientList.map((e) => e.id)).toContain(id);
    const payeeList = await listEngagementsForActor(db, payee, workspaceId);
    expect(payeeList.find((e) => e.id === id)).toMatchObject({ status: "active", otherParty: "Kola Foods", mySide: "payee" });
  });

  it("decline withdraws the engagement and revokes the link; withdraw works before confirmation", async () => {
    const { actor: payee, workspaceId } = await payeeWithWorkspace("decline");
    const email = "decline-client@client.ng";
    const { id } = await readyDraft(payee, workspaceId, email);
    await submitForConfirmation(db, payee, id);
    const token = tokenFrom((await lastEmailTo(email)).text);
    const client = await signInWithCode(email, "Client");
    await acceptEngagementInvitation(db, client, token);
    const v = await getEngagementView(db, client, id);
    expect((await code(respondToBaseline(db, client, id, { response: "decline", submissionId: v.latestSubmission!.id, comment: "" }))).code).toBe("VALIDATION");
    await respondToBaseline(db, client, id, { response: "decline", submissionId: v.latestSubmission!.id, comment: "We chose another agency." });
    expect((await getEngagementView(db, payee, id)).status).toBe("withdrawn");
    expect((await previewEngagementInvitation(db, token)).status).toBe("revoked");

    const { id: id2 } = await readyDraft(payee, workspaceId, "other@client.ng");
    await withdrawEngagement(db, payee, id2);
    const [e2] = await db.select().from(engagements).where(and(eq(engagements.id, id2)));
    expect(e2!.status).toBe("withdrawn");
  });

  it("a member of the initiating workspace cannot accept the counterparty link", async () => {
    const { actor: payee, workspaceId } = await payeeWithWorkspace("selfaccept");
    const { id } = await readyDraft(payee, workspaceId, "selfaccept-client@client.ng");
    await submitForConfirmation(db, payee, id);
    const token = tokenFrom((await lastEmailTo("selfaccept-client@client.ng")).text);
    const forged = { ...payee, email: "selfaccept-client@client.ng" }; // even if emails matched
    expect((await code(acceptEngagementInvitation(db, forged, token))).code).toBe("CONFLICT");
  });
});
