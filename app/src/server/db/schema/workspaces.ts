import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** FR-WS-01/02: a business or individual workspace. `plan` drives limits (FR-WS-07, D-33). */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'business' | 'individual'
  registrationNumber: text("registration_number"),
  address: text("address"),
  contactEmail: text("contact_email").notNull(),
  plan: text("plan").notNull().default("free"), // 'free' | 'pro' | 'business'
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** FR-WS-03/04. Exactly one owner per workspace is enforced by a partial unique index. */
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
    userId: text("user_id").notNull().references(() => user.id),
    role: text("role").notNull(), // 'owner' | 'admin' | 'member'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("workspace_members_ws_user_uq").on(t.workspaceId, t.userId),
    uniqueIndex("workspace_members_one_owner_uq").on(t.workspaceId).where(sql`${t.role} = 'owner'`),
    index("workspace_members_user_idx").on(t.userId),
  ],
);

/** FR-WS-03. Token stored only as a SHA-256 hash (SEC-06). */
export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid("id").primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
    email: text("email").notNull(),
    role: text("role").notNull(), // 'admin' | 'member'
    tokenHash: text("token_hash").notNull().unique(),
    invitedBy: text("invited_by").notNull().references(() => user.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: text("accepted_by").references(() => user.id),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workspace_invitations_ws_idx").on(t.workspaceId, t.createdAt)],
);
