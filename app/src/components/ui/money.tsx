import { formatMoney, money, spokenMoney, type Currency } from "@/domain/money";
import { cn } from "@/lib/cn";

const SIZES = {
  xl: "text-[1.625rem] leading-[1.875rem] font-medium sm:text-figure-xl",
  md: "text-h3 font-medium",
  sm: "text-small",
} as const;

/**
 * Money display (DES-05): tabular figures, full precision, explicit currency. Screen readers get the
 * full spoken amount as visually hidden text (aria-label is not permitted on a generic span).
 */
export function MoneyFigure({
  amountMinor,
  currency = "NGN",
  size = "sm",
  className,
}: {
  amountMinor: bigint;
  currency?: Currency;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const m = money(amountMinor, currency);
  return (
    <span className={cn("tabular whitespace-nowrap", SIZES[size], className)}>
      <span aria-hidden>{formatMoney(m)}</span>
      <span className="sr-only">{spokenMoney(m)}</span>
    </span>
  );
}
