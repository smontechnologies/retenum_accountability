"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { guidedStartAction } from "@/app/app/engagements/actions";
import { MAX_DELIVERABLES, PLANS, type PaymentPlan } from "@/domain/guided-start";
import { formatMoney, money, parseAmount } from "@/domain/money";
import { ActionForm, Field } from "@/components/ui/form";

const minor = (v: string) => {
  try {
    return parseAmount(v || "0", "NGN");
  } catch {
    return 0n;
  }
};
const naira = (m: bigint) => formatMoney(money(m, "NGN"));

/**
 * Guided start (D-67). Plain questions → ordinary workflows the user can then change in the editor.
 * Works without JavaScript (all fields shown); with it, fields follow the chosen plan and totals update.
 */
export function GuidedStartForm({ engagementId, payerName, otherName }: { engagementId: string; payerName: string; otherName: string }) {
  const [rows, setRows] = useState<number[]>([0, 1]);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [plan, setPlan] = useState<PaymentPlan | "">("");
  const [deposit, setDeposit] = useState("");
  const [balanceWhen, setBalanceWhen] = useState<"final_accepted" | "date">("final_accepted");
  const total = rows.reduce((s, i) => s + minor((prices[i] ?? "").replace(/,/g, "")), 0n);
  const depositMinor = (() => {
    const d = deposit.replace(/[\s,]/g, "");
    if (d.endsWith("%")) return (total * minor(d.slice(0, -1))) / 10_000n;
    return minor(d);
  })();
  const next = (rows.at(-1) ?? -1) + 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-h2 font-semibold">Set up the agreement</h2>
        <p className="mt-1 text-fg-secondary">Answer a few questions and Retenum writes the agreement for you. You can change anything afterwards, and nothing is sent to {otherName} until you send it.</p>
      </div>
      <ActionForm action={guidedStartAction} submitLabel="Set up the agreement" pendingLabel="Setting up…">
        <input type="hidden" name="engagementId" value={engagementId} />

        <fieldset className="space-y-4">
          <legend className="text-h3 font-semibold">1. What will you deliver?</legend>
          <p className="text-small text-fg-secondary">One line per deliverable, in the order you'll deliver them. The last one is the final deliverable.</p>
          <ol className="space-y-4">
            {rows.map((i, n) => (
              <li key={i} className="rounded-panel border border-line bg-raised p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-small font-semibold">Deliverable {n + 1}</span>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => setRows(rows.filter((r) => r !== i))} className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-small text-fg-secondary hover:bg-surface hover:text-fg">
                      <Trash2 aria-hidden className="size-4" /> Remove<span className="sr-only"> deliverable {n + 1}</span>
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
                  <Field name={`d_title_${i}`} label="What" />
                  <Field name={`d_price_${i}`} label="Price (₦)" inputMode="decimal" onChange={(e) => setPrices({ ...prices, [i]: e.target.value })} />
                </div>
                <div className="mt-3 sm:max-w-[14rem]">
                  <Field name={`d_due_${i}`} label="Due date (optional)" type="date" />
                </div>
              </li>
            ))}
          </ol>
          {rows.length < MAX_DELIVERABLES && (
            <button type="button" onClick={() => setRows([...rows, next])} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-dashed border-line-strong px-4 text-small font-medium hover:bg-surface">
              <Plus aria-hidden className="size-4" /> Add another deliverable
            </button>
          )}
          <p className="text-small" aria-live="polite">Total: <span className="font-semibold tabular">{naira(total)}</span></p>
        </fieldset>

        <fieldset className="space-y-3 border-t border-line pt-6">
          <legend className="text-h3 font-semibold">2. How will {payerName} pay?</legend>
          {(Object.keys(PLANS) as PaymentPlan[]).map((p) => (
            <label key={p} className="flex min-h-12 cursor-pointer gap-3 rounded-control border border-line-strong p-3 has-[:checked]:border-2 has-[:checked]:border-fg">
              <input type="radio" name="plan" value={p} checked={plan === p} onChange={() => setPlan(p)} className="mt-1 size-4 shrink-0 accent-[var(--fg)]" />
              <span>
                <span className="block text-small font-semibold">{PLANS[p].label}</span>
                <span className="block text-caption text-fg-muted">{PLANS[p].hint}</span>
              </span>
            </label>
          ))}
          {(plan === "deposit_balance" || plan === "") && (
            <div className="space-y-4 rounded-panel bg-surface p-4">
              <Field name="deposit" label="Deposit" hint="An amount like 200000, or a percentage like 30%." onChange={(e) => setDeposit(e.target.value)} />
              {plan === "deposit_balance" && total > 0n && depositMinor > 0n && depositMinor < total && (
                <p className="text-small" aria-live="polite">Deposit {naira(depositMinor)}, then a balance of <span className="font-semibold">{naira(total - depositMinor)}</span>.</p>
              )}
              <fieldset className="space-y-2">
                <legend className="text-small font-medium">The balance is due</legend>
                <label className="flex min-h-11 items-center gap-2 text-small"><input type="radio" name="balanceWhen" value="final_accepted" checked={balanceWhen === "final_accepted"} onChange={() => setBalanceWhen("final_accepted")} className="size-4 accent-[var(--fg)]" /> When the final deliverable is accepted</label>
                <label className="flex min-h-11 items-center gap-2 text-small"><input type="radio" name="balanceWhen" value="date" checked={balanceWhen === "date"} onChange={() => setBalanceWhen("date")} className="size-4 accent-[var(--fg)]" /> On a date</label>
              </fieldset>
              {(balanceWhen === "date" || plan === "") && <Field name="balanceDate" label="Balance due on" type="date" />}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-h3 font-semibold">3. Payment terms</legend>
          <div className="sm:max-w-xs"><Field name="termsDays" label="Days to pay once a payment is due" type="number" min={0} max={365} defaultValue="7" /></div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-h3 font-semibold">4. Does {payerName} need to provide anything? <span className="font-normal text-fg-muted">(optional)</span></legend>
          <Field name="provides" label="What they provide" hint="For example: site access, brand assets, approvals." />
          <div className="sm:max-w-[14rem]"><Field name="providesBy" label="By when (optional)" type="date" /></div>
        </fieldset>
      </ActionForm>
      <p className="text-small text-fg-secondary">
        Prefer to build it step by step? <Link href={`/app/engagements/${engagementId}`} className="font-medium text-fg underline underline-offset-4">Set it up myself in Workflows</Link>
      </p>
    </div>
  );
}
