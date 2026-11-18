import { createHash } from "node:crypto";

/**
 * Tamper-evident hash chain for engagement events (FR-HIS-03, TD-09).
 * hash = sha256(prevHash + "\n" + canonicalJson(payload)). "Tamper-evident", not "tamper-proof" (D-47).
 */
export const GENESIS_HASH = "0".repeat(64);

/** Deterministic JSON: sorted object keys, bigint as decimal string, Dates as ISO, undefined dropped. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalise(value));
}

function normalise(value: unknown): unknown {
  if (value === null) return null;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((v) => (v === undefined ? null : normalise(v)));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as object).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = normalise(v);
    }
    return out;
  }
  if (typeof value === "number" && !Number.isFinite(value)) throw new TypeError("Non-finite number in event payload");
  return value;
}

export function chainHash(prevHash: string, payload: unknown): string {
  return createHash("sha256").update(prevHash).update("\n").update(canonicalJson(payload)).digest("hex");
}

export interface ChainLink {
  prevHash: string;
  hash: string;
  payload: unknown;
}

/** Returns the index of the first broken link, or -1 if the chain verifies. */
export function findBrokenLink(links: ChainLink[]): number {
  let expectedPrev = GENESIS_HASH;
  for (let i = 0; i < links.length; i++) {
    const link = links[i]!;
    if (link.prevHash !== expectedPrev) return i;
    if (chainHash(link.prevHash, link.payload) !== link.hash) return i;
    expectedPrev = link.hash;
  }
  return -1;
}
