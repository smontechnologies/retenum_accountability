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
export function LedgerStrip({ figures, currency = "NGN", compact = false }: { figures: LedgerFigures; currency?: Currency; compact?: boolean }) {
  if (compact) return <CompactLedger figures={figures} currency={currency} />;
  const cells: Array<{ label: string; value: bigint; primary?: boolean }> = [
    { label: "Agreed", value: figures.agreed, primary: true },
    { label: "Paid", value: figures.paid, primary: true },
    { label: "Outstanding", value: figures.outstanding, primary: true },
  ];
  if (figures.disputed !== undefined) cells.push({ label: "Disputed", value: figures.disputed });
  // Phones: one row per figure (label left, amount right) so large amounts never collide.
  // Tablets: two columns. Desktop: one row with hairline dividers and large figures.
  return (
    <section aria-label="Financial position" className="rounded-panel border border-line">
      <dl className="divide-y divide-line md:grid md:grid-cols-2 md:divide-y-0 lg:flex lg:divide-x">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={
              "flex min-w-0 items-baseline justify-between gap-3 px-4 py-3 md:block lg:flex-1 lg:px-5 lg:py-4 " +
              (i % 2 === 1 ? "md:border-l md:border-line lg:border-l-0 " : "") +
              (i >= 2 ? "md:border-t md:border-line lg:border-t-0" : "")
            }
          >
            <dt className="text-caption text-fg-muted">{c.label}</dt>
            <dd className="min-w-0 md:mt-1">
              <MoneyFigure
                amountMinor={c.value}
                currency={currency}
                size="md"
                className={c.primary ? "font-semibold md:text-figure-xl md:leading-[2.25rem] md:font-medium" : ""}
              />
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

/**
 * Compact strip for the engagement header: the same figures in one small row so the workspace
 * below stays visible. Wraps instead of overflowing on narrow screens.
 */
function CompactLedger({ figures, currency }: { figures: LedgerFigures; currency: Currency }) {
  const cells: Array<{ label: string; value: bigint }> = [
    { label: "Agreed", value: figures.agreed },
    { label: "Paid", value: figures.paid },
    { label: "Outstanding", value: figures.outstanding },
  ];
  if (figures.due !== undefined) cells.push({ label: "Due now", value: figures.due });
  if (figures.disputed !== undefined) cells.push({ label: "Disputed", value: figures.disputed });
  return (
    <section aria-label="Financial position" className="rounded-panel border border-line bg-raised">
      <dl className="flex flex-wrap divide-line [&>div]:border-line">
        {cells.map((c, i) => (
          <div key={c.label} className={"min-w-0 px-3 py-1.5 " + (i > 0 ? "border-l" : "")}>
            <dt className="text-caption text-fg-muted">{c.label}</dt>
            <dd><MoneyFigure amountMinor={c.value} currency={currency} className="text-small font-semibold" /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
