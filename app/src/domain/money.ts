/**
 * Money is always an integer number of minor units (e.g. kobo) as bigint, plus an ISO 4217 currency
 * (FR-FIN-06, TD-08). No floating point arithmetic anywhere.
 */
export const CURRENCY_EXPONENT = { NGN: 2, GBP: 2, USD: 2 } as const;
export type Currency = keyof typeof CURRENCY_EXPONENT;

export interface Money {
  readonly amountMinor: bigint;
  readonly currency: Currency;
}

export function isCurrency(value: string): value is Currency {
  return Object.prototype.hasOwnProperty.call(CURRENCY_EXPONENT, value);
}

export function money(amountMinor: bigint, currency: Currency): Money {
  if (typeof amountMinor !== "bigint") throw new TypeError("amountMinor must be a bigint");
  return { amountMinor, currency };
}

function assertSame(a: Money, b: Money) {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
}

export const add = (a: Money, b: Money): Money => (assertSame(a, b), money(a.amountMinor + b.amountMinor, a.currency));
export const subtract = (a: Money, b: Money): Money => (assertSame(a, b), money(a.amountMinor - b.amountMinor, a.currency));
export const zero = (currency: Currency): Money => money(0n, currency);
export const sum = (items: Money[], currency: Currency): Money => items.reduce((acc, m) => add(acc, m), zero(currency));
export const maxZero = (m: Money): Money => (m.amountMinor < 0n ? zero(m.currency) : m);

/**
 * Pro-rata share, rounded DOWN to the minor unit (PRD §21 A-2): floor(total * part / whole).
 * Throws on non-positive whole. Result never exceeds total for 0 <= part <= whole.
 */
export function proRata(total: bigint, part: bigint, whole: bigint): bigint {
  if (whole <= 0n) throw new RangeError("whole must be positive");
  if (part < 0n || total < 0n) throw new RangeError("total and part must be non-negative");
  const capped = part > whole ? whole : part;
  return (total * capped) / whole; // bigint division truncates toward zero == floor for non-negatives
}

/**
 * Parse a user-entered decimal string ("1,250.50") into minor units. Rejects more decimals than
 * the currency allows, negative values unless allowed, and anything non-numeric.
 */
export function parseAmount(input: string, currency: Currency, opts: { allowNegative?: boolean } = {}): bigint {
  const exp = CURRENCY_EXPONENT[currency];
  const cleaned = input.trim().replace(/,/g, "");
  const re = new RegExp(`^(-)?(\\d+)(?:\\.(\\d{1,${exp}}))?$`);
  const m = re.exec(cleaned);
  if (!m) throw new RangeError(`Invalid amount: "${input}"`);
  const negative = Boolean(m[1]);
  if (negative && !opts.allowNegative) throw new RangeError("Amount cannot be negative");
  const whole = BigInt(m[2]!);
  const frac = BigInt((m[3] ?? "").padEnd(exp, "0") || "0");
  const value = whole * 10n ** BigInt(exp) + frac;
  return negative ? -value : value;
}

/** Format for display, e.g. ₦1,250.50. Uses Intl only on the already-split integer parts. */
export function formatMoney(m: Money, locale = "en-NG"): string {
  const exp = CURRENCY_EXPONENT[m.currency];
  const negative = m.amountMinor < 0n;
  const abs = negative ? -m.amountMinor : m.amountMinor;
  const base = 10n ** BigInt(exp);
  const whole = abs / base;
  const frac = (abs % base).toString().padStart(exp, "0");
  const symbol = new Intl.NumberFormat(locale, { style: "currency", currency: m.currency, currencyDisplay: "narrowSymbol" })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? m.currency;
  const wholeStr = new Intl.NumberFormat(locale).format(whole);
  return `${negative ? "-" : ""}${symbol}${wholeStr}${exp > 0 ? "." + frac : ""}`;
}

const CURRENCY_WORDS: Record<Currency, [string, string]> = {
  NGN: ["naira", "kobo"],
  GBP: ["pounds", "pence"],
  USD: ["dollars", "cents"],
};

/** Full spoken amount for screen readers (design system §9.6), e.g. "1,250,000 naira and 50 kobo". */
export function spokenMoney(m: Money, locale = "en-NG"): string {
  const exp = CURRENCY_EXPONENT[m.currency];
  const negative = m.amountMinor < 0n;
  const abs = negative ? -m.amountMinor : m.amountMinor;
  const base = 10n ** BigInt(exp);
  const [major, minor] = CURRENCY_WORDS[m.currency];
  const text = `${new Intl.NumberFormat(locale).format(abs / base)} ${major} and ${(abs % base).toString()} ${minor}`;
  return negative ? `minus ${text}` : text;
}
