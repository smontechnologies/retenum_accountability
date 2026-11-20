/**
 * Plan limits (FR-WS-07). Prices/limits are hypotheses (D-33); billing is not built in the MVP.
 * D-68 (founder, 20 Nov 2026): the free plan has unlimited engagements until a cap is decided.
 * The check in createDraft stays, so a cap returns by changing this one number.
 */
export const PLAN_LIMITS = {
  free: { activeEngagements: Number.POSITIVE_INFINITY, seats: 1 },
  pro: { activeEngagements: 10, seats: 3 },
  business: { activeEngagements: 40, seats: 10 },
} as const;
export type Plan = keyof typeof PLAN_LIMITS;
export const isPlan = (p: string): p is Plan => p in PLAN_LIMITS;
