import { sql } from "drizzle-orm";
import { bigint, boolean, date, index, integer, jsonb, numeric, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { workspaces } from "./workspaces";

/** FR-ENG-01..08. Status per PRD §18. Financial figures are never stored (PRD §22). */
export const engagements = pgTable(
  "engagements",
  {
    id: uuid("id").primaryKey(),
    initiatorWorkspaceId: uuid("initiator_workspace_id").notNull().references(() => workspaces.id),
    title: text("title").notNull(),
    description: text("description"),
    currency: text("currency").notNull().default("NGN"),
    status: text("status").notNull().default("draft"), // draft | awaiting_confirmation | active | stopped | closed_agreed | closed_open_items | withdrawn
    currentVersion: integer("current_version").notNull().default(0),
    responseWindows: jsonb("response_windows").$type<ResponseWindows>().notNull(),
    createdBy: text("created_by").notNull().references(() => user.id),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("engagements_workspace_idx").on(t.initiatorWorkspaceId, t.status)],
);

export interface ResponseWindows {
  baseline: number;
  changes: number;
  deliveries: number;
  paymentConfirmations: number;
}

/** Exactly one payer and one payee per engagement (D-40). */
export const engagementParties = pgTable(
  "engagement_parties",
  {
    id: uuid("id").primaryKey(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    side: text("side").notNull(), // 'payer' | 'payee'
    isInitiator: boolean("is_initiator").notNull(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id),
    orgName: text("org_name").notNull(),
    repName: text("rep_name"),
    repEmail: text("rep_email"),
  },
  (t) => [uniqueIndex("engagement_parties_side_uq").on(t.engagementId, t.side)],
);

/** People acting for a party (FR-ENG-06). Initiator-side workspace members are resolved via the workspace. */
export const partyMembers = pgTable(
  "party_members",
  {
    id: uuid("id").primaryKey(),
    partyId: uuid("party_id").notNull().references(() => engagementParties.id),
    userId: text("user_id").notNull().references(() => user.id),
    authority: text("authority").notNull(), // 'approver' | 'contributor'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("party_members_party_user_uq").on(t.partyId, t.userId), index("party_members_user_idx").on(t.userId)],
);

/**
 * Access link for the counterparty (FR-ID-05). Bound to one email; every use requires a fresh email
 * code, so the link alone never grants access. Revocable.
 */
export const engagementInvitations = pgTable("engagement_invitations", {
  id: uuid("id").primaryKey(),
  engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
  partyId: uuid("party_id").notNull().references(() => engagementParties.id),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  firstAcceptedAt: timestamp("first_accepted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

/** Commitment identity (FR-COM-01). Field values live in revisions (append-only once confirmed). */
export const commitments = pgTable(
  "commitments",
  {
    id: uuid("id").primaryKey(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    kind: text("kind").notNull(), // deliverable | party_obligation | payment_obligation
    owedBySide: text("owed_by_side").notNull(), // payer | payee
    position: integer("position").notNull(),
    removedInVersion: integer("removed_in_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("commitments_engagement_idx").on(t.engagementId)],
);

/**
 * Commitment field values. Draft revisions have version_from = 0 and are edited in place (nothing is
 * agreed yet; every submission is snapshotted). On confirmation they become version 1, and from then
 * on revisions are only ever added (Slice 3 changes).
 */
export const commitmentRevisions = pgTable(
  "commitment_revisions",
  {
    id: uuid("id").primaryKey(),
    commitmentId: uuid("commitment_id").notNull().references(() => commitments.id),
    versionFrom: integer("version_from").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    quantity: numeric("quantity", { precision: 14, scale: 3 }),
    unit: text("unit"),
    definitionOfDone: text("definition_of_done"),
    dueDate: date("due_date"),
    exclusions: text("exclusions"),
    priceMinor: bigint("price_minor", { mode: "bigint" }),
    trigger: text("trigger"), // payment obligations: on_confirmation | on_date | on_acceptance | on_request
    triggerDate: date("trigger_date"),
    termsDays: integer("terms_days"),
    linkedCommitmentId: uuid("linked_commitment_id"),
    proRata: boolean("pro_rata").notNull().default(true),
    createdByChangeId: uuid("created_by_change_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("commitment_revisions_version_uq").on(t.commitmentId, t.versionFrom)],
);

/** Each submission of the baseline for confirmation (FR-BAS-01..03). Snapshot = exactly what was shown. */
export const baselineSubmissions = pgTable(
  "baseline_submissions",
  {
    id: uuid("id").primaryKey(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    seq: integer("seq").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    status: text("status").notNull(), // open | confirmed | changes_requested | declined | withdrawn
    submittedBy: text("submitted_by").notNull().references(() => user.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
    respondBy: timestamp("respond_by", { withTimezone: true }).notNull(),
    respondedBy: text("responded_by").references(() => user.id),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    comment: text("comment"),
  },
  (t) => [
    uniqueIndex("baseline_submissions_seq_uq").on(t.engagementId, t.seq),
    uniqueIndex("baseline_submissions_one_open_uq").on(t.engagementId).where(sql`${t.status} = 'open'`),
  ],
);

export const engagementVersions = pgTable(
  "engagement_versions",
  {
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    version: integer("version").notNull(),
    cause: text("cause").notNull(), // baseline | change | valuation
    changeId: uuid("change_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.engagementId, t.version] })],
);
