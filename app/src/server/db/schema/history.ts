import { bigint, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Append-only engagement history (FR-HIS-01..03, TD-09). UPDATE/DELETE are rejected by a database
 * trigger (see migration 0001). engagement_id gains a foreign key when engagements exist (Slice 2).
 */
export const engagementEvents = pgTable(
  "engagement_events",
  {
    id: uuid("id").primaryKey(),
    engagementId: uuid("engagement_id").notNull(),
    seq: integer("seq").notNull(),
    type: text("type").notNull(),
    actorUserId: text("actor_user_id"),
    actorSide: text("actor_side"), // 'payer' | 'payee' | 'system' | null
    target: jsonb("target").$type<Record<string, unknown> | null>(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    prevHash: text("prev_hash").notNull(),
    hash: text("hash").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("engagement_events_seq_uq").on(t.engagementId, t.seq), index("engagement_events_type_idx").on(t.type)],
);

/** Security audit log (AUD-02). Append-only, no hash chain. */
export const securityAuditLog = pgTable(
  "security_audit_log",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    type: text("type").notNull(),
    actorUserId: text("actor_user_id"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("security_audit_log_type_idx").on(t.type, t.createdAt)],
);
