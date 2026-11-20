/**
 * Engagement workflows (D-66, FR-WF-01…07): Bubble-style "trigger → numbered steps", with Only-when
 * conditions. Pure: no database or framework. Sentences here are the single source of the wording used
 * on the canvas, in "Read as agreement" and in the confirmation snapshot, so they always match.
 */
import { formatMoney, money } from "./money";
import type { CommitmentView, Side, Trigger } from "./baseline";

export type TriggerType =
  | "agreement_confirmed"
  | "deliverable_submitted"
  | "deliverable_accepted"
  | "deliverable_partially_accepted"
  | "deliverable_rejected"
  | "obligation_provided"
  | "obligation_missed"
  | "date_reached"
  | "change_confirmed"
  | "payment_received"
  | "payment_failed"
  | "no_response"
  | "workflow_finished";

export type ActionType =
  | "start_deliverable"
  | "require_evidence"
  | "make_payment_due"
  | "request_payment"
  | "party_provides"
  | "ask_to_accept"
  | "notify"
  | "remind"
  | "unlock_workflow"
  | "stop_workflow";

export type ConditionType = "deliverable_accepted" | "delivered_before" | "paid_in_full" | "change_confirmed" | "days_since_trigger" | "outstanding_amount";

export interface TriggerParams {
  commitmentId?: string; // deliverable, obligation or payment the trigger watches
  date?: string; // yyyy-mm-dd (date_reached, exact)
  afterDays?: number; // date_reached: N days after confirmation
  days?: number; // no_response: working days
  workflowId?: string; // workflow_finished
}

export interface StepParams {
  commitmentId?: string; // target deliverable / payment (require_evidence, request_payment, ask_to_accept)
  workflowId?: string; // unlock_workflow
  who?: "payer" | "payee" | "both"; // notify / remind
  message?: string;
  afterDays?: number; // remind
  repeatDays?: number; // remind
}

export interface Condition {
  type: ConditionType;
  commitmentId?: string;
  date?: string;
  op?: "more" | "less";
  days?: number;
  amountMinor?: string; // decimal string of minor units (JSON-safe)
}

export interface StepView {
  id: string;
  position: number;
  actionType: ActionType;
  params: StepParams;
  onlyWhen: Condition | null;
  commitment: CommitmentView | null; // commercial steps own a commitment
}

export interface WorkflowView {
  id: string;
  position: number;
  triggerType: TriggerType;
  triggerParams: TriggerParams;
  onlyWhen: Condition | null;
  steps: StepView[];
}

export type Group = "Agreement" | "Delivery" | "Payments" | "Changes" | "Reminders";

type Needs = "deliverable" | "obligation" | "payment" | "date" | "days" | "workflow" | null;

export const TRIGGERS: Record<TriggerType, { label: string; group: Group; needs: Needs; hint: string }> = {
  agreement_confirmed: { label: "Agreement is confirmed", group: "Agreement", needs: null, hint: "Runs once, when both parties confirm." },
  deliverable_submitted: { label: "A deliverable is submitted", group: "Delivery", needs: "deliverable", hint: "When the payee submits it for acceptance." },
  deliverable_accepted: { label: "A deliverable is accepted", group: "Delivery", needs: "deliverable", hint: "When the payer accepts it in full." },
  deliverable_partially_accepted: { label: "A deliverable is partly accepted", group: "Delivery", needs: "deliverable", hint: "When the payer accepts part of it." },
  deliverable_rejected: { label: "A deliverable is rejected", group: "Delivery", needs: "deliverable", hint: "When the payer rejects it or asks for corrections." },
  obligation_provided: { label: "Something is provided", group: "Delivery", needs: "obligation", hint: "When a party provides what they agreed to." },
  obligation_missed: { label: "Something is not provided in time", group: "Delivery", needs: "obligation", hint: "When a party misses what they agreed to provide." },
  date_reached: { label: "A date is reached", group: "Payments", needs: "date", hint: "On a set date, or a number of days after confirmation." },
  change_confirmed: { label: "A change is confirmed", group: "Changes", needs: null, hint: "When both parties confirm a change." },
  payment_received: { label: "A payment is received", group: "Payments", needs: "payment", hint: "When the payee confirms a payment arrived." },
  payment_failed: { label: "A payment fails", group: "Payments", needs: "payment", hint: "When a payment attempt fails." },
  no_response: { label: "Someone doesn't respond in time", group: "Reminders", needs: "days", hint: "When a request has no response within a number of working days." },
  workflow_finished: { label: "Another workflow finishes", group: "Agreement", needs: "workflow", hint: "Chain workflows: run this after another one finishes." },
};

export type Category = "Deliver" | "Pay" | "Provide" | "Approve" | "Notify" | "Control";

export const ACTIONS: Record<ActionType, { label: string; category: Category; commercial: boolean; hint: string }> = {
  start_deliverable: { label: "Start a deliverable", category: "Deliver", commercial: true, hint: "Something the payee will deliver, with its price and when it counts as done." },
  require_evidence: { label: "Require evidence", category: "Deliver", commercial: true, hint: "The payee must attach evidence when submitting a deliverable." },
  make_payment_due: { label: "Make a payment due", category: "Pay", commercial: true, hint: "A payment becomes due when this workflow runs." },
  request_payment: { label: "Request payment", category: "Pay", commercial: true, hint: "Send a payment request for a payment in this agreement." },
  party_provides: { label: "A party provides something", category: "Provide", commercial: true, hint: "Access, materials, information or approvals either side must provide." },
  ask_to_accept: { label: "Ask the other party to accept", category: "Approve", commercial: true, hint: "Ask the payer to review and accept a deliverable." },
  notify: { label: "Notify", category: "Notify", commercial: false, hint: "Send a message to one or both parties. Changes nothing anyone owes." },
  remind: { label: "Remind", category: "Notify", commercial: false, hint: "Send a reminder after some days, optionally repeating." },
  unlock_workflow: { label: "Unlock another workflow", category: "Control", commercial: true, hint: "Start another workflow when this one reaches this step." },
  stop_workflow: { label: "Stop this workflow", category: "Control", commercial: true, hint: "End this workflow here. Later steps don't run." },
};

export const CATEGORY_ORDER: Category[] = ["Deliver", "Pay", "Provide", "Approve", "Notify", "Control"];

/**
 * D-67: v1 offers a smaller vocabulary. Chaining (unlock / stop / "another workflow finishes") can
 * create loops and contradictions both parties must read identically; it returns when customers ask.
 */
export const V1_TRIGGERS: TriggerType[] = (Object.keys(TRIGGERS) as TriggerType[]).filter((t) => t !== "workflow_finished");
export const V1_ACTIONS: ActionType[] = (Object.keys(ACTIONS) as ActionType[]).filter((a) => a !== "unlock_workflow" && a !== "stop_workflow");

/**
 * D-67 money guardrail: a condition must never decide whether money is owed. "Balance due only if
 * delivered within 30 days" would silently cancel ₦900,000 for one late day, a penalty-like term.
 * So no Only-when on steps that create a priced obligation, or on workflows that contain them.
 */
export const MONEY_ACTIONS: ActionType[] = ["start_deliverable", "make_payment_due"];
export const CONDITION_MONEY_RULE =
  "Conditions can't decide whether money is owed. Payments and priced deliverables always happen when their workflow runs. To make money depend on something, use a different trigger (for example, when a deliverable is accepted).";
export const conditionAllowedOnStep = (actionType: ActionType) => !MONEY_ACTIONS.includes(actionType);
export const conditionAllowedOnWorkflow = (w: Pick<WorkflowView, "steps">) => w.steps.every((s) => conditionAllowedOnStep(s.actionType));

export const CONDITIONS: Record<ConditionType, { label: string }> = {
  deliverable_accepted: { label: "A deliverable has been accepted" },
  delivered_before: { label: "A deliverable was delivered before a date" },
  paid_in_full: { label: "A payment has been paid in full" },
  change_confirmed: { label: "A change has been confirmed" },
  days_since_trigger: { label: "Days since the trigger" },
  outstanding_amount: { label: "The amount outstanding" },
};

export interface SentenceContext {
  commitments: Map<string, CommitmentView>;
  workflows: Map<string, WorkflowView>;
  payerName: string;
  payeeName: string;
  currency?: "NGN";
  formatDate: (iso: string) => string;
}

const q = (s: string) => `“${s}”`;
const sideName = (who: Side | "both" | undefined, ctx: SentenceContext) =>
  who === "payer" ? ctx.payerName : who === "payee" ? ctx.payeeName : `${ctx.payerName} and ${ctx.payeeName}`;
const titleOf = (id: string | undefined, ctx: SentenceContext) => (id && ctx.commitments.get(id)?.title) || "(not chosen)";
const fmt = (minor: bigint | null | undefined, ctx: SentenceContext) => formatMoney(money(minor ?? 0n, ctx.currency ?? "NGN"));
const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;
const workingDays = (n: number) => `${n} working day${n === 1 ? "" : "s"}`;

export function triggerSentence(w: Pick<WorkflowView, "triggerType" | "triggerParams">, ctx: SentenceContext): string {
  const p = w.triggerParams;
  switch (w.triggerType) {
    case "agreement_confirmed":
      return "When the agreement is confirmed";
    case "deliverable_submitted":
      return `When ${q(titleOf(p.commitmentId, ctx))} is submitted`;
    case "deliverable_accepted":
      return `When ${q(titleOf(p.commitmentId, ctx))} is accepted`;
    case "deliverable_partially_accepted":
      return `When ${q(titleOf(p.commitmentId, ctx))} is partly accepted`;
    case "deliverable_rejected":
      return `When ${q(titleOf(p.commitmentId, ctx))} is rejected or sent back`;
    case "obligation_provided":
      return `When ${q(titleOf(p.commitmentId, ctx))} is provided`;
    case "obligation_missed":
      return `When ${q(titleOf(p.commitmentId, ctx))} is not provided in time`;
    case "date_reached":
      return p.date ? `On ${ctx.formatDate(p.date)}` : `${days(p.afterDays ?? 0)} after the agreement is confirmed`;
    case "change_confirmed":
      return "When a change is confirmed";
    case "payment_received":
      return `When ${q(titleOf(p.commitmentId, ctx))} is received`;
    case "payment_failed":
      return `When a payment for ${q(titleOf(p.commitmentId, ctx))} fails`;
    case "no_response":
      return `When a request has no response within ${workingDays(p.days ?? 0)}`;
    case "workflow_finished": {
      const other = p.workflowId ? ctx.workflows.get(p.workflowId) : undefined;
      return `When workflow ${q(other ? triggerSentence(other, ctx) : "(not chosen)")} finishes`;
    }
  }
}

export function stepSentence(s: Pick<StepView, "actionType" | "params" | "commitment">, ctx: SentenceContext): string {
  const p = s.params;
  const c = s.commitment;
  switch (s.actionType) {
    case "start_deliverable":
      return `${ctx.payeeName} delivers ${q(c?.title ?? "")} for ${fmt(c?.priceMinor, ctx)}${c?.dueDate ? `, due ${ctx.formatDate(c.dueDate)}` : ""}`;
    case "require_evidence":
      return `Evidence is required for ${q(titleOf(p.commitmentId, ctx))}`;
    case "make_payment_due":
      return `${ctx.payerName} pays ${q(c?.title ?? "")}: ${fmt(c?.priceMinor, ctx)}${c?.termsDays ? `, within ${days(c.termsDays)}` : ""}`;
    case "request_payment":
      return `${ctx.payeeName} requests payment of ${q(titleOf(p.commitmentId, ctx))}`;
    case "party_provides":
      return `${sideName(c?.owedBySide, ctx)} provides ${q(c?.title ?? "")}${c?.dueDate ? ` by ${ctx.formatDate(c.dueDate)}` : ""}`;
    case "ask_to_accept":
      return `${ctx.payerName} is asked to accept ${q(titleOf(p.commitmentId, ctx))}`;
    case "notify":
      return `Notify ${sideName(p.who, ctx)}${p.message ? `: ${q(p.message)}` : ""}`;
    case "remind":
      return `Remind ${sideName(p.who, ctx)} after ${days(p.afterDays ?? 1)}${p.repeatDays ? `, then every ${days(p.repeatDays)}` : ""}`;
    case "unlock_workflow": {
      const other = p.workflowId ? ctx.workflows.get(p.workflowId) : undefined;
      return `Start workflow ${q(other ? triggerSentence(other, ctx) : "(not chosen)")}`;
    }
    case "stop_workflow":
      return "Stop this workflow";
  }
}

export function conditionSentence(c: Condition, ctx: SentenceContext): string {
  switch (c.type) {
    case "deliverable_accepted":
      return `${q(titleOf(c.commitmentId, ctx))} has been accepted`;
    case "delivered_before":
      return `${q(titleOf(c.commitmentId, ctx))} was delivered before ${c.date ? ctx.formatDate(c.date) : "(no date)"}`;
    case "paid_in_full":
      return `${q(titleOf(c.commitmentId, ctx))} has been paid in full`;
    case "change_confirmed":
      return "a change has been confirmed";
    case "days_since_trigger":
      return `${c.op === "less" ? "fewer than" : "more than"} ${days(c.days ?? 0)} have passed since this workflow started`;
    case "outstanding_amount":
      return `the amount outstanding is ${c.op === "less" ? "less than" : "more than"} ${fmt(BigInt(c.amountMinor ?? "0"), ctx)}`;
  }
}

/** Where a workflow is listed (FR-WF-02). Workflows with only helper steps are Reminders. */
export function groupOf(w: WorkflowView): Group {
  if (w.steps.length > 0 && w.steps.every((s) => !ACTIONS[s.actionType].commercial)) return "Reminders";
  return TRIGGERS[w.triggerType].group;
}

export const isHelperWorkflow = (w: WorkflowView) => groupOf(w) === "Reminders";

/** The money layer still reads commitments: a payment's trigger follows its workflow's trigger. */
export function derivePaymentTrigger(t: Pick<WorkflowView, "triggerType" | "triggerParams">): { trigger: Trigger; triggerDate: string | null; linkedCommitmentId: string | null } {
  if (t.triggerType === "agreement_confirmed") return { trigger: "on_confirmation", triggerDate: null, linkedCommitmentId: null };
  if (t.triggerType === "deliverable_accepted" && t.triggerParams.commitmentId) return { trigger: "on_acceptance", triggerDate: null, linkedCommitmentId: t.triggerParams.commitmentId };
  if (t.triggerType === "date_reached" && t.triggerParams.date) return { trigger: "on_date", triggerDate: t.triggerParams.date, linkedCommitmentId: null };
  return { trigger: "on_workflow", triggerDate: null, linkedCommitmentId: null };
}

/** Commitments owned by commercial steps, in workflow order: what the money layer and summaries read. */
export function commitmentsOf(workflows: WorkflowView[]): CommitmentView[] {
  return workflows.flatMap((w) => w.steps.map((s) => s.commitment).filter((c): c is CommitmentView => c !== null));
}

/** FR-ENG-12 in workflow terms: what must be true before the workflows can be sent for confirmation. */
export function sendProblems(workflows: WorkflowView[], ctx: SentenceContext): string[] {
  const problems: string[] = [];
  const items = commitmentsOf(workflows);
  const deliverables = items.filter((c) => c.kind === "deliverable");
  if (deliverables.length === 0) problems.push("Add a step that starts a deliverable: what will be delivered.");
  else if (!deliverables.some((d) => (d.priceMinor ?? 0n) > 0n)) problems.push("Give at least one deliverable a price.");
  if (!items.some((c) => c.kind === "payment_obligation")) problems.push("Add a step that makes a payment due.");
  for (const w of workflows) {
    const name = triggerSentence(w, ctx);
    if (w.onlyWhen && !conditionAllowedOnWorkflow(w)) problems.push(`Workflow ${q(name)} has a condition but includes money. ${CONDITION_MONEY_RULE}`);
    if (w.steps.some((s) => s.onlyWhen && !conditionAllowedOnStep(s.actionType))) problems.push(`A money step in ${q(name)} has a condition. ${CONDITION_MONEY_RULE}`);
    if (w.steps.length === 0) problems.push(`Workflow ${q(name)} has no steps. Add a step or remove the workflow.`);
    const needs = TRIGGERS[w.triggerType].needs;
    if ((needs === "deliverable" || needs === "obligation" || needs === "payment") && !(w.triggerParams.commitmentId && ctx.commitments.has(w.triggerParams.commitmentId))) {
      problems.push(`Workflow ${q(name)} needs you to choose what it watches.`);
    }
    if (needs === "date" && !w.triggerParams.date && !w.triggerParams.afterDays) problems.push(`Workflow ${q(name)} needs a date.`);
    if (needs === "workflow" && !(w.triggerParams.workflowId && ctx.workflows.has(w.triggerParams.workflowId))) problems.push(`Workflow ${q(name)} needs another workflow to follow.`);
    w.steps.forEach((s, i) => {
      const target = s.params.commitmentId;
      if ((s.actionType === "require_evidence" || s.actionType === "request_payment" || s.actionType === "ask_to_accept") && !(target && ctx.commitments.has(target))) {
        problems.push(`Step ${i + 1} in ${q(name)} needs you to choose what it applies to.`);
      }
      if (s.actionType === "unlock_workflow" && !(s.params.workflowId && ctx.workflows.has(s.params.workflowId))) problems.push(`Step ${i + 1} in ${q(name)} needs a workflow to start.`);
    });
  }
  return problems;
}

/** FR-WF-07: the workflows as numbered plain-language clauses ("Read as agreement"). */
export function agreementClauses(workflows: WorkflowView[], ctx: SentenceContext): Array<{ number: number; text: string; lines: string[] }> {
  return workflows
    .filter((w) => w.steps.length > 0)
    .map((w, i) => {
      const when = triggerSentence(w, ctx) + (w.onlyWhen ? `, and only if ${conditionSentence(w.onlyWhen, ctx)}` : "");
      const lines = w.steps.map((s, j) => `${String.fromCharCode(97 + j)}) ${stepSentence(s, ctx)}${s.onlyWhen ? `, only if ${conditionSentence(s.onlyWhen, ctx)}` : ""}.`);
      return { number: i + 1, text: `${when}:`, lines };
    });
}
