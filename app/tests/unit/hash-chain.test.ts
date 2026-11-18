import { describe, expect, it } from "vitest";
import { canonicalJson, chainHash, findBrokenLink, GENESIS_HASH } from "@/domain/hash-chain";

describe("hash chain (FR-HIS-03)", () => {
  it("canonical JSON is key-order independent and handles bigint/Date", () => {
    const a = canonicalJson({ b: 1, a: { d: 2n, c: new Date("2026-01-01T00:00:00Z") } });
    const b = canonicalJson({ a: { c: new Date("2026-01-01T00:00:00Z"), d: 2n }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":"2026-01-01T00:00:00.000Z","d":"2"},"b":1}');
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalJson({ x: Number.NaN })).toThrow(TypeError);
  });

  function build(payloads: unknown[]) {
    let prev = GENESIS_HASH;
    return payloads.map((payload) => {
      const hash = chainHash(prev, payload);
      const link = { prevHash: prev, hash, payload };
      prev = hash;
      return link;
    });
  }

  it("verifies an intact chain", () => {
    expect(findBrokenLink(build([{ n: 1 }, { n: 2 }, { n: 3 }]))).toBe(-1);
  });

  it("detects a modified payload", () => {
    const chain = build([{ n: 1 }, { n: 2 }, { n: 3 }]);
    chain[1]!.payload = { n: 99 };
    expect(findBrokenLink(chain)).toBe(1);
  });

  it("detects a removed link", () => {
    const chain = build([{ n: 1 }, { n: 2 }, { n: 3 }]);
    chain.splice(1, 1);
    expect(findBrokenLink(chain)).toBe(1);
  });
});
