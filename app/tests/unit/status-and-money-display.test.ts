import { describe, expect, it } from "vitest";
import * as icons from "lucide-react";
import { resolveStyle, STATUS, type StatusKey } from "@/domain/status";
import { money, spokenMoney } from "@/domain/money";

// Every state named in the PRD / founder brief must exist in the status grammar (DES-06).
const REQUIRED: StatusKey[] = [
  "proposed", "confirmed", "rejected", "authorised", "valuation_pending", "submitted", "accepted",
  "partially_accepted", "disputed", "payment_pending", "paid", "refunded", "overdue", "closed",
  "draft", "countered", "withdrawn", "stale", "declined", "valuation_agreed", "correction_requested",
  "scheduled", "due", "reported", "not_received", "response_overdue", "active", "stopped", "closed_open_items",
];

describe("status grammar (DES-06)", () => {
  it("covers every required state with a label, an existing icon and a style", () => {
    for (const key of REQUIRED) {
      const s = STATUS[key];
      expect(s, key).toBeDefined();
      expect(s.label.length, key).toBeGreaterThan(0);
      expect((icons as Record<string, unknown>)[s.icon], `${key} icon ${s.icon}`).toBeDefined();
    }
  });

  it("uses sentence case labels (no all-caps)", () => {
    for (const s of Object.values(STATUS)) {
      expect(s.label[0]).toBe(s.label[0]!.toUpperCase());
      expect(s.label).not.toMatch(/^[A-Z\s,]+$/);
    }
  });

  it("keeps distinct labels so different concepts are never confused", () => {
    const labels = Object.values(STATUS).map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("escalates waiting states to needs-you only for the viewer who must act", () => {
    expect(resolveStyle("proposed")).toBe("waiting");
    expect(resolveStyle("proposed", true)).toBe("needs-you");
    expect(resolveStyle("paid", true)).toBe("settled"); // settled never escalates
    expect(resolveStyle("disputed", true)).toBe("contested");
  });
});

describe("spoken money (design system §9.6)", () => {
  it("reads the full amount", () => {
    expect(spokenMoney(money(125000050n, "NGN"))).toBe("1,250,000 naira and 50 kobo");
    expect(spokenMoney(money(-5n, "NGN"))).toBe("minus 0 naira and 5 kobo");
  });
});
