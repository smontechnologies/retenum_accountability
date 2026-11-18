/** Plan limits (FR-WS-07). Prices/limits are hypotheses (D-33); billing is not built in the MVP. */
export const PLAN_LIMITS = {
  free: { activeEngagements: 1, seats: 1 },
  pro: { activeEngagements: 10, seats: 3 },
  business: { activeEngagements: 40, seats: 10 },
} as const;
export type Plan = keyof typeof PLAN_LIMITS;
export const isPlan = (p: string): p is Plan => p in PLAN_LIMITS;
