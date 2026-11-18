import { describe, expect, it } from "vitest";
import { add, formatMoney, money, parseAmount, proRata, subtract, sum, maxZero } from "@/domain/money";

describe("money (FR-FIN-06)", () => {
  it("adds and subtracts in minor units without float error", () => {
    expect(add(money(10n, "NGN"), money(20n, "NGN")).amountMinor).toBe(30n);
    expect(subtract(money(10n, "NGN"), money(25n, "NGN")).amountMinor).toBe(-15n);
    expect(sum([money(1n, "NGN"), money(2n, "NGN"), money(3n, "NGN")], "NGN").amountMinor).toBe(6n);
  });

  it("refuses to mix currencies", () => {
    expect(() => add(money(1n, "NGN"), money(1n, "USD"))).toThrow(/Currency mismatch/);
  });

  it("refuses non-bigint amounts", () => {
    // @ts-expect-error deliberate misuse
    expect(() => money(1.5, "NGN")).toThrow(TypeError);
  });

  it("maxZero floors negatives", () => {
    expect(maxZero(money(-5n, "NGN")).amountMinor).toBe(0n);
    expect(maxZero(money(5n, "NGN")).amountMinor).toBe(5n);
  });

  it("parses user input into kobo", () => {
    expect(parseAmount("1,250.50", "NGN")).toBe(125050n);
    expect(parseAmount("600000", "NGN")).toBe(60000000n);
    expect(parseAmount("0.5", "NGN")).toBe(50n);
    expect(parseAmount("-3", "NGN", { allowNegative: true })).toBe(-300n);
  });

  it("rejects malformed or over-precise input", () => {
    for (const bad of ["", "abc", "1.234", "1.2.3", "₦100", "-3", "1e5"]) {
      expect(() => parseAmount(bad, "NGN")).toThrow(RangeError);
    }
  });

  it("formats for display", () => {
    expect(formatMoney(money(125050n, "NGN"))).toBe("₦1,250.50");
    expect(formatMoney(money(-5n, "NGN"))).toBe("-₦0.05");
  });

  describe("proRata (PRD §21 A-2)", () => {
    it("matches AC-DEL-1: ₦300,000 obligation, ₦400,000 of ₦600,000 accepted → ₦200,000", () => {
      expect(proRata(30_000_000n, 40_000_000n, 60_000_000n)).toBe(20_000_000n);
    });
    it("rounds down to the minor unit", () => {
      expect(proRata(100n, 1n, 3n)).toBe(33n);
    });
    it("never exceeds the total, even if part > whole", () => {
      expect(proRata(100n, 5n, 3n)).toBe(100n);
    });
    it("rejects invalid inputs", () => {
      expect(() => proRata(100n, 1n, 0n)).toThrow(RangeError);
      expect(() => proRata(100n, -1n, 3n)).toThrow(RangeError);
    });
  });
});
