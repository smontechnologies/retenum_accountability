import { and, asc, count, desc, eq, inArray, isNull, max, sql } from "drizzle-orm";
import type { z } from "zod";
import { dueByObligation, summarise, type CommitmentView, type Side } from "@/domain/baseline";
import { agreementClauses, commitmentsOf, sendProblems, type SentenceContext, type WorkflowView } from "@/domain/workflow";
import { COUNTS_TOWARDS_LIMIT, nextStatus, type EngagementStatus } from "@/domain/engagement-state";
import { formatMoney, isCurrency, money, parseAmount } from "@/domain/money";
import { addWorkingDays } from "@/domain/working-days";
import type { Database } from "../../db/client";
import {
  baselineSubmissions,
  commitmentRevisions,
  commitments,
  engagementEvents,
  engagementInvitations,
  engagementParties,
  engagementVersions,
  engagements,
  partyMembers,
  user,
  workflowSteps,
  workflows,
  workspaceMembers,
  workspaces,
  type ResponseWindows,
} from "../../db/schema";
import { appendEvent } from "../../events/append";
import type { Actor } from "../../lib/actor";
import { env } from "../../lib/env";
import { AppError, conflict, forbidden, notFound, validationError } from "../../lib/errors";
import { hashToken, newId, newSecretToken } from "../../lib/ids";
import { enqueueEmail } from "../../outbox/outbox";
import { engagementCan, type EngagementAction, type EngagementViewer } from "../../policy/engagement-policy";
import { isPlan, PLAN_LIMITS } from "../workspaces/plans";
import { ensureWorkflows, insertDefaultWorkflow, loadWorkflows } from "./workflows";
import {
  BaselineResponseInput,
  CreateDraftInput,
  DeliverableInput,
  PartyObligationInput,
  PaymentObligationInput,
  ResponseWindowsInput,
} from "./validation";

export const DEFAULT_RESPONSE_WINDOWS: ResponseWindows = { baseline: 5, changes: 3, deliveries: 5, paymentConfirmations: 3 };

export type Tx = Database;
export const tx = <T>(db: Database, fn: (t: Tx) => Promise<T>) => db.transaction((raw) => fn(raw as unknown as Tx));

export function parse<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const r = schema.safeParse(input);
  if (!r.success) {
    throw validationError("Some details need fixing.", { fields: Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message])) });
  }
  return r.data;
}

function requireVerified(actor: Actor) {
  if (!actor.emailVerified) throw forbidden("Please verify your email address first.");
}

const otherSide = (s: Side): Side => (s === "payer" ? "payee" : "payer");

const dateFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
/** Wording context for workflow sentences and clauses (domain/workflow.ts). */
export function sentenceContext(workflowsList: WorkflowView[], payerName: string, payeeName: string): SentenceContext {
  const items = commitmentsOf(workflowsList);
  return {
    commitments: new Map(items.map((c) => [c.id, c])),
    workflows: new Map(workflowsList.map((w) => [w.id, w])),
    payerName,
    payeeName,
    formatDate: (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`)),
  };
}

function serialiseWorkflows(wfs: WorkflowView[]) {
  return wfs.map((w) => ({ ...w, steps: w.steps.map((st) => ({ ...st, commitment: st.commitment ? { ...st.commitment, priceMinor: st.commitment.priceMinor === null ? null : st.commitment.priceMinor.toString() } : null })) }));
}
function deserialiseWorkflows(raw: unknown): WorkflowView[] {
  return ((raw ?? []) as Array<WorkflowView & { steps: Array<{ commitment: (CommitmentView & { priceMinor: string | null }) | null }> }>).map((w) => ({
    ...w,
    steps: w.steps.map((st) => ({ ...(st as WorkflowView["steps"][number]), commitment: st.commitment ? { ...st.commitment, priceMinor: st.commitment.priceMinor === null ? null : BigInt(st.commitment.priceMinor) } : null })),
  }));
}

// ------------------------------------------------------------------------------------------------
// Loading and authorisation

export async function loadEngagement(db: Database, id: string, lock = false) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound("Engagement not found.");
  const q = db.select().from(engagements).where(eq(engagements.id, id)).limit(1);
  const [e] = lock ? await q.for("update") : await q;
  if (!e) throw notFound("Engagement not found.");
  return e;
}

/** Resolves how the actor relates to an engagement (EngagementViewer) or null. */
export async function resolveViewer(db: Database, actor: Actor, engagement: typeof engagements.$inferSelect): Promise<EngagementViewer | null> {
  const parties = await db.select().from(engagementParties).where(eq(engagementParties.engagementId, engagement.id));
  const initiator = parties.find((p) => p.isInitiator)!;
  const [membership] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, engagement.initiatorWorkspaceId), eq(workspaceMembers.userId, actor.userId)))
    .limit(1);
  if (membership) {
    const approver = engagement.createdBy === actor.userId || membership.role === "owner" || membership.role === "admin";
    return { side: initiator.side as Side, isInitiatorSide: true, authority: approver ? "approver" : "contributor" };
  }
  const counterparty = parties.find((p) => !p.isInitiator)!;
  const [pm] = await db
    .select()
    .from(partyMembers)
    .where(and(eq(partyMembers.partyId, counterparty.id), eq(partyMembers.userId, actor.userId)))
    .limit(1);
  if (pm) return { side: counterparty.side as Side, isInitiatorSide: false, authority: pm.authority as "approver" | "contributor" };
  return null;
}

async function hasSubmission(db: Database, engagementId: string) {
  const [r] = await db.select({ n: count() }).from(baselineSubmissions).where(eq(baselineSubmissions.engagementId, engagementId));
  return (r?.n ?? 0) > 0;
}

export async function authorise(db: Database, actor: Actor, id: string, action: EngagementAction, opts: { lock?: boolean } = {}) {
  requireVerified(actor);
  const engagement = await loadEngagement(db, id, opts.lock);
  const viewer = await resolveViewer(db, actor, engagement);
  const ctx = { status: engagement.status as EngagementStatus, hasSubmission: await hasSubmission(db, id) };
  // Non-parties (and counterparties before first submission) get NOT_FOUND: no hint it exists.
  if (!viewer || !engagementCan(viewer, "engagement.view", ctx)) throw notFound("Engagement not found.");
  if (!engagementCan(viewer, action, ctx)) {
    if (action === "engagement.edit_draft" || action === "engagement.submit") {
      throw conflict(ctx.status === "draft" ? "Only the people who can approve for your side can do this." : "This engagement can no longer be edited directly.");
    }
    throw forbidden();
  }
  return { engagement, viewer };
}

/** Current commitment values: latest revision at or below the current version, excluding removed. */
export async function loadCommitments(db: Database, engagementId: string, currentVersion: number): Promise<CommitmentView[]> {
  const rows = await db
    .select({ c: commitments, r: commitmentRevisions })
    .from(commitments)
    .innerJoin(commitmentRevisions, eq(commitmentRevisions.commitmentId, commitments.id))
    .where(and(eq(commitments.engagementId, engagementId), isNull(commitments.removedInVersion)))
    .orderBy(asc(commitments.position), desc(commitmentRevisions.versionFrom));
  const seen = new Set<string>();
  const out: CommitmentView[] = [];
  for (const { c, r } of rows) {
    if (seen.has(c.id) || r.versionFrom > currentVersion) continue;
    seen.add(c.id);
    out.push({
      id: c.id,
      kind: c.kind as CommitmentView["kind"],
      owedBySide: c.owedBySide as Side,
      position: c.position,
      title: r.title,
      description: r.description,
      quantity: r.quantity,
      unit: r.unit,
      definitionOfDone: r.definitionOfDone,
      dueDate: r.dueDate,
      exclusions: r.exclusions,
      priceMinor: r.priceMinor,
      trigger: r.trigger as CommitmentView["trigger"],
      triggerDate: r.triggerDate,
      termsDays: r.termsDays,
      linkedCommitmentId: r.linkedCommitmentId,
    });
  }
  return out;
}

// ------------------------------------------------------------------------------------------------
// Reads

export async function countActiveEngagements(db: Database, workspaceId: string) {
  const [r] = await db
    .select({ n: count() })
    .from(engagements)
    .where(and(eq(engagements.initiatorWorkspaceId, workspaceId), inArray(engagements.status, COUNTS_TOWARDS_LIMIT)));
  return r?.n ?? 0;
}

export async function getEngagementView(db: Database, actor: Actor, id: string, todayIso = new Date().toISOString().slice(0, 10)) {
  const { engagement, viewer } = await authorise(db, actor, id, "engagement.view");
  const status = engagement.status as EngagementStatus;
  const parties = await db.select().from(engagementParties).where(eq(engagementParties.engagementId, id));
  const submissions = await db.select().from(baselineSubmissions).where(eq(baselineSubmissions.engagementId, id)).orderBy(desc(baselineSubmissions.seq));
  const latest = submissions[0] ?? null;
  // A counterparty looking at a draft that is being revised sees the last version sent to them.
  const showSnapshot = !viewer.isInitiatorSide && status === "draft" && latest;
  if (!showSnapshot) await ensureWorkflows(db, id, engagement.currentVersion, parties.find((p) => p.isInitiator)!.side as Side);
  const wfs = showSnapshot ? deserialiseWorkflows(latest.snapshot.workflows) : await loadWorkflows(db, id, engagement.currentVersion);
  const items = commitmentsOf(wfs);
  const payerName = parties.find((p) => p.side === "payer")!.orgName;
  const payeeName = parties.find((p) => p.side === "payee")!.orgName;
  const ctxWords = sentenceContext(wfs, payerName, payeeName);
  const summary = summarise(items);
  const confirmed = engagement.currentVersion >= 1;
  const due = dueByObligation(items, confirmed && status === "active", todayIso);
  const dueMinor = [...due.values()].reduce((a, b) => a + b, 0n);
  const events = await db
    .select({ e: engagementEvents, actorName: user.name })
    .from(engagementEvents)
    .leftJoin(user, eq(user.id, engagementEvents.actorUserId))
    .where(eq(engagementEvents.engagementId, id))
    .orderBy(desc(engagementEvents.seq))
    .limit(100);
  const invitation = viewer.isInitiatorSide
    ? (
        await db
          .select({ email: engagementInvitations.email, createdAt: engagementInvitations.createdAt, firstAcceptedAt: engagementInvitations.firstAcceptedAt })
          .from(engagementInvitations)
          .where(and(eq(engagementInvitations.engagementId, id), isNull(engagementInvitations.revokedAt)))
          .orderBy(desc(engagementInvitations.createdAt))
          .limit(1)
      )[0] ?? null
    : null;
  const ctx = { status, hasSubmission: submissions.length > 0 };
  return {
    engagement,
    status,
    viewer,
    me: parties.find((p) => p.side === viewer.side)!,
    other: parties.find((p) => p.side !== viewer.side)!,
    parties,
    items,
    summary,
    due,
    figures: { agreed: summary.agreedMinor, paid: 0n, outstanding: dueMinor, due: dueMinor },
    latestSubmission: latest,
    submissions,
    invitation,
    problems: sendProblems(wfs, ctxWords),
    workflows: wfs,
    words: ctxWords,
    clauses: agreementClauses(wfs, ctxWords),
    events: events.map(({ e, actorName }) => ({ ...e, actorName })),
    can: {
      editDraft: engagementCan(viewer, "engagement.edit_draft", ctx),
      submit: engagementCan(viewer, "engagement.submit", ctx),
      withdraw: engagementCan(viewer, "engagement.withdraw", ctx),
      resendInvitation: engagementCan(viewer, "engagement.resend_invitation", ctx),
      respond: engagementCan(viewer, "baseline.respond", ctx),
    },
  };
}

/** Engagements the actor can see: those of their current workspace, plus those they're a counterparty to. */
export async function listEngagementsForActor(db: Database, actor: Actor, workspaceId: string | null) {
  const own = workspaceId
    ? await db.select({ id: engagements.id }).from(engagements).where(eq(engagements.initiatorWorkspaceId, workspaceId))
    : [];
  const asCounterparty = await db
    .select({ id: engagementParties.engagementId })
    .from(partyMembers)
    .innerJoin(engagementParties, eq(engagementParties.id, partyMembers.partyId))
    .where(eq(partyMembers.userId, actor.userId));
  const ids = [...new Set([...own.map((r) => r.id), ...asCounterparty.map((r) => r.id)])];
  if (ids.length === 0) return [];
  const rows = await db.select().from(engagements).where(inArray(engagements.id, ids)).orderBy(desc(engagements.updatedAt));
  const parties = await db.select().from(engagementParties).where(inArray(engagementParties.engagementId, ids));
  const out = [];
  for (const e of rows) {
    const viewer = await resolveViewer(db, actor, e);
    if (!viewer) continue;
    const subs = await hasSubmission(db, e.id);
    if (!engagementCan(viewer, "engagement.view", { status: e.status as EngagementStatus, hasSubmission: subs })) continue;
    const items = commitmentsOf(await loadWorkflows(db, e.id, e.currentVersion));
    const other = parties.find((p) => p.engagementId === e.id && p.side !== viewer.side)!;
    const needsMe =
      (e.status === "awaiting_confirmation" && !viewer.isInitiatorSide && viewer.authority === "approver") ||
      (e.status === "draft" && viewer.isInitiatorSide && subs); // changes requested: back with us
    out.push({
      id: e.id,
      title: e.title,
      status: e.status as EngagementStatus,
      mySide: viewer.side,
      otherParty: other.orgName,
      agreedMinor: summarise(items).agreedMinor,
      currency: e.currency,
      updatedAt: e.updatedAt,
      needsMe,
    });
  }
  return out;
}

// ------------------------------------------------------------------------------------------------
// Draft creation and editing

export async function createDraft(db: Database, actor: Actor, input: z.input<typeof CreateDraftInput>) {
  requireVerified(actor);
  const data = parse(CreateDraftInput, input);
  const [membership] = await db
    .select({ role: workspaceMembers.role, plan: workspaces.plan, name: workspaces.name, suspendedAt: workspaces.suspendedAt })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, actor.userId)))
    .limit(1);
  if (!membership) throw notFound("Workspace not found.");
  if (membership.suspendedAt) throw forbidden("This workspace is suspended.");
  if (data.counterpartyEmail === actor.email.toLowerCase()) {
    throw validationError("Some details need fixing.", { fields: { counterpartyEmail: "Use the other party's email, not your own" } });
  }
  const plan = isPlan(membership.plan) ? membership.plan : "free";
  return tx(db, async (t) => {
    await t.execute(sql`select pg_advisory_xact_lock(hashtext(${"ws-engagements:" + data.workspaceId}))`);
    if ((await countActiveEngagements(t, data.workspaceId)) >= PLAN_LIMITS[plan].activeEngagements) {
      throw new AppError(
        "CONFLICT",
        `Your ${plan} plan allows ${PLAN_LIMITS[plan].activeEngagements} active engagement${PLAN_LIMITS[plan].activeEngagements === 1 ? "" : "s"}. Close or withdraw one, or upgrade, to create another.`,
        { reason: "plan_limit" },
      );
    }
    const id = newId();
    const now = new Date();
    await t.insert(engagements).values({
      id,
      initiatorWorkspaceId: data.workspaceId,
      title: data.title,
      description: data.description ?? null,
      currency: "NGN",
      status: "draft",
      responseWindows: DEFAULT_RESPONSE_WINDOWS,
      createdBy: actor.userId,
      createdAt: now,
      updatedAt: now,
    });
    await t.insert(engagementParties).values([
      { id: newId(), engagementId: id, side: data.initiatorSide, isInitiator: true, workspaceId: data.workspaceId, orgName: membership.name },
      {
        id: newId(),
        engagementId: id,
        side: otherSide(data.initiatorSide),
        isInitiator: false,
        orgName: data.counterpartyOrg,
        repName: data.counterpartyName,
        repEmail: data.counterpartyEmail,
      },
    ]);
    await insertDefaultWorkflow(t, id, data.initiatorSide);
    await appendEvent(t, {
      engagementId: id,
      type: "engagement.draft_created",
      actorUserId: actor.userId,
      actorSide: data.initiatorSide,
      data: { title: data.title, counterpartyOrg: data.counterpartyOrg },
    });
    return { id };
  });
}

export async function nextPosition(t: Tx, engagementId: string) {
  const [r] = await t.select({ m: max(commitments.position) }).from(commitments).where(eq(commitments.engagementId, engagementId));
  return (r?.m ?? -1) + 1;
}

function amount(raw: string, currency: string, field: string): bigint {
  if (!isCurrency(currency)) throw new Error(`Unsupported currency ${currency}`);
  try {
    const v = parseAmount(raw, currency);
    return v;
  } catch {
    throw validationError("Some details need fixing.", { fields: { [field]: "Use an amount like 250000 or 250,000.00" } });
  }
}

export type CommitmentInput =
  | ({ kind: "deliverable" } & z.input<typeof DeliverableInput>)
  | ({ kind: "party_obligation" } & z.input<typeof PartyObligationInput>)
  | ({ kind: "payment_obligation" } & z.input<typeof PaymentObligationInput>);

export function revisionValues(kind: CommitmentInput["kind"], input: CommitmentInput, currency: string, items: CommitmentView[]) {
  if (kind === "deliverable") {
    const d = parse(DeliverableInput, input);
    return {
      owedBySide: null as Side | null,
      values: {
        title: d.title,
        description: d.description ?? null,
        quantity: d.quantity ?? null,
        unit: d.unit ?? null,
        definitionOfDone: d.definitionOfDone ?? null,
        dueDate: d.dueDate ?? null,
        exclusions: d.exclusions ?? null,
        priceMinor: amount(d.price, currency, "price"),
      },
    };
  }
  if (kind === "party_obligation") {
    const p = parse(PartyObligationInput, input);
    return { owedBySide: p.owedBySide as Side, values: { title: p.title, description: p.description ?? null, dueDate: p.dueDate ?? null } };
  }
  const p = parse(PaymentObligationInput, input);
  if (p.trigger === "on_date" && !p.triggerDate) throw validationError("Some details need fixing.", { fields: { triggerDate: "Choose the date it becomes due" } });
  if (p.trigger === "on_acceptance") {
    const linked = items.find((c) => c.id === p.linkedCommitmentId && c.kind === "deliverable");
    if (!linked) throw validationError("Some details need fixing.", { fields: { linkedCommitmentId: "Choose the deliverable whose acceptance makes this due" } });
  }
  const value = amount(p.amount, currency, "amount");
  if (value <= 0n) throw validationError("Some details need fixing.", { fields: { amount: "Enter an amount greater than zero" } });
  return {
    owedBySide: "payer" as Side,
    values: {
      title: p.title,
      priceMinor: value,
      trigger: p.trigger,
      triggerDate: p.trigger === "on_date" ? (p.triggerDate ?? null) : null,
      termsDays: p.termsDays ?? null,
      linkedCommitmentId: p.trigger === "on_acceptance" ? (p.linkedCommitmentId ?? null) : null,
    },
  };
}

export async function updateResponseWindows(db: Database, actor: Actor, engagementId: string, input: z.input<typeof ResponseWindowsInput>) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const w = parse(ResponseWindowsInput, input);
  await tx(db, async (t) => {
    await t.update(engagements).set({ responseWindows: w, updatedAt: new Date() }).where(eq(engagements.id, engagementId));
    await appendEvent(t, { engagementId, type: "draft.response_windows_updated", actorUserId: actor.userId, actorSide: viewer.side, data: { ...w } });
  });
}

// ------------------------------------------------------------------------------------------------
// Submission, invitation and response

function snapshotOf(e: typeof engagements.$inferSelect, parties: Array<typeof engagementParties.$inferSelect>, wfs: WorkflowView[], seq: number) {
  const items = commitmentsOf(wfs);
  const s = summarise(items);
  const words = sentenceContext(wfs, parties.find((p) => p.side === "payer")!.orgName, parties.find((p) => p.side === "payee")!.orgName);
  return {
    workflows: serialiseWorkflows(wfs),
    clauses: agreementClauses(wfs, words),
    seq,
    title: e.title,
    description: e.description,
    currency: e.currency,
    parties: Object.fromEntries(parties.map((p) => [p.side, { orgName: p.orgName, repName: p.repName, repEmail: p.repEmail, isInitiator: p.isInitiator }])),
    responseWindows: e.responseWindows,
    commitments: items.map((c) => ({ ...c, priceMinor: c.priceMinor === null ? null : c.priceMinor.toString() })),
    summary: { agreedMinor: s.agreedMinor.toString(), scheduledMinor: s.scheduledMinor.toString(), unscheduledMinor: s.unscheduledMinor.toString() },
  };
}

async function issueInvitation(t: Tx, actor: Actor, engagement: typeof engagements.$inferSelect, counterparty: typeof engagementParties.$inferSelect) {
  await t
    .update(engagementInvitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(engagementInvitations.engagementId, engagement.id), isNull(engagementInvitations.revokedAt)));
  const { token, hash } = newSecretToken();
  await t.insert(engagementInvitations).values({
    id: newId(),
    engagementId: engagement.id,
    partyId: counterparty.id,
    email: counterparty.repEmail!,
    tokenHash: hash,
    createdBy: actor.userId,
  });
  return `${env().APP_URL}/e/${token}`;
}

export async function submitForConfirmation(db: Database, actor: Actor, engagementId: string, now = new Date()) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.submit");
  return tx(db, async (t) => {
    const engagement = await loadEngagement(t, engagementId, true);
    const status = engagement.status as EngagementStatus;
    const to = nextStatus(status, "submit");
    if (!to) throw conflict("This engagement can't be sent for confirmation now.");
    const parties = await t.select().from(engagementParties).where(eq(engagementParties.engagementId, engagementId));
    const wfs = await loadWorkflows(t, engagementId, 0);
    const items = commitmentsOf(wfs);
    const problems = sendProblems(wfs, sentenceContext(wfs, parties.find((p) => p.side === "payer")!.orgName, parties.find((p) => p.side === "payee")!.orgName));
    if (problems.length > 0) throw new AppError("CONFLICT", "This engagement isn't ready to send yet.", { problems });
    const counterparty = parties.find((p) => !p.isInitiator)!;
    const [{ m } = { m: 0 }] = await t.select({ m: max(baselineSubmissions.seq) }).from(baselineSubmissions).where(eq(baselineSubmissions.engagementId, engagementId));
    const seq = (m ?? 0) + 1;
    const submissionId = newId();
    const respondBy = addWorkingDays(now, engagement.responseWindows.baseline);
    await t.insert(baselineSubmissions).values({
      id: submissionId,
      engagementId,
      seq,
      snapshot: snapshotOf(engagement, parties, wfs, seq),
      status: "open",
      submittedBy: actor.userId,
      submittedAt: now,
      respondBy,
    });
    await t.update(engagements).set({ status: to, updatedAt: now }).where(eq(engagements.id, engagementId));
    const link = await issueInvitation(t, actor, engagement, counterparty);
    const initiator = parties.find((p) => p.isInitiator)!;
    const agreed = formatMoney(money(summarise(items).agreedMinor, "NGN"));
    await enqueueEmail(t, {
      to: counterparty.repEmail!,
      subject: `${initiator.orgName} asked you to confirm "${engagement.title}"`,
      text: [
        `${initiator.orgName} has recorded an engagement with ${counterparty.orgName} on Retenum and asked you to confirm it.`,
        ``,
        `Engagement: ${engagement.title}`,
        `Agreed value: ${agreed}`,
        `Please respond by ${respondBy.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" })}.`,
        ``,
        `Review it here (you'll get a sign-in code by email; no password needed): ${link}`,
        ``,
        `Retenum records what both parties confirm. It does not hold money or decide disputes.`,
      ].join("\n"),
    });
    await appendEvent(t, {
      engagementId,
      type: seq === 1 ? "baseline.submitted" : "baseline.resubmitted",
      actorUserId: actor.userId,
      actorSide: viewer.side,
      target: { kind: "baseline_submission", id: submissionId },
      data: { seq, respondBy: respondBy.toISOString(), counterpartyEmail: counterparty.repEmail },
    });
    return { submissionId, seq };
  });
}

export async function resendInvitation(db: Database, actor: Actor, engagementId: string) {
  const { engagement, viewer } = await authorise(db, actor, engagementId, "engagement.resend_invitation");
  await tx(db, async (t) => {
    const parties = await t.select().from(engagementParties).where(eq(engagementParties.engagementId, engagementId));
    const counterparty = parties.find((p) => !p.isInitiator)!;
    const link = await issueInvitation(t, actor, engagement, counterparty);
    await enqueueEmail(t, {
      to: counterparty.repEmail!,
      subject: `Reminder: please review "${engagement.title}" on Retenum`,
      text: `You've been asked to confirm "${engagement.title}". Review it here (sign-in code by email, no password needed): ${link}\n\nEarlier links no longer work.`,
    });
    await appendEvent(t, { engagementId, type: "invitation.resent", actorUserId: actor.userId, actorSide: viewer.side, data: { email: counterparty.repEmail } });
  });
}

export async function withdrawEngagement(db: Database, actor: Actor, engagementId: string) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.withdraw");
  await tx(db, async (t) => {
    const e = await loadEngagement(t, engagementId, true);
    const to = nextStatus(e.status as EngagementStatus, "withdraw");
    if (!to) throw conflict("This engagement can't be withdrawn now.");
    await t.update(baselineSubmissions).set({ status: "withdrawn" }).where(and(eq(baselineSubmissions.engagementId, engagementId), eq(baselineSubmissions.status, "open")));
    await t.update(engagementInvitations).set({ revokedAt: new Date() }).where(and(eq(engagementInvitations.engagementId, engagementId), isNull(engagementInvitations.revokedAt)));
    await t.update(engagements).set({ status: to, updatedAt: new Date() }).where(eq(engagements.id, engagementId));
    await appendEvent(t, { engagementId, type: "engagement.withdrawn", actorUserId: actor.userId, actorSide: viewer.side, data: {} });
  });
}

export async function respondToBaseline(db: Database, actor: Actor, engagementId: string, input: z.input<typeof BaselineResponseInput>, now = new Date()) {
  const data = parse(BaselineResponseInput, input);
  const { viewer } = await authorise(db, actor, engagementId, "baseline.respond");
  return tx(db, async (t) => {
    const e = await loadEngagement(t, engagementId, true);
    const [open] = await t
      .select()
      .from(baselineSubmissions)
      .where(and(eq(baselineSubmissions.engagementId, engagementId), eq(baselineSubmissions.status, "open")))
      .limit(1);
    // The response must refer to the exact version the person reviewed.
    if (!open || open.id !== data.submissionId) throw conflict("This agreement has changed since you opened it. Please review the latest version.");
    const event = data.response === "confirm" ? "confirm" : data.response === "request_changes" ? "request_changes" : "decline";
    const to = nextStatus(e.status as EngagementStatus, event);
    if (!to) throw conflict("This agreement can't be responded to now.");
    const comment = "comment" in data ? data.comment : null;
    await t
      .update(baselineSubmissions)
      .set({ status: data.response === "confirm" ? "confirmed" : data.response === "request_changes" ? "changes_requested" : "declined", respondedBy: actor.userId, respondedAt: now, comment })
      .where(eq(baselineSubmissions.id, open.id));
    if (data.response === "confirm") {
      await t.update(engagements).set({ status: to, currentVersion: 1, confirmedAt: now, updatedAt: now }).where(eq(engagements.id, engagementId));
      const ids = (await t.select({ id: commitments.id }).from(commitments).where(eq(commitments.engagementId, engagementId))).map((r) => r.id);
      if (ids.length) await t.update(commitmentRevisions).set({ versionFrom: 1 }).where(and(inArray(commitmentRevisions.commitmentId, ids), eq(commitmentRevisions.versionFrom, 0)));
      await t.insert(engagementVersions).values({ engagementId, version: 1, cause: "baseline", createdAt: now });
      const wids = (await t.select({ id: workflows.id }).from(workflows).where(eq(workflows.engagementId, engagementId))).map((r) => r.id);
      if (wids.length) {
        await t.update(workflows).set({ versionFrom: 1 }).where(and(inArray(workflows.id, wids), eq(workflows.versionFrom, 0)));
        await t.update(workflowSteps).set({ versionFrom: 1 }).where(and(inArray(workflowSteps.workflowId, wids), eq(workflowSteps.versionFrom, 0)));
      }
    } else {
      await t.update(engagements).set({ status: to, updatedAt: now }).where(eq(engagements.id, engagementId));
      if (data.response === "decline") {
        await t.update(engagementInvitations).set({ revokedAt: now }).where(and(eq(engagementInvitations.engagementId, engagementId), isNull(engagementInvitations.revokedAt)));
      }
    }
    await appendEvent(t, {
      engagementId,
      type: `baseline.${data.response === "confirm" ? "confirmed" : data.response === "request_changes" ? "changes_requested" : "declined"}`,
      actorUserId: actor.userId,
      actorSide: viewer.side,
      target: { kind: "baseline_submission", id: open.id },
      data: { seq: open.seq, comment, version: data.response === "confirm" ? 1 : null },
    });
    const [creator] = await t.select({ email: user.email }).from(user).where(eq(user.id, e.createdBy)).limit(1);
    const verb = data.response === "confirm" ? "confirmed" : data.response === "request_changes" ? "asked for changes to" : "declined";
    if (creator) {
      await enqueueEmail(t, {
        to: creator.email,
        subject: `"${e.title}" was ${data.response === "confirm" ? "confirmed" : data.response === "request_changes" ? "returned with requested changes" : "declined"}`,
        text: `The other party ${verb} "${e.title}".${comment ? `\n\nTheir comment: ${comment}` : ""}\n\nOpen it: ${env().APP_URL}/app/engagements/${engagementId}`,
      });
    }
    return { status: to };
  });
}

// ------------------------------------------------------------------------------------------------
// Counterparty access (invitation link + email code)

export async function previewEngagementInvitation(db: Database, token: string) {
  const [row] = await db
    .select({ inv: engagementInvitations, title: engagements.title, status: engagements.status })
    .from(engagementInvitations)
    .innerJoin(engagements, eq(engagements.id, engagementInvitations.engagementId))
    .where(eq(engagementInvitations.tokenHash, hashToken(token)))
    .limit(1);
  if (!row) return { status: "invalid" as const };
  if (row.inv.revokedAt) return { status: "revoked" as const };
  const parties = await db.select().from(engagementParties).where(eq(engagementParties.engagementId, row.inv.engagementId));
  const initiator = parties.find((p) => p.isInitiator)!;
  const counterparty = parties.find((p) => p.id === row.inv.partyId)!;
  return {
    status: "valid" as const,
    engagementId: row.inv.engagementId,
    email: row.inv.email,
    title: row.title,
    fromOrg: initiator.orgName,
    toOrg: counterparty.orgName,
    repName: counterparty.repName,
  };
}

/** Called once the person has proved control of the invited email (email code or signed in as it). */
export async function acceptEngagementInvitation(db: Database, actor: Actor, token: string) {
  requireVerified(actor);
  return tx(db, async (t) => {
    const [inv] = await t.select().from(engagementInvitations).where(eq(engagementInvitations.tokenHash, hashToken(token))).for("update").limit(1);
    if (!inv) throw notFound("This link is not valid.");
    if (inv.revokedAt) throw conflict("This link no longer works. Ask for a new one.");
    if (inv.email !== actor.email.trim().toLowerCase()) throw forbidden("This link was sent to a different email address.");
    const e = await loadEngagement(t, inv.engagementId);
    const [initiatorMember] = await t
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, e.initiatorWorkspaceId), eq(workspaceMembers.userId, actor.userId)))
      .limit(1);
    if (initiatorMember) throw conflict("You belong to the business that created this engagement, so you can't also confirm it for the other party.");
    const [existing] = await t.select().from(partyMembers).where(and(eq(partyMembers.partyId, inv.partyId), eq(partyMembers.userId, actor.userId))).limit(1);
    if (!existing) {
      await t.insert(partyMembers).values({ id: newId(), partyId: inv.partyId, userId: actor.userId, authority: "approver" });
      const [party] = await t.select().from(engagementParties).where(eq(engagementParties.id, inv.partyId)).limit(1);
      await appendEvent(t, { engagementId: inv.engagementId, type: "invitation.accepted", actorUserId: actor.userId, actorSide: party!.side as Side, data: { email: inv.email } });
    }
    if (!inv.firstAcceptedAt) await t.update(engagementInvitations).set({ firstAcceptedAt: new Date() }).where(eq(engagementInvitations.id, inv.id));
    return { engagementId: inv.engagementId };
  });
}

/** True if the user is a counterparty on at least one engagement (onboarding exemption, FR-ONB-01). */
export async function isCounterpartyAnywhere(db: Database, userId: string) {
  const [r] = await db.select({ n: count() }).from(partyMembers).where(eq(partyMembers.userId, userId));
  return (r?.n ?? 0) > 0;
}
