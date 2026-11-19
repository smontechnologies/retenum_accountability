import { and, asc, eq, inArray, isNull, max } from "drizzle-orm";
import { z } from "zod";
import type { CommitmentView, Side } from "@/domain/baseline";
import { answersFromFields, planFromAnswers } from "@/domain/guided-start";
import {
  ACTIONS,
  CONDITION_MONEY_RULE,
  conditionAllowedOnStep,
  MONEY_ACTIONS,
  derivePaymentTrigger,
  TRIGGERS,
  type ActionType,
  type Condition,
  type StepParams,
  type StepView,
  type TriggerParams,
  type TriggerType,
  type WorkflowView,
} from "@/domain/workflow";
import type { Database } from "../../db/client";
import { commitmentRevisions, commitments, engagements, workflowSteps, workflows } from "../../db/schema";
import { appendEvent } from "../../events/append";
import type { Actor } from "../../lib/actor";
import { conflict, notFound, validationError } from "../../lib/errors";
import { newId } from "../../lib/ids";
import { authorise, loadCommitments, nextPosition, parse, revisionValues, tx, type CommitmentInput, type Tx } from "./service";

/** Load an engagement's workflows at a version, with each commercial step's commitment attached. */
export async function loadWorkflows(db: Database, engagementId: string, version: number): Promise<WorkflowView[]> {
  const items = await loadCommitments(db, engagementId, version);
  const byId = new Map(items.map((c) => [c.id, c]));
  const wfs = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.engagementId, engagementId), isNull(workflows.removedInVersion)))
    .orderBy(asc(workflows.position));
  const visible = wfs.filter((w) => w.versionFrom <= version);
  if (visible.length === 0) return [];
  const steps = await db
    .select()
    .from(workflowSteps)
    .where(and(inArray(workflowSteps.workflowId, visible.map((w) => w.id)), isNull(workflowSteps.removedInVersion)))
    .orderBy(asc(workflowSteps.position));
  return visible.map((w) => ({
    id: w.id,
    position: w.position,
    triggerType: w.triggerType as TriggerType,
    triggerParams: w.triggerParams as TriggerParams,
    onlyWhen: (w.onlyWhen as Condition | null) ?? null,
    steps: steps
      .filter((s) => s.workflowId === w.id && s.versionFrom <= version)
      .map(
        (s): StepView => ({
          id: s.id,
          position: s.position,
          actionType: s.actionType as ActionType,
          params: s.params as StepParams,
          onlyWhen: (s.onlyWhen as Condition | null) ?? null,
          commitment: s.commitmentId ? (byId.get(s.commitmentId) ?? null) : null,
        }),
      ),
  }));
}

/** Every new engagement starts with one workflow and an empty "+" (no templates, D-66). */
export async function insertDefaultWorkflow(t: Tx, engagementId: string, side: Side) {
  await t.insert(workflows).values({ id: newId(), engagementId, position: 0, triggerType: "agreement_confirmed", triggerParams: {}, createdBySide: side });
}

/**
 * Engagements created before workflows existed get workflows built from their commitments, once.
 * Mapping: everything on confirmation goes into "When the agreement is confirmed"; payments on
 * acceptance get "When X is accepted"; dated payments get "On <date>"; requested payments are placed
 * in the confirmation workflow (dev-only data existed in that shape).
 */
export async function ensureWorkflows(db: Database, engagementId: string, version: number, side: Side) {
  const [{ n } = { n: 0 }] = await db.select({ n: max(workflows.position) }).from(workflows).where(eq(workflows.engagementId, engagementId));
  if (n !== null) return;
  const items = await loadCommitments(db, engagementId, version);
  await tx(db, async (t) => {
    const main = newId();
    await t.insert(workflows).values({ id: main, engagementId, position: 0, triggerType: "agreement_confirmed", triggerParams: {}, createdBySide: side, versionFrom: version });
    let pos = 0;
    let wpos = 1;
    for (const c of items) {
      if (c.kind === "payment_obligation" && (c.trigger === "on_acceptance" || c.trigger === "on_date")) {
        const wid = newId();
        await t.insert(workflows).values({
          id: wid,
          engagementId,
          position: wpos++,
          triggerType: c.trigger === "on_acceptance" ? "deliverable_accepted" : "date_reached",
          triggerParams: c.trigger === "on_acceptance" ? { commitmentId: c.linkedCommitmentId } : { date: c.triggerDate },
          createdBySide: side,
          versionFrom: version,
        });
        await t.insert(workflowSteps).values({ id: newId(), workflowId: wid, position: 0, actionType: "make_payment_due", commitmentId: c.id, versionFrom: version });
        continue;
      }
      const actionType = c.kind === "deliverable" ? "start_deliverable" : c.kind === "party_obligation" ? "party_provides" : "make_payment_due";
      await t.insert(workflowSteps).values({ id: newId(), workflowId: main, position: pos++, actionType, commitmentId: c.id, versionFrom: version });
    }
  });
}

// ------------------------------------------------------------------------------------------------
// Validation

const id = z.string().uuid().optional().or(z.literal("").transform(() => undefined));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date").optional().or(z.literal("").transform(() => undefined));
const posInt = (max: number, msg: string) => z.coerce.number().int().min(1, msg).max(max, msg).optional().or(z.literal("").transform(() => undefined));

const TriggerInput = z.object({
  triggerType: z.enum(Object.keys(TRIGGERS) as [TriggerType, ...TriggerType[]], { message: "Choose what starts this workflow" }),
  commitmentId: id,
  date: isoDate,
  afterDays: posInt(365, "Use 1 to 365 days"),
  days: posInt(30, "Use 1 to 30 working days"),
  workflowId: id,
});

const ConditionInput = z.object({
  conditionType: z.enum(["none", "deliverable_accepted", "delivered_before", "paid_in_full", "change_confirmed", "days_since_trigger", "outstanding_amount"]),
  conditionCommitmentId: id,
  conditionDate: isoDate,
  conditionOp: z.enum(["more", "less"]).optional(),
  conditionDays: posInt(365, "Use 1 to 365 days"),
  conditionAmount: z.string().optional(),
});

const HelperInput = z.object({
  who: z.enum(["payer", "payee", "both"]).optional(),
  message: z.string().trim().max(500).optional(),
  afterDays: posInt(90, "Use 1 to 90 days"),
  repeatDays: posInt(90, "Use 1 to 90 days"),
  commitmentId: id,
  workflowId: id,
});

function triggerParamsFrom(t: z.output<typeof TriggerInput>): TriggerParams {
  const needs = TRIGGERS[t.triggerType].needs;
  if (needs === "deliverable" || needs === "obligation" || needs === "payment") return { commitmentId: t.commitmentId };
  if (needs === "date") return t.date ? { date: t.date } : { afterDays: t.afterDays };
  if (needs === "days") return { days: t.days };
  if (needs === "workflow") return { workflowId: t.workflowId };
  return {};
}

function conditionFrom(c: z.output<typeof ConditionInput>): Condition | null {
  if (c.conditionType === "none") return null;
  const cond: Condition = { type: c.conditionType };
  if (["deliverable_accepted", "delivered_before", "paid_in_full"].includes(c.conditionType)) {
    if (!c.conditionCommitmentId) throw validationError("Some details need fixing.", { fields: { conditionCommitmentId: "Choose what the condition checks" } });
    cond.commitmentId = c.conditionCommitmentId;
  }
  if (c.conditionType === "delivered_before") {
    if (!c.conditionDate) throw validationError("Some details need fixing.", { fields: { conditionDate: "Choose a date" } });
    cond.date = c.conditionDate;
  }
  if (c.conditionType === "days_since_trigger") {
    if (!c.conditionDays) throw validationError("Some details need fixing.", { fields: { conditionDays: "Enter a number of days" } });
    cond.op = c.conditionOp ?? "more";
    cond.days = c.conditionDays;
  }
  if (c.conditionType === "outstanding_amount") {
    const v = (c.conditionAmount ?? "").replace(/,/g, "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(v)) throw validationError("Some details need fixing.", { fields: { conditionAmount: "Use an amount like 50000" } });
    const [w, f = ""] = v.split(".");
    cond.op = c.conditionOp ?? "more";
    cond.amountMinor = (BigInt(w!) * 100n + BigInt((f + "00").slice(0, 2))).toString();
  }
  return cond;
}

// ------------------------------------------------------------------------------------------------
// Loading helpers for edits

async function loadWorkflowRow(t: Tx, engagementId: string, workflowId: string) {
  const [w] = await t.select().from(workflows).where(and(eq(workflows.id, workflowId), eq(workflows.engagementId, engagementId))).limit(1);
  if (!w || w.removedInVersion !== null) throw notFound("Workflow not found.");
  return w;
}

async function loadStepRow(t: Tx, engagementId: string, stepId: string) {
  const [row] = await t
    .select({ s: workflowSteps, w: workflows })
    .from(workflowSteps)
    .innerJoin(workflows, eq(workflows.id, workflowSteps.workflowId))
    .where(and(eq(workflowSteps.id, stepId), eq(workflows.engagementId, engagementId)))
    .limit(1);
  if (!row || row.s.removedInVersion !== null) throw notFound("Step not found.");
  return row;
}

/** Keep each payment's due trigger in line with its workflow's trigger (the money layer reads it). */
async function syncPaymentTriggers(t: Tx, workflowId: string) {
  const [w] = await t.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
  if (!w) return;
  const d = derivePaymentTrigger({ triggerType: w.triggerType as TriggerType, triggerParams: w.triggerParams as TriggerParams });
  const pays = await t.select({ cid: workflowSteps.commitmentId }).from(workflowSteps).where(and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.actionType, "make_payment_due")));
  const ids = pays.map((p) => p.cid).filter((x): x is string => !!x);
  if (ids.length) {
    await t
      .update(commitmentRevisions)
      .set({ trigger: d.trigger, triggerDate: d.triggerDate, linkedCommitmentId: d.linkedCommitmentId })
      .where(and(inArray(commitmentRevisions.commitmentId, ids), eq(commitmentRevisions.versionFrom, 0)));
  }
}

const touch = (t: Tx, engagementId: string) => t.update(engagements).set({ updatedAt: new Date() }).where(eq(engagements.id, engagementId));

// ------------------------------------------------------------------------------------------------
// Workflow operations (draft only, FR-WF-06)

export async function addWorkflow(db: Database, actor: Actor, engagementId: string, input: Record<string, unknown>) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const t0 = parse(TriggerInput, input);
  const params = triggerParamsFrom(t0);
  return tx(db, async (t) => {
    const [{ m } = { m: -1 }] = await t.select({ m: max(workflows.position) }).from(workflows).where(eq(workflows.engagementId, engagementId));
    const wid = newId();
    await t.insert(workflows).values({ id: wid, engagementId, position: (m ?? -1) + 1, triggerType: t0.triggerType, triggerParams: params as Record<string, unknown>, createdBySide: viewer.side });
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.workflow_added", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow", id: wid }, data: { triggerType: t0.triggerType } });
    return { id: wid };
  });
}

export async function updateWorkflowTrigger(db: Database, actor: Actor, engagementId: string, workflowId: string, input: Record<string, unknown>) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const t0 = parse(TriggerInput, input);
  await tx(db, async (t) => {
    await loadWorkflowRow(t, engagementId, workflowId);
    await t.update(workflows).set({ triggerType: t0.triggerType, triggerParams: triggerParamsFrom(t0) as Record<string, unknown> }).where(eq(workflows.id, workflowId));
    await syncPaymentTriggers(t, workflowId);
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.workflow_updated", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow", id: workflowId }, data: { triggerType: t0.triggerType } });
  });
}

export async function removeWorkflow(db: Database, actor: Actor, engagementId: string, workflowId: string) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  await tx(db, async (t) => {
    await loadWorkflowRow(t, engagementId, workflowId);
    const all = await loadWorkflows(t, engagementId, 0);
    const target = all.find((w) => w.id === workflowId)!;
    const ownIds = new Set(target.steps.map((s) => s.commitment?.id).filter(Boolean));
    const dependant = all.find(
      (w) =>
        w.id !== workflowId &&
        ((w.triggerParams.commitmentId && ownIds.has(w.triggerParams.commitmentId)) ||
          w.triggerParams.workflowId === workflowId ||
          w.steps.some((s) => (s.params.commitmentId && ownIds.has(s.params.commitmentId)) || s.params.workflowId === workflowId)),
    );
    if (dependant) throw conflict("Another workflow depends on this one. Change or remove that workflow first.");
    for (const s of target.steps) await deleteStepRows(t, s.id);
    await t.delete(workflows).where(eq(workflows.id, workflowId));
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.workflow_removed", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow", id: workflowId }, data: {} });
  });
}

export async function moveWorkflow(db: Database, actor: Actor, engagementId: string, workflowId: string, direction: "up" | "down") {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  await tx(db, async (t) => {
    const rows = await t.select({ id: workflows.id, position: workflows.position }).from(workflows).where(eq(workflows.engagementId, engagementId)).orderBy(asc(workflows.position));
    await swap(t, rows, workflowId, direction, (rid, position) => t.update(workflows).set({ position }).where(eq(workflows.id, rid)));
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.workflow_moved", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow", id: workflowId }, data: { direction } });
  });
}

async function swap(t: Tx, rows: Array<{ id: string; position: number }>, rowId: string, direction: "up" | "down", set: (id: string, position: number) => Promise<unknown>) {
  const i = rows.findIndex((r) => r.id === rowId);
  if (i < 0) throw notFound("Not found.");
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return;
  await set(rows[i]!.id, rows[j]!.position);
  await set(rows[j]!.id, rows[i]!.position);
}

export async function setWorkflowCondition(db: Database, actor: Actor, engagementId: string, workflowId: string, input: Record<string, unknown>) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const cond = conditionFrom(parse(ConditionInput, input));
  await tx(db, async (t) => {
    await loadWorkflowRow(t, engagementId, workflowId);
    if (cond) {
      const money = await t.select({ id: workflowSteps.id }).from(workflowSteps).where(and(eq(workflowSteps.workflowId, workflowId), inArray(workflowSteps.actionType, MONEY_ACTIONS)));
      if (money.length > 0) throw conflict(CONDITION_MONEY_RULE);
    }
    await t.update(workflows).set({ onlyWhen: cond as Record<string, unknown> | null }).where(eq(workflows.id, workflowId));
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.condition_set", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow", id: workflowId }, data: { condition: cond?.type ?? null } });
  });
}

// ------------------------------------------------------------------------------------------------
// Step operations

const COMMERCIAL_KIND: Partial<Record<ActionType, CommitmentInput["kind"]>> = {
  start_deliverable: "deliverable",
  make_payment_due: "payment_obligation",
  party_provides: "party_obligation",
};

/** Adds a step to a workflow. Commercial steps create their commitment in the same transaction. */
export async function addStep(db: Database, actor: Actor, engagementId: string, workflowId: string, actionType: ActionType, input: Record<string, unknown>) {
  const { engagement, viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  if (!ACTIONS[actionType]) throw validationError("Choose a step type.");
  const items = await loadCommitments(db, engagementId, 0);
  return tx(db, async (t) => {
    const w = await loadWorkflowRow(t, engagementId, workflowId);
    if (w.onlyWhen && MONEY_ACTIONS.includes(actionType)) throw conflict(`This workflow has a condition, so it can't contain money. ${CONDITION_MONEY_RULE}`);
    let commitmentId: string | null = null;
    let params: StepParams = {};
    const kind = COMMERCIAL_KIND[actionType];
    if (kind) {
      const derived = derivePaymentTrigger({ triggerType: w.triggerType as TriggerType, triggerParams: w.triggerParams as TriggerParams });
      const commitmentInput = { ...input, kind, ...(kind === "payment_obligation" ? { trigger: derived.trigger === "on_workflow" ? "on_request" : derived.trigger, triggerDate: derived.triggerDate ?? "", linkedCommitmentId: derived.linkedCommitmentId ?? "" } : {}) } as CommitmentInput;
      const { owedBySide, values } = revisionValues(kind, commitmentInput, engagement.currency, items);
      commitmentId = newId();
      await t.insert(commitments).values({ id: commitmentId, engagementId, kind, owedBySide: kind === "deliverable" ? "payee" : owedBySide!, position: await nextPosition(t, engagementId) });
      await t.insert(commitmentRevisions).values({ id: newId(), commitmentId, versionFrom: 0, ...values, ...(kind === "payment_obligation" ? { trigger: derived.trigger, triggerDate: derived.triggerDate, linkedCommitmentId: derived.linkedCommitmentId } : {}) });
    } else {
      const h = parse(HelperInput, input);
      params = { who: h.who, message: h.message || undefined, afterDays: h.afterDays, repeatDays: h.repeatDays, commitmentId: h.commitmentId, workflowId: h.workflowId };
      if (actionType === "notify" || actionType === "remind") params.who ??= "both";
      if (actionType === "remind") params.afterDays ??= 1;
    }
    // Bubble-style insertion: "+" after the trigger ("trigger") or after a given step; default is the end.
    const existing = await t.select({ id: workflowSteps.id, position: workflowSteps.position }).from(workflowSteps).where(eq(workflowSteps.workflowId, workflowId)).orderBy(asc(workflowSteps.position));
    const after = typeof input.insertAfter === "string" ? input.insertAfter : "";
    let position = existing.length ? existing[existing.length - 1]!.position + 1 : 0;
    if (after) {
      const idx = after === "trigger" ? -1 : existing.findIndex((r) => r.id === after);
      if (after !== "trigger" && idx < 0) throw notFound("Step not found.");
      position = idx + 1;
      for (let k = existing.length - 1; k > idx; k--) await t.update(workflowSteps).set({ position: k + 1 }).where(eq(workflowSteps.id, existing[k]!.id));
      for (let k = 0; k <= idx; k++) await t.update(workflowSteps).set({ position: k }).where(eq(workflowSteps.id, existing[k]!.id));
    }
    const sid = newId();
    await t.insert(workflowSteps).values({ id: sid, workflowId, position, actionType, params: params as Record<string, unknown>, commitmentId });
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.step_added", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow_step", id: sid }, data: { actionType, workflowId } });
    return { id: sid };
  });
}

export async function updateStep(db: Database, actor: Actor, engagementId: string, stepId: string, input: Record<string, unknown>) {
  const { engagement, viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const items = await loadCommitments(db, engagementId, 0);
  await tx(db, async (t) => {
    const { s, w } = await loadStepRow(t, engagementId, stepId);
    const actionType = s.actionType as ActionType;
    const kind = COMMERCIAL_KIND[actionType];
    if (kind && s.commitmentId) {
      const derived = derivePaymentTrigger({ triggerType: w.triggerType as TriggerType, triggerParams: w.triggerParams as TriggerParams });
      const commitmentInput = { ...input, kind, ...(kind === "payment_obligation" ? { trigger: derived.trigger === "on_workflow" ? "on_request" : derived.trigger, triggerDate: derived.triggerDate ?? "", linkedCommitmentId: derived.linkedCommitmentId ?? "" } : {}) } as CommitmentInput;
      const { owedBySide, values } = revisionValues(kind, commitmentInput, engagement.currency, items.filter((c) => c.id !== s.commitmentId));
      await t
        .update(commitmentRevisions)
        .set({ ...values, ...(kind === "payment_obligation" ? { trigger: derived.trigger, triggerDate: derived.triggerDate, linkedCommitmentId: derived.linkedCommitmentId } : {}) })
        .where(and(eq(commitmentRevisions.commitmentId, s.commitmentId), eq(commitmentRevisions.versionFrom, 0)));
      if (kind === "party_obligation" && owedBySide) await t.update(commitments).set({ owedBySide }).where(eq(commitments.id, s.commitmentId));
    } else {
      const h = parse(HelperInput, input);
      await t
        .update(workflowSteps)
        .set({ params: { who: h.who ?? "both", message: h.message || undefined, afterDays: h.afterDays, repeatDays: h.repeatDays, commitmentId: h.commitmentId, workflowId: h.workflowId } })
        .where(eq(workflowSteps.id, stepId));
    }
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.step_updated", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow_step", id: stepId }, data: { actionType } });
  });
}

async function deleteStepRows(t: Tx, stepId: string) {
  const [s] = await t.select().from(workflowSteps).where(eq(workflowSteps.id, stepId)).limit(1);
  if (!s) return;
  await t.delete(workflowSteps).where(eq(workflowSteps.id, stepId));
  if (s.commitmentId) {
    await t.delete(commitmentRevisions).where(eq(commitmentRevisions.commitmentId, s.commitmentId));
    await t.delete(commitments).where(eq(commitments.id, s.commitmentId));
  }
}

export async function removeStep(db: Database, actor: Actor, engagementId: string, stepId: string) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  await tx(db, async (t) => {
    const { s } = await loadStepRow(t, engagementId, stepId);
    if (s.commitmentId) {
      const all = await loadWorkflows(t, engagementId, 0);
      const cid = s.commitmentId;
      const usedBy = all.find((w) => w.triggerParams.commitmentId === cid || w.onlyWhen?.commitmentId === cid || w.steps.some((x) => x.id !== stepId && (x.params.commitmentId === cid || x.onlyWhen?.commitmentId === cid)));
      if (usedBy) throw conflict("Another workflow or step refers to this. Change that first, then remove this step.");
    }
    await deleteStepRows(t, stepId);
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.step_removed", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow_step", id: stepId }, data: { actionType: s.actionType } });
  });
}

export async function moveStep(db: Database, actor: Actor, engagementId: string, stepId: string, direction: "up" | "down") {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  await tx(db, async (t) => {
    const { s } = await loadStepRow(t, engagementId, stepId);
    const rows = await t.select({ id: workflowSteps.id, position: workflowSteps.position }).from(workflowSteps).where(eq(workflowSteps.workflowId, s.workflowId)).orderBy(asc(workflowSteps.position));
    await swap(t, rows, stepId, direction, (rid, position) => t.update(workflowSteps).set({ position }).where(eq(workflowSteps.id, rid)));
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.step_moved", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow_step", id: stepId }, data: { direction } });
  });
}

export async function setStepCondition(db: Database, actor: Actor, engagementId: string, stepId: string, input: Record<string, unknown>) {
  const { viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const cond = conditionFrom(parse(ConditionInput, input));
  await tx(db, async (t) => {
    const { s } = await loadStepRow(t, engagementId, stepId);
    if (cond && !conditionAllowedOnStep(s.actionType as ActionType)) throw conflict(CONDITION_MONEY_RULE);
    await t.update(workflowSteps).set({ onlyWhen: cond as Record<string, unknown> | null }).where(eq(workflowSteps.id, stepId));
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.condition_set", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "workflow_step", id: stepId }, data: { condition: cond?.type ?? null } });
  });
}

export type { CommitmentView };

/**
 * Guided start (D-67): turn a few answers into ordinary workflows in one transaction. Only on a
 * draft with no steps yet, so it never overwrites someone's work.
 */
export async function guidedStart(db: Database, actor: Actor, engagementId: string, input: Record<string, unknown>) {
  const { engagement, viewer } = await authorise(db, actor, engagementId, "engagement.edit_draft");
  const existing = await loadWorkflows(db, engagementId, 0);
  if (existing.some((w) => w.steps.length > 0)) throw conflict("This engagement already has steps. Change them in Workflows.");
  const answers = answersFromFields(input);
  const { workflows: plan, errors } = planFromAnswers(answers);
  if (Object.keys(errors).length > 0) throw validationError("Some details need fixing.", { fields: errors });
  await tx(db, async (t) => {
    for (const w of existing) await t.delete(workflows).where(eq(workflows.id, w.id));
    let position = await nextPosition(t, engagementId);
    const deliverableIds = new Map<number, string>();
    for (const [wi, pw] of plan.entries()) {
      const wid = newId();
      const triggerParams: TriggerParams =
        pw.trigger === "deliverable_accepted" ? { commitmentId: deliverableIds.get(pw.watchesDeliverable!) } : pw.trigger === "date_reached" ? { date: pw.date } : {};
      await t.insert(workflows).values({ id: wid, engagementId, position: wi, triggerType: pw.trigger, triggerParams: triggerParams as Record<string, unknown>, createdBySide: viewer.side });
      const derived = derivePaymentTrigger({ triggerType: pw.trigger, triggerParams });
      for (const [si, ps] of pw.steps.entries()) {
        const kind = COMMERCIAL_KIND[ps.action]!;
        const { owedBySide, values } = revisionValues(kind, { ...ps.input, kind, trigger: "on_confirmation" } as CommitmentInput, engagement.currency, []);
        const cid = newId();
        await t.insert(commitments).values({ id: cid, engagementId, kind, owedBySide: kind === "deliverable" ? "payee" : owedBySide!, position: position++ });
        await t.insert(commitmentRevisions).values({
          id: newId(),
          commitmentId: cid,
          versionFrom: 0,
          ...values,
          ...(kind === "payment_obligation" ? { trigger: derived.trigger, triggerDate: derived.triggerDate, linkedCommitmentId: derived.linkedCommitmentId } : {}),
        });
        if (ps.action === "start_deliverable") deliverableIds.set(ps.deliverableIndex!, cid);
        await t.insert(workflowSteps).values({ id: newId(), workflowId: wid, position: si, actionType: ps.action, params: {}, commitmentId: cid });
      }
    }
    await touch(t, engagementId);
    await appendEvent(t, { engagementId, type: "draft.guided_start", actorUserId: actor.userId, actorSide: viewer.side, target: { kind: "engagement", id: engagementId }, data: { plan: answers.plan, workflows: plan.length } });
  });
}
