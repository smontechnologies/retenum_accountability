/**
 * Guided start (D-67): a few plain questions generate the engagement's workflows. The result is
 * ordinary, fully editable workflows. It's a starting point, not a template the user is locked into.
 * Pure: amounts in minor units, no database.
 */
import { formatMoney, money, parseAmount } from "./money";
import type { TriggerType } from "./workflow";

export type PaymentPlan = "deposit_balance" | "per_deliverable" | "upfront" | "on_completion";

export const PLANS: Record<PaymentPlan, { label: string; hint: string }> = {
  deposit_balance: { label: "Deposit, then the balance", hint: "A deposit when the agreement is confirmed; the rest when the final deliverable is accepted or on a date." },
  per_deliverable: { label: "Pay for each deliverable as it's accepted", hint: "Each deliverable's price becomes due when it's accepted." },
  upfront: { label: "Everything upfront", hint: "The full amount is due when the agreement is confirmed." },
  on_completion: { label: "Everything on completion", hint: "The full amount is due when the final deliverable is accepted." },
};

export interface GuidedAnswers {
  deliverables: Array<{ title: string; price: string; dueDate?: string }>;
  plan: PaymentPlan | "";
  deposit?: string; // amount ("200000") or percentage ("30%")
  balanceWhen?: "final_accepted" | "date";
  balanceDate?: string;
  termsDays?: string;
  provides?: string;
  providesBy?: string;
}

export interface PlannedStep {
  action: "start_deliverable" | "make_payment_due" | "party_provides";
  deliverableIndex?: number; // start_deliverable: which answer row
  input: Record<string, string>;
}

export interface PlannedWorkflow {
  trigger: TriggerType;
  watchesDeliverable?: number; // deliverable_accepted: which row
  date?: string; // date_reached
  steps: PlannedStep[];
}

export const MAX_DELIVERABLES = 12;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const decimal = (minor: bigint) => `${minor / 100n}.${(minor % 100n).toString().padStart(2, "0")}`;
const naira = (minor: bigint) => formatMoney(money(minor, "NGN"));

/** Turns the answers into workflows, or field errors keyed by form field name. */
export function planFromAnswers(a: GuidedAnswers): { workflows: PlannedWorkflow[]; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const rows: Array<{ index: number; title: string; priceMinor: bigint; dueDate?: string }> = [];
  a.deliverables.slice(0, MAX_DELIVERABLES).forEach((d, i) => {
    const title = d.title.trim();
    const price = d.price.trim();
    if (!title && !price) return;
    if (!title) errors[`d_title_${i}`] = "Say what will be delivered";
    let priceMinor = 0n;
    try {
      priceMinor = parseAmount(price || "x", "NGN");
    } catch {
      errors[`d_price_${i}`] = "Enter a price like 250000 (use 0 if it's included)";
    }
    if (d.dueDate && !DATE.test(d.dueDate)) errors[`d_due_${i}`] = "Use a valid date";
    rows.push({ index: i, title, priceMinor, dueDate: d.dueDate || undefined });
  });
  if (rows.length === 0) errors.d_title_0 = "Add at least one deliverable: what will be delivered";
  const total = rows.reduce((s, r) => s + r.priceMinor, 0n);
  if (rows.length > 0 && total === 0n && !Object.keys(errors).some((k) => k.startsWith("d_price"))) errors.d_price_0 = "Give at least one deliverable a price";
  if (!a.plan || !(a.plan in PLANS)) errors.plan = "Choose how you'll be paid";

  const terms = (a.termsDays ?? "").trim();
  if (terms && !(/^\d+$/.test(terms) && Number(terms) <= 365)) errors.termsDays = "Use 0 to 365 days";

  let depositMinor = 0n;
  if (a.plan === "deposit_balance") {
    const raw = (a.deposit ?? "").trim().replace(/\s/g, "");
    try {
      if (raw.endsWith("%")) {
        const basis = parseAmount(raw.slice(0, -1), "NGN"); // 30% → 3000 (two decimals)
        depositMinor = (total * basis) / 10_000n;
      } else depositMinor = parseAmount(raw || "x", "NGN");
      if (depositMinor <= 0n) errors.deposit = "Enter a deposit greater than zero";
      else if (total > 0n && depositMinor >= total) errors.deposit = `The deposit must be less than the total (${naira(total)})`;
    } catch {
      errors.deposit = "Enter an amount like 200000 or a percentage like 30%";
    }
    if (a.balanceWhen === "date" && !(a.balanceDate && DATE.test(a.balanceDate))) errors.balanceDate = "Choose the date the balance is due";
  }
  if (a.provides?.trim() && a.providesBy && !DATE.test(a.providesBy)) errors.providesBy = "Use a valid date";
  if (Object.keys(errors).length > 0) return { workflows: [], errors };

  const pay = (title: string, minor: bigint): PlannedStep => ({ action: "make_payment_due", input: { title, amount: decimal(minor), termsDays: terms } });
  const deliverableSteps = rows.map(
    (r): PlannedStep => ({ action: "start_deliverable", deliverableIndex: r.index, input: { title: r.title, price: decimal(r.priceMinor), dueDate: r.dueDate ?? "" } }),
  );
  const provideSteps: PlannedStep[] = a.provides?.trim() ? [{ action: "party_provides", input: { owedBySide: "payer", title: a.provides.trim(), dueDate: a.providesBy ?? "" } }] : [];
  const final = rows[rows.length - 1]!.index;

  const main: PlannedWorkflow = { trigger: "agreement_confirmed", steps: [] };
  const workflows: PlannedWorkflow[] = [main];
  switch (a.plan as PaymentPlan) {
    case "upfront":
      main.steps.push(pay("Full payment", total));
      break;
    case "deposit_balance":
      main.steps.push(pay("Deposit", depositMinor));
      workflows.push(
        a.balanceWhen === "date"
          ? { trigger: "date_reached", date: a.balanceDate, steps: [pay("Balance", total - depositMinor)] }
          : { trigger: "deliverable_accepted", watchesDeliverable: final, steps: [pay("Balance", total - depositMinor)] },
      );
      break;
    case "per_deliverable":
      for (const r of rows) if (r.priceMinor > 0n) workflows.push({ trigger: "deliverable_accepted", watchesDeliverable: r.index, steps: [pay(`Payment for ${r.title}`, r.priceMinor)] });
      break;
    case "on_completion":
      workflows.push({ trigger: "deliverable_accepted", watchesDeliverable: final, steps: [pay("Full payment", total)] });
      break;
  }
  main.steps.push(...deliverableSteps, ...provideSteps);
  return { workflows, errors };
}

/** Reads the guided-start form (rows are d_title_N / d_price_N / d_due_N). */
export function answersFromFields(f: Record<string, unknown>): GuidedAnswers {
  const s = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : "");
  const deliverables: GuidedAnswers["deliverables"] = [];
  for (let i = 0; i < MAX_DELIVERABLES; i++) {
    if (!(`d_title_${i}` in f) && !(`d_price_${i}` in f)) continue;
    deliverables[i] = { title: s(`d_title_${i}`), price: s(`d_price_${i}`), dueDate: s(`d_due_${i}`) };
  }
  return {
    deliverables: Array.from(deliverables, (d) => d ?? { title: "", price: "" }),
    plan: s("plan") as GuidedAnswers["plan"],
    deposit: s("deposit"),
    balanceWhen: s("balanceWhen") === "date" ? "date" : "final_accepted",
    balanceDate: s("balanceDate"),
    termsDays: s("termsDays"),
    provides: s("provides"),
    providesBy: s("providesBy"),
  };
}
