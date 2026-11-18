import { describe, expect, it } from "vitest";
import { addWorkingDays, isWorkingDay } from "@/domain/working-days";

// Lagos is UTC+1. Deadlines are the end of the Nth working day after the request's local day.
describe("working-day deadlines (PRD §20 C-6)", () => {
  it("skips weekends", () => {
    // Thursday 2026-11-19 10:00 Lagos (09:00Z) + 3 working days → Tuesday 2026-11-24 23:59:59.999 Lagos
    const due = addWorkingDays(new Date("2026-11-19T09:00:00Z"), 3);
    expect(due.toISOString()).toBe("2026-11-24T22:59:59.999Z");
  });

  it("uses the Lagos calendar day, not the UTC day", () => {
    // 23:30Z on Friday is 00:30 Saturday in Lagos → counting starts after Saturday
    const due = addWorkingDays(new Date("2026-11-20T23:30:00Z"), 1);
    expect(due.toISOString()).toBe("2026-11-23T22:59:59.999Z"); // Monday end of day
  });

  it("skips listed public holidays", () => {
    const holidays = new Set(["2026-12-25", "2026-12-28"]);
    // Thu 2026-12-24 + 1 working day: Fri 25 holiday, weekend, Mon 28 holiday → Tue 29
    const due = addWorkingDays(new Date("2026-12-24T09:00:00Z"), 1, holidays);
    expect(due.toISOString()).toBe("2026-12-29T22:59:59.999Z");
  });

  it("identifies working days", () => {
    expect(isWorkingDay("2026-11-21", new Set())).toBe(false); // Saturday
    expect(isWorkingDay("2026-11-23", new Set())).toBe(true); // Monday
  });

  it("rejects non-positive day counts", () => {
    expect(() => addWorkingDays(new Date(), 0)).toThrow(RangeError);
  });
});
