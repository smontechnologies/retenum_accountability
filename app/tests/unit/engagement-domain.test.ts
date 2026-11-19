import { describe, expect, it } from "vitest";
import { isEditable, nextStatus, type EngagementEvent, type EngagementStatus } from "@/domain/engagement-state";
import { dueByObligation, submissionProblems, submissionWarnings, summarise, type CommitmentView } from "@/domain/baseline";

const base = (o: Partial<CommitmentView>): CommitmentView => ({
  id: o.id ?? Math.random().toString(36).slice(2),
  kind: "deliverable",
  owedBySide: "payee",
  position: 0,
  title: "Item",
  description: null,
  quantity: null,
  unit: null,
  definitionOfDone: null,
  dueDate: null,
  exclusions: null,
  priceMinor: null,
  trigger: null,
  triggerDate: null,
  termsDays: null,
  linkedCommitmentId: null,
  ...o,
});

describe("engagement lifecycle (PRD §18)", () => {
  const all: EngagementStatus[] = ["draft", "awaiting_confirmation", "active", "stopped", "closed_agreed", "closed_open_items", "withdrawn"];
  const allowed: Array<[EngagementStatus, EngagementEvent, EngagementStatus]> = [
    ["draft", "submit", "awaiting_confirmation"],
    ["awaiting_confirmation", "confirm", "active"],
    ["awaiting_confirmation", "request_changes", "draft"],
    ["awaiting_confirmation", "decline", "withdrawn"],
    ["draft", "withdraw", "withdrawn"],
    ["awaiting_confirmation", "withdraw", "withdrawn"],
  ];
  it("allows exactly the documented transitions", () => {
    for (const s of all) {
      for (const e of ["submit", "confirm", "request_changes", "decline", "withdraw"] as EngagementEvent[]) {
        const expected = allowed.find(([from, ev]) => from === s && ev === e)?.[2] ?? null;
        expect(nextStatus(s, e), `${s} --${e}`).toBe(expected);
      }
    }
  });
  it("only drafts are directly editable", () => {
    expect(all.filter(isEditable)).toEqual(["draft"]);
  });
});

describe("baseline summary and submission rules (FR-ENG-12, FR-COM-05)", () => {
  const d1 = base({ id: "d1", title: "Concepts", priceMinor: 60_000_000n });
  const d2 = base({ id: "d2", title: "Launch assets", priceMinor: 90_000_000n });
  const deposit = base({ id: "p1", kind: "payment_obligation", owedBySide: "payer", title: "Deposit", priceMinor: 60_000_000n, trigger: "on_confirmation" });
  const onAccept = base({ id: "p2", kind: "payment_obligation", owedBySide: "payer", title: "Balance", priceMinor: 90_000_000n, trigger: "on_acceptance", linkedCommitmentId: "d2" });

  it("computes agreed, scheduled and unscheduled values", () => {
    expect(summarise([d1, d2, deposit, onAccept])).toMatchObject({ agreedMinor: 150_000_000n, scheduledMinor: 150_000_000n, unscheduledMinor: 0n });
    expect(summarise([d1, d2, deposit]).unscheduledMinor).toBe(90_000_000n);
  });

  it("blocks an empty engagement", () => {
    expect(submissionProblems([])).toEqual([
      "Add at least one deliverable: what will be delivered.",
      "Add a payment schedule: at least one payment and when it becomes due.",
    ]);
  });

  it("requires a priced deliverable and a valid payment schedule", () => {
    expect(submissionProblems([base({ title: "Free item" }), deposit])).toContain("Give at least one deliverable a price.");
    expect(submissionProblems([d1, base({ kind: "payment_obligation", title: "Later", priceMinor: 1n, trigger: "on_date" })])).toContain('Payment "Later" needs a date.');
    expect(submissionProblems([d1, base({ kind: "payment_obligation", title: "Bal", priceMinor: 1n, trigger: "on_acceptance" })])).toContain(
      'Payment "Bal" must be linked to the deliverable whose acceptance makes it due.',
    );
    expect(submissionProblems([d1, d2, deposit, onAccept])).toEqual([]);
  });

  it("warns (does not block) when the schedule differs from the agreed value", () => {
    expect(submissionWarnings([d1, d2, deposit])[0]).toMatch(/less than the agreed value/);
    expect(submissionWarnings([d1, d2, deposit, onAccept])).toEqual([]);
  });

  it("makes on-confirmation and past-date payments due only once confirmed", () => {
    const dated = base({ id: "p3", kind: "payment_obligation", priceMinor: 5n, trigger: "on_date", triggerDate: "2026-11-01" });
    const future = base({ id: "p4", kind: "payment_obligation", priceMinor: 7n, trigger: "on_date", triggerDate: "2027-01-01" });
    expect([...dueByObligation([deposit, dated], false, "2026-11-19").values()]).toEqual([0n, 0n]);
    const due = dueByObligation([deposit, dated, future, onAccept], true, "2026-11-19");
    expect(due.get("p1")).toBe(60_000_000n);
    expect(due.get("p3")).toBe(5n);
    expect(due.get("p4")).toBe(0n);
    expect(due.get("p2")).toBe(0n); // acceptance arrives in Slice 4
  });
});
