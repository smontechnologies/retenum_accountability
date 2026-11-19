import type { Currency } from "@/domain/money";
import type { StatusKey } from "@/domain/status";
import { MoneyFigure } from "./money";
import { StatusBadge } from "./status-badge";

/** Shown before every money action (UI/UX §6.4): what, why, how much, to whom, and how. */
export function PaymentSummary(p: {
  obligation: string;
  reason: string;
  recipient: string;
  method: "off_platform" | "provider";
  due: bigint;
  alreadyPaid: bigint;
  thisPayment: bigint;
  status?: StatusKey;
  currency?: Currency;
}) {
  const after = p.due - p.alreadyPaid - p.thisPayment;
  const rows: Array<[string, bigint]> = [
    ["Amount due", p.due],
    ["Already paid", p.alreadyPaid],
    ["This payment", p.thisPayment],
  ];
  return (
    <section aria-label="Payment summary" className="rounded-panel border border-line">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold">{p.obligation}</p>
          <p className="text-small text-fg-muted">{p.reason}</p>
        </div>
        {p.status && <StatusBadge status={p.status} />}
      </div>
      <dl className="divide-y divide-line px-4">
        {rows.map(([label, v]) => (
          <div key={label} className="flex justify-between gap-4 py-2 text-small">
            <dt className="text-fg-secondary">{label}</dt>
            <dd><MoneyFigure amountMinor={v} currency={p.currency} /></dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="font-semibold">Outstanding after this payment</dt>
          <dd className="font-semibold"><MoneyFigure amountMinor={after < 0n ? 0n : after} currency={p.currency} /></dd>
        </div>
      </dl>
      <p className="border-t border-line px-4 py-2.5 text-small text-fg-secondary">
        Paid to <span className="font-medium text-fg">{p.recipient}</span>.{" "}
        {p.method === "off_platform"
          ? "You make this payment yourself (for example by bank transfer). It counts as paid once the recipient confirms receipt."
          : "Processed by our payment provider and paid directly to the recipient. It counts as paid once the provider confirms it."}
      </p>
    </section>
  );
}
