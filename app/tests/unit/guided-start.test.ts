import { describe, expect, it } from "vitest";
import { answersFromFields, planFromAnswers, type GuidedAnswers } from "@/domain/guided-start";

const base = (o: Partial<GuidedAnswers>): GuidedAnswers => ({
  deliverables: [
    { title: "Three concepts", price: "600,000" },
    { title: "Launch assets", price: "900000", dueDate: "2027-02-01" },
  ],
  plan: "deposit_balance",
  deposit: "40%",
  balanceWhen: "final_accepted",
  termsDays: "7",
  ...o,
});
const payments = (r: ReturnType<typeof planFromAnswers>) =>
  r.workflows.flatMap((w) => w.steps.filter((s) => s.action === "make_payment_due").map((s) => ({ trigger: w.trigger, watches: w.watchesDeliverable, date: w.date, title: s.input.title, amount: s.input.amount })));

describe("guided start (D-67)", () => {
  it("deposit as a percentage, balance when the final deliverable is accepted", () => {
    const r = planFromAnswers(base({}));
    expect(r.errors).toEqual({});
    expect(payments(r)).toEqual([
      { trigger: "agreement_confirmed", watches: undefined, date: undefined, title: "Deposit", amount: "600000.00" },
      { trigger: "deliverable_accepted", watches: 1, date: undefined, title: "Balance", amount: "900000.00" },
    ]);
    expect(r.workflows[0]!.steps.map((s) => s.action)).toEqual(["make_payment_due", "start_deliverable", "start_deliverable"]);
    expect(r.workflows[0]!.steps[0]!.input.termsDays).toBe("7");
  });

  it("deposit as an amount, balance on a date; client provides something", () => {
    const r = planFromAnswers(base({ deposit: "250,000.50", balanceWhen: "date", balanceDate: "2027-03-01", provides: "Brand assets", providesBy: "2027-01-10" }));
    expect(payments(r)).toEqual([
      { trigger: "agreement_confirmed", watches: undefined, date: undefined, title: "Deposit", amount: "250000.50" },
      { trigger: "date_reached", watches: undefined, date: "2027-03-01", title: "Balance", amount: "1249999.50" },
    ]);
    expect(r.workflows[0]!.steps.at(-1)).toEqual({ action: "party_provides", input: { owedBySide: "payer", title: "Brand assets", dueDate: "2027-01-10" } });
  });

  it("per deliverable skips free items; upfront and on completion use the total", () => {
    const per = planFromAnswers(base({ plan: "per_deliverable", deliverables: [{ title: "A", price: "100" }, { title: "Free extra", price: "0" }, { title: "B", price: "200" }] }));
    expect(payments(per).map((p) => [p.title, p.watches, p.amount])).toEqual([["Payment for A", 0, "100.00"], ["Payment for B", 2, "200.00"]]);
    expect(payments(planFromAnswers(base({ plan: "upfront" })))).toEqual([{ trigger: "agreement_confirmed", watches: undefined, date: undefined, title: "Full payment", amount: "1500000.00" }]);
    expect(payments(planFromAnswers(base({ plan: "on_completion" })))[0]).toMatchObject({ trigger: "deliverable_accepted", watches: 1, amount: "1500000.00" });
  });

  it("explains every problem against the field that has it", () => {
    expect(planFromAnswers(base({ deliverables: [], plan: "" })).errors).toEqual({ d_title_0: "Add at least one deliverable: what will be delivered", plan: "Choose how you'll be paid" });
    expect(planFromAnswers(base({ deliverables: [{ title: "X", price: "abc" }, { title: "", price: "5" }] })).errors).toMatchObject({ d_price_0: expect.any(String), d_title_1: "Say what will be delivered" });
    expect(planFromAnswers(base({ deposit: "1500000" })).errors.deposit).toBe("The deposit must be less than the total (₦1,500,000.00)");
    expect(planFromAnswers(base({ deposit: "lots" })).errors.deposit).toMatch(/percentage like 30%/);
    expect(planFromAnswers(base({ balanceWhen: "date" })).errors.balanceDate).toBeDefined();
    expect(planFromAnswers(base({ deliverables: [{ title: "Free", price: "0" }] })).errors.d_price_0).toBe("Give at least one deliverable a price");
    expect(planFromAnswers(base({ termsDays: "400" })).errors.termsDays).toBeDefined();
  });

  it("reads numbered form rows, ignoring blank rows", () => {
    const a = answersFromFields({ d_title_0: "A", d_price_0: "1", d_title_2: "", d_price_2: "", d_title_3: "C", d_price_3: "3", plan: "upfront" });
    const r = planFromAnswers(a);
    expect(r.errors).toEqual({});
    expect(r.workflows[0]!.steps.filter((s) => s.action === "start_deliverable").map((s) => s.deliverableIndex)).toEqual([0, 3]);
  });
});
