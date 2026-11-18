/**
 * Working-day deadline arithmetic (PRD §20 C-6). Mon–Fri; optional holiday list (ISO yyyy-mm-dd).
 * Calendar dates are evaluated in a fixed time zone (MVP: Africa/Lagos, UTC+1, no DST).
 */
export const LAGOS_OFFSET_MINUTES = 60;

function toLocalDateParts(instant: Date, offsetMinutes: number) {
  const shifted = new Date(instant.getTime() + offsetMinutes * 60_000);
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth(), d: shifted.getUTCDate() };
}

function isoDate(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

export function isWorkingDay(isoDay: string, holidays: ReadonlySet<string>): boolean {
  const day = new Date(`${isoDay}T00:00:00Z`).getUTCDay();
  return day !== 0 && day !== 6 && !holidays.has(isoDay);
}

/**
 * Deadline = end of the Nth working day after the local calendar day of `from` (the day of the
 * request itself does not count). Returns the instant 23:59:59.999 local time on that day.
 */
export function addWorkingDays(
  from: Date,
  workingDays: number,
  holidays: ReadonlySet<string> = new Set(),
  offsetMinutes = LAGOS_OFFSET_MINUTES,
): Date {
  if (!Number.isInteger(workingDays) || workingDays < 1) throw new RangeError("workingDays must be a positive integer");
  const { y, m, d } = toLocalDateParts(from, offsetMinutes);
  let cursor = Date.UTC(y, m, d);
  let counted = 0;
  while (counted < workingDays) {
    cursor += 86_400_000;
    const c = new Date(cursor);
    if (isWorkingDay(isoDate(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()), holidays)) counted++;
  }
  // end of that local day, converted back to UTC
  return new Date(cursor + 86_400_000 - 1 - offsetMinutes * 60_000);
}
