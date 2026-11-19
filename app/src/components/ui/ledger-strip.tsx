import type { Currency } from "@/domain/money";
import { MoneyFigure } from "./money";

export interface LedgerFigures {
  agreed: bigint;
  paid: bigint;
  outstanding: bigint;
  due?: bigint;
  disputed?: bigint;
  pendingValuation?: { low: bigint; high: bigint } | null;
}

/**
 * The signature element (design system §1): the engagement's financial position at a glance.
 * Desktop: one row with hairline dividers. Mobile: two columns.
 */
export function LedgerStrip({ figures, currency = "NGN" }: { figures: LedgerFigures; currency?: Currency }) {
  const cells: Array<{ label: string; value: bigint; primary?: boolean }> = [
    { label: "Agreed", value: figures.agreed, primary: true },
    { label: "Paid", value: figures.paid, primary: true },
    { label: "Outstanding", value: figures.outstanding, primary: true },
  ];
  if (figures.disputed !== undefined) cells.push({ label: "Disputed", value: figures.disputed });
  return (
    <section aria-label="Financial position" className="rounded-panel border border-line">
      <dl className="grid grid-cols-2 lg:flex lg:divide-x lg:divide-line">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={
              "min-w-0 px-4 py-3 lg:flex-1 lg:px-5 lg:py-4 " +
              (i % 2 === 1 ? "border-l border-line lg:border-l-0 " : "") +
              (i >= 2 ? "border-t border-line lg:border-t-0" : "")
            }
          >
            <dt className="text-caption text-fg-muted">{c.label}</dt>
            <dd className="mt-1">
              <MoneyFigure amountMinor={c.value} currency={currency} size={c.primary ? "xl" : "md"} />
            </dd>
          </div>
        ))}
      </dl>
      {(figures.due !== undefined || figures.pendingValuation) && (
        <p className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-4 py-2 text-caption text-fg-secondary lg:px-5">
          {figures.due !== undefined && (
            <span>
              Due now <MoneyFigure amountMinor={figures.due} currency={currency} />
            </span>
          )}
          {figures.pendingValuation && (
            <span>
              Authorised, valuation pending <MoneyFigure amountMinor={figures.pendingValuation.low} currency={currency} />–
              <MoneyFigure amountMinor={figures.pendingValuation.high} currency={currency} />
            </span>
          )}
        </p>
      )}
    </section>
  );
}
