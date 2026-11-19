import { describe, expect, it } from "vitest";
import type { CommitmentView } from "@/domain/baseline";
import {
  ACTIONS,
  agreementClauses,
  commitmentsOf,
  conditionSentence,
  derivePaymentTrigger,
  groupOf,
  sendProblems,
  stepSentence,
  triggerSentence,
  TRIGGERS,
  type SentenceContext,
  type StepView,
  type WorkflowView,
} from "@/domain/workflow";

const c = (o: Partial<CommitmentView> & { id: string; kind: CommitmentView["kind"] }): CommitmentView => ({
  owedBySide: o.kind === "party_obligation" ? "payer" : o.kind === "deliverable" ? "payee" : "payer",
  position: 0, title: "X", description: null, quantity: null, unit: null, definitionOfDone: null, dueDate: null, exclusions: null,
  priceMinor: null, trigger: null, triggerDate: null, termsDays: null, linkedCommitmentId: null, ...o,
});
const step = (o: Partial<StepView> & Pick<StepView, "id" | "actionType">): StepView => ({ position: 0, params: {}, onlyWhen: null, commitment: null, ...o });

const concepts = c({ id: "d1", kind: "deliverable", title: "Three concepts", priceMinor: 60_000_000n });
const launch = c({ id: "d2", kind: "deliverable", title: "Launch assets", priceMinor: 90_000_000n, dueDate: "2027-02-01" });
const deposit = c({ id: "p1", kind: "payment_obligation", title: "Deposit", priceMinor: 60_000_000n, termsDays: 7 });
const balance = c({ id: "p2", kind: "payment_obligation", title: "Balance", priceMinor: 90_000_000n });
const assets = c({ id: "o1", kind: "party_obligation", owedBySide: "payer", title: "brand assets", dueDate: "2027-01-10" });

const w1: WorkflowView = {
  id: "w1", position: 0, triggerType: "agreement_confirmed", triggerParams: {}, onlyWhen: null,
  steps: [
    step({ id: "s1", actionType: "make_payment_due", commitment: deposit }),
    step({ id: "s2", actionType: "start_deliverable", commitment: concepts }),
    step({ id: "s3", actionType: "start_deliverable", commitment: launch }),
    step({ id: "s4", actionType: "party_provides", commitment: assets }),
  ],
};
const w2: WorkflowView = {
  id: "w2", position: 1, triggerType: "deliverable_accepted", triggerParams: { commitmentId: "d2" }, onlyWhen: null,
  steps: [
    step({ id: "s5", actionType: "make_payment_due", commitment: balance, onlyWhen: { type: "delivered_before", commitmentId: "d2", date: "2027-01-31" } }),
    step({ id: "s6", actionType: "notify", params: { who: "payee", message: "Balance is now due" } }),
  ],
};
const w3: WorkflowView = { id: "w3", position: 2, triggerType: "no_response", triggerParams: { days: 3 }, onlyWhen: null, steps: [step({ id: "s7", actionType: "remind", params: { who: "payer", afterDays: 1, repeatDays: 2 } })] };

const ctx = (wfs: WorkflowView[]): SentenceContext => ({
  commitments: new Map(commitmentsOf(wfs).map((x) => [x.id, x])),
  workflows: new Map(wfs.map((w) => [w.id, w])),
  payerName: "Kola Foods",
  payeeName: "Ada Studio",
  formatDate: (iso) => ({ "2027-01-10": "10 Jan 2027", "2027-01-31": "31 Jan 2027", "2027-02-01": "1 Feb 2027", "2027-03-01": "1 Mar 2027" })[iso] ?? iso,
});

describe("workflow vocabulary (FR-WF-03/04)", () => {
  it("has every v1 trigger and step, with helpers marked as non-commercial", () => {
    expect(Object.keys(TRIGGERS)).toHaveLength(13);
    expect(Object.keys(ACTIONS)).toHaveLength(10);
    expect(Object.entries(ACTIONS).filter(([, a]) => !a.commercial).map(([k]) => k)).toEqual(["notify", "remind"]);
  });
});

describe("sentences (single source for canvas, clauses and snapshot)", () => {
  const x = ctx([w1, w2, w3]);
  it("reads triggers as plain sentences", () => {
    expect(triggerSentence(w1, x)).toBe("When the agreement is confirmed");
    expect(triggerSentence(w2, x)).toBe("When “Launch assets” is accepted");
    expect(triggerSentence({ triggerType: "date_reached", triggerParams: { date: "2027-03-01" } }, x)).toBe("On 1 Mar 2027");
    expect(triggerSentence({ triggerType: "date_reached", triggerParams: { afterDays: 14 } }, x)).toBe("14 days after the agreement is confirmed");
    expect(triggerSentence(w3, x)).toBe("When a request has no response within 3 working days");
    expect(triggerSentence({ triggerType: "workflow_finished", triggerParams: { workflowId: "w2" } }, x)).toBe("When workflow “When “Launch assets” is accepted” finishes");
  });
  it("reads steps and conditions as plain sentences with money and dates", () => {
    expect(stepSentence(w1.steps[0]!, x)).toBe("Kola Foods pays “Deposit”: ₦600,000.00, within 7 days");
    expect(stepSentence(w1.steps[2]!, x)).toBe("Ada Studio delivers “Launch assets” for ₦900,000.00, due 1 Feb 2027");
    expect(stepSentence(w1.steps[3]!, x)).toBe("Kola Foods provides “brand assets” by 10 Jan 2027");
    expect(stepSentence(w3.steps[0]!, x)).toBe("Remind Kola Foods after 1 day, then every 2 days");
    expect(conditionSentence({ type: "outstanding_amount", op: "more", amountMinor: "5000000" }, x)).toBe("the amount outstanding is more than ₦50,000.00");
  });
  it("renders the agreement as numbered clauses, including Only-when conditions", () => {
    const clauses = agreementClauses([w1, w2, w3], x);
    expect(clauses[1]).toEqual({
      number: 2,
      text: "When “Launch assets” is accepted:",
      lines: ["a) Kola Foods pays “Balance”: ₦900,000.00, only if “Launch assets” was delivered before 31 Jan 2027.", "b) Notify Ada Studio: “Balance is now due”."],
    });
  });
});

describe("grouping and money derivation", () => {
  it("lists helper-only workflows under Reminders, others by trigger", () => {
    expect([w1, w2, w3].map(groupOf)).toEqual(["Agreement", "Delivery", "Reminders"]);
  });
  it("derives each payment's due trigger from its workflow trigger", () => {
    expect(derivePaymentTrigger(w1)).toEqual({ trigger: "on_confirmation", triggerDate: null, linkedCommitmentId: null });
    expect(derivePaymentTrigger(w2)).toEqual({ trigger: "on_acceptance", triggerDate: null, linkedCommitmentId: "d2" });
    expect(derivePaymentTrigger({ triggerType: "date_reached", triggerParams: { date: "2027-03-01" } })).toEqual({ trigger: "on_date", triggerDate: "2027-03-01", linkedCommitmentId: null });
    expect(derivePaymentTrigger(w3).trigger).toBe("on_workflow");
  });
});

describe("send rules (FR-ENG-12)", () => {
  it("blocks a blank start and explains what's missing", () => {
    const blank: WorkflowView = { id: "b", position: 0, triggerType: "agreement_confirmed", triggerParams: {}, onlyWhen: null, steps: [] };
    expect(sendProblems([blank], ctx([blank]))).toEqual([
      "Add a step that starts a deliverable: what will be delivered.",
      "Add a step that makes a payment due.",
      "Workflow “When the agreement is confirmed” has no steps. Add a step or remove the workflow.",
    ]);
  });
  it("requires triggers and steps to point at real things", () => {
    const loose: WorkflowView = { id: "l", position: 3, triggerType: "deliverable_accepted", triggerParams: {}, onlyWhen: null, steps: [step({ id: "s9", actionType: "request_payment" })] };
    const problems = sendProblems([w1, loose], ctx([w1, loose]));
    expect(problems).toContain("Workflow “When “(not chosen)” is accepted” needs you to choose what it watches.");
    expect(problems).toContain("A step in “When “(not chosen)” is accepted” needs you to choose what it applies to.");
  });
  it("passes a complete agreement", () => {
    expect(sendProblems([w1, w2, w3], ctx([w1, w2, w3]))).toEqual([]);
  });
});
