import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, desc, eq } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { createUser } from "../helpers/users";
import { createAuth, type Auth } from "@/server/auth/auth";
import type { Database } from "@/server/db/client";
import { commitmentRevisions, engagementVersions, engagements, outbox, user, workspaces } from "@/server/db/schema";
import { verifyEngagementChain } from "@/server/events/append";
import type { Actor } from "@/server/lib/actor";
import { AppError } from "@/server/lib/errors";
import {
  acceptEngagementInvitation,
  addCommitment,
  createDraft,
  getEngagementView,
  isCounterpartyAnywhere,
  listEngagementsForActor,
  previewEngagementInvitation,
  removeCommitment,
  respondToBaseline,
  submitForConfirmation,
  updateCommitment,
  withdrawEngagement,
} from "@/server/modules/engagements/service";
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

async function readyDraft(actor: Actor, workspaceId: string, counterpartyEmail: string) {
  const { id } = await createDraft(db, actor, {
    workspaceId,
    title: "Q1 Campaign",
    initiatorSide: "payee",
    counterpartyOrg: "Kola Foods",
    counterpartyName: "Ngozi Okafor",
    counterpartyEmail,
  });
  const { id: concepts } = await addCommitment(db, actor, id, { kind: "deliverable", title: "Three concepts", price: "600,000", definitionOfDone: "3 concepts as PDF" });
  await addCommitment(db, actor, id, { kind: "deliverable", title: "Launch assets", price: "900000" });
  await addCommitment(db, actor, id, { kind: "party_obligation", owedBySide: "payer", title: "Brand assets to agency", dueDate: "2027-01-10" });
  await addCommitment(db, actor, id, { kind: "payment_obligation", title: "Deposit", amount: "600000", trigger: "on_confirmation" });
  await addCommitment(db, actor, id, { kind: "payment_obligation", title: "Balance", amount: "900000", trigger: "on_acceptance", linkedCommitmentId: concepts });
  return { id, concepts };
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

  it("enforces the plan's active-engagement limit (drafts count) with a clear reason", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("limit", "free");
    await createDraft(db, actor, { workspaceId, title: "One", initiatorSide: "payee", counterpartyOrg: "A", counterpartyName: "A", counterpartyEmail: "a@a.ng" });
    const err = await code(createDraft(db, actor, { workspaceId, title: "Two", initiatorSide: "payee", counterpartyOrg: "B", counterpartyName: "B", counterpartyEmail: "b@b.ng" }));
    expect(err.details).toEqual({ reason: "plan_limit" });
  });

  it("refuses non-members", async () => {
    const { workspaceId } = await payeeWithWorkspace("owner2");
    const stranger = await createUser(db, auth, "Stranger", "stranger@x.ng");
    expect((await code(createDraft(db, stranger, { workspaceId, title: "X", initiatorSide: "payee", counterpartyOrg: "A", counterpartyName: "A", counterpartyEmail: "z@z.ng" }))).code).toBe("NOT_FOUND");
  });
});

describe("editing the draft and the no-empty-engagement rule (FR-COM, FR-ENG-12)", () => {
  it("cannot be sent while empty, and explains why", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("empty");
    const { id } = await createDraft(db, actor, { workspaceId, title: "Empty", initiatorSide: "payee", counterpartyOrg: "C", counterpartyName: "C", counterpartyEmail: "c@c.ng" });
    const err = await code(submitForConfirmation(db, actor, id));
    expect((err.details as { problems: string[] }).problems).toEqual([
      "Add at least one deliverable: what will be delivered.",
      "Add a payment schedule: at least one payment and when it becomes due.",
    ]);
  });

  it("validates commitments and protects linked items", async () => {
    const { actor, workspaceId } = await payeeWithWorkspace("edit");
    const { id, concepts } = await readyDraft(actor, workspaceId, "edit-client@client.ng");
    expect((await code(addCommitment(db, actor, id, { kind: "deliverable", title: "Bad", price: "12.345" }))).details).toMatchObject({ fields: { price: expect.any(String) } });
    expect((await code(addCommitment(db, actor, id, { kind: "payment_obligation", title: "P", amount: "1", trigger: "on_date" }))).details).toMatchObject({ fields: { triggerDate: expect.any(String) } });
    expect((await code(addCommitment(db, actor, id, { kind: "payment_obligation", title: "P", amount: "1", trigger: "on_acceptance" }))).details).toMatchObject({ fields: { linkedCommitmentId: expect.any(String) } });
    expect((await code(removeCommitment(db, actor, id, concepts))).message).toMatch(/Balance/);
    await updateCommitment(db, actor, id, concepts, { kind: "deliverable", title: "Three concepts (revised)", price: "650000" });
    const v = await getEngagementView(db, actor, id);
    expect(v.items.find((c) => c.id === concepts)?.priceMinor).toBe(65_000_000n);
    expect(v.summary.agreedMinor).toBe(155_000_000n);
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
    expect((await code(addCommitment(db, payee, id, { kind: "deliverable", title: "Sneaky", price: "1" }))).code).toBe("CONFLICT");

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
    expect(clientViewOfDraft.can.respond).toBe(false);

    // Payee edits and resubmits; the old link stops working.
    await addCommitment(db, payee, id, { kind: "deliverable", title: "Social cut-downs", price: "100000" });
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
    expect((await code(addCommitment(db, payee, id, { kind: "deliverable", title: "After", price: "1" }))).code).toBe("CONFLICT");
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
