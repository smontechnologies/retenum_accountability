import { formatMoney, money, spokenMoney, type Currency } from "@/domain/money";
import { cn } from "@/lib/cn";

const SIZES = {
  xl: "text-[1.625rem] leading-[1.875rem] font-medium sm:text-figure-xl",
  md: "text-h3 font-medium",
  sm: "text-small",
} as const;

/** Money display (DES-05): tabular figures, full precision, explicit currency, full spoken label. */
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
    <span className={cn("tabular whitespace-nowrap", SIZES[size], className)} aria-label={spokenMoney(m)}>
      <span aria-hidden>{formatMoney(m)}</span>
    </span>
  );
}
