import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { commitments, engagements } from "./engagements";

/**
 * Engagement workflows (D-66, FR-WF-01): one trigger + ordered steps, Bubble-style. Draft rows have
 * version_from = 0 and are edited in place; on confirmation they become version 1 and are only ever
 * superseded through confirmed changes (Slice 3).
 */
export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    position: integer("position").notNull(),
    triggerType: text("trigger_type").notNull(),
    triggerParams: jsonb("trigger_params").$type<Record<string, unknown>>().notNull().default({}),
    onlyWhen: jsonb("only_when").$type<Record<string, unknown> | null>(),
    createdBySide: text("created_by_side").notNull(),
    versionFrom: integer("version_from").notNull().default(0),
    removedInVersion: integer("removed_in_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workflows_engagement_idx").on(t.engagementId, t.position)],
);

export const workflowSteps = pgTable(
  "workflow_steps",
  {
    id: uuid("id").primaryKey(),
    workflowId: uuid("workflow_id").notNull().references(() => workflows.id),
    position: integer("position").notNull(),
    actionType: text("action_type").notNull(),
    params: jsonb("params").$type<Record<string, unknown>>().notNull().default({}),
    onlyWhen: jsonb("only_when").$type<Record<string, unknown> | null>(),
    /** Commercial steps (deliverable, payment, party obligation) own a commitment read by the money layer. */
    commitmentId: uuid("commitment_id").references(() => commitments.id),
    versionFrom: integer("version_from").notNull().default(0),
    removedInVersion: integer("removed_in_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workflow_steps_workflow_idx").on(t.workflowId, t.position)],
);
