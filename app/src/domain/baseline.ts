/**
 * Baseline commitments and what can be derived from them before any delivery or payment exists.
 * PRD §15.3, §22 (subset: original/agreed value, scheduled, unscheduled, due on confirmation/date).
 */
export type CommitmentKind = "deliverable" | "party_obligation" | "payment_obligation";
export type Side = "payer" | "payee";
export type Trigger = "on_confirmation" | "on_date" | "on_acceptance" | "on_request";

export interface CommitmentView {
  id: string;
  kind: CommitmentKind;
  owedBySide: Side;
  position: number;
  title: string;
  description: string | null;
  quantity: string | null;
  unit: string | null;
  definitionOfDone: string | null;
  dueDate: string | null; // yyyy-mm-dd
  exclusions: string | null;
  priceMinor: bigint | null;
  trigger: Trigger | null;
  triggerDate: string | null;
  termsDays: number | null;
  linkedCommitmentId: string | null;
}

export interface BaselineSummary {
  agreedMinor: bigint;
  scheduledMinor: bigint;
  unscheduledMinor: bigint;
  deliverables: number;
  paymentObligations: number;
  partyObligations: number;
}

export function summarise(items: CommitmentView[]): BaselineSummary {
  let agreed = 0n;
  let scheduled = 0n;
  const count = { deliverable: 0, payment_obligation: 0, party_obligation: 0 };
  for (const c of items) {
    count[c.kind]++;
    if (c.kind === "deliverable") agreed += c.priceMinor ?? 0n;
    if (c.kind === "payment_obligation") scheduled += c.priceMinor ?? 0n;
  }
  return {
    agreedMinor: agreed,
    scheduledMinor: scheduled,
    unscheduledMinor: agreed - scheduled,
    deliverables: count.deliverable,
    paymentObligations: count.payment_obligation,
    partyObligations: count.party_obligation,
  };
}

/**
 * FR-ENG-12 (no empty engagements) and FR-COM-03: what must be true before a baseline can be sent.
 * Returns plain-language problems; an empty list means it can be submitted.
 * An unscheduled difference is a warning, not a blocker (FR-COM-05).
 */
export function submissionProblems(items: CommitmentView[]): string[] {
  const problems: string[] = [];
  const s = summarise(items);
  if (s.deliverables === 0) problems.push("Add at least one deliverable: what will be delivered.");
  else if (s.agreedMinor <= 0n) problems.push("Give at least one deliverable a price.");
  if (s.paymentObligations === 0) problems.push("Add a payment schedule: at least one payment and when it becomes due.");
  const ids = new Set(items.map((c) => c.id));
  for (const c of items) {
    if (c.kind !== "payment_obligation") continue;
    if (!c.priceMinor || c.priceMinor <= 0n) problems.push(`Payment "${c.title}" needs an amount.`);
    if (c.trigger === "on_date" && !c.triggerDate) problems.push(`Payment "${c.title}" needs a date.`);
    if (c.trigger === "on_acceptance") {
      const linked = items.find((x) => x.id === c.linkedCommitmentId);
      if (!c.linkedCommitmentId || !ids.has(c.linkedCommitmentId) || linked?.kind !== "deliverable") {
        problems.push(`Payment "${c.title}" must be linked to the deliverable whose acceptance makes it due.`);
      }
    }
  }
  return problems;
}

export function submissionWarnings(items: CommitmentView[]): string[] {
  const s = summarise(items);
  if (s.deliverables > 0 && s.paymentObligations > 0 && s.unscheduledMinor !== 0n) {
    return [
      s.unscheduledMinor > 0n
        ? "The payment schedule is less than the agreed value. Both parties will see the unscheduled amount."
        : "The payment schedule is more than the agreed value. Both parties will see the difference.",
    ];
  }
  return [];
}

/**
 * Amount due per payment obligation at this stage of the product (before acceptance and requests
 * exist): on_confirmation → full amount once confirmed; on_date → full amount once the date has
 * passed and the engagement is confirmed. Acceptance (Slice 4) and requests (Slice 5) come later.
 */
export function dueByObligation(items: CommitmentView[], confirmed: boolean, todayIso: string): Map<string, bigint> {
  const due = new Map<string, bigint>();
  for (const c of items) {
    if (c.kind !== "payment_obligation") continue;
    let amount = 0n;
    if (confirmed && c.trigger === "on_confirmation") amount = c.priceMinor ?? 0n;
    if (confirmed && c.trigger === "on_date" && c.triggerDate && c.triggerDate <= todayIso) amount = c.priceMinor ?? 0n;
    due.set(c.id, amount);
  }
  return due;
}

export const TRIGGER_LABEL: Record<Trigger, string> = {
  on_confirmation: "When the agreement is confirmed",
  on_date: "On a date",
  on_acceptance: "When a deliverable is accepted",
  on_request: "When payment is requested",
};
