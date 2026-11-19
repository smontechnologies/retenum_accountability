import { and, count, eq, gt, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import type { Database } from "../../db/client";
import { user, workspaceInvitations, workspaceMembers, workspaces } from "../../db/schema";
import type { Actor } from "../../lib/actor";
import { auditSecurity } from "../../lib/audit";
import { env } from "../../lib/env";
import { AppError, conflict, forbidden, notFound, validationError } from "../../lib/errors";
import { hashToken, newId, newSecretToken } from "../../lib/ids";
import { enqueueEmail } from "../../outbox/outbox";
import { canInWorkspace, type WorkspaceAction, type WorkspaceRole } from "../../policy/workspace-policy";
import { isPlan, PLAN_LIMITS } from "./plans";
import {
  ChangeRoleInput,
  CreateWorkspaceInput,
  InviteMemberInput,
  MemberRefInput,
  TransferOwnershipInput,
} from "./validation";

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // FR-WS-03
export const MAX_INVITATIONS_PER_HOUR = 20; // SEC-05

function parse<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw validationError("Some details need fixing.", {
      fields: Object.fromEntries(result.error.issues.map((i) => [i.path.join("."), i.message])),
    });
  }
  return result.data;
}

function requireVerified(actor: Actor) {
  if (!actor.emailVerified) throw forbidden("Please verify your email address first.");
}

export async function getMembershipRole(db: Database, workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
  const [row] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);
  return (row?.role as WorkspaceRole | undefined) ?? null;
}

/** Loads the workspace and checks the actor may perform `action` in it. Non-members get NOT_FOUND. */
async function authorise(db: Database, actor: Actor, workspaceId: string, action: WorkspaceAction) {
  requireVerified(actor);
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const role = ws ? await getMembershipRole(db, workspaceId, actor.userId) : null;
  if (!ws || !role) throw notFound("Workspace not found.");
  if (!canInWorkspace(role, action)) throw forbidden();
  if (ws.suspendedAt && action !== "workspace.view") throw forbidden("This workspace is suspended.");
  return { ws, role };
}

// ---------------------------------------------------------------------------------------------

export async function createWorkspace(db: Database, actor: Actor, input: CreateWorkspaceInput) {
  requireVerified(actor);
  const data = parse(CreateWorkspaceInput, input);
  const id = newId();
  await db.transaction(async (txRaw) => {
    const tx = txRaw as unknown as Database;
    await tx.insert(workspaces).values({ id, ...data, createdBy: actor.userId });
    await tx.insert(workspaceMembers).values({ id: newId(), workspaceId: id, userId: actor.userId, role: "owner" });
    await auditSecurity(tx, "workspace.created", actor.userId, { workspaceId: id });
  });
  return { id };
}

export async function listWorkspacesForUser(db: Database, userId: string) {
  return db
    .select({ id: workspaces.id, name: workspaces.name, type: workspaces.type, role: workspaceMembers.role, plan: workspaces.plan })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(workspaces.name);
}

export async function getWorkspaceOverview(db: Database, actor: Actor, workspaceId: string, now = new Date()) {
  const { ws, role } = await authorise(db, actor, workspaceId, "workspace.view");
  const members = await db
    .select({ userId: user.id, name: user.name, email: user.email, role: workspaceMembers.role, joinedAt: workspaceMembers.createdAt })
    .from(workspaceMembers)
    .innerJoin(user, eq(user.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(workspaceMembers.createdAt);
  const invitations = canInWorkspace(role, "workspace.invite")
    ? await db
        .select({ id: workspaceInvitations.id, email: workspaceInvitations.email, role: workspaceInvitations.role, expiresAt: workspaceInvitations.expiresAt })
        .from(workspaceInvitations)
        .where(pendingInvitationsWhere(workspaceId, now))
    : [];
  const plan = isPlan(ws.plan) ? ws.plan : "free";
  return { workspace: ws, myRole: role, members, invitations, limits: PLAN_LIMITS[plan] };
}

function pendingInvitationsWhere(workspaceId: string, now: Date) {
  return and(
    eq(workspaceInvitations.workspaceId, workspaceId),
    isNull(workspaceInvitations.acceptedAt),
    isNull(workspaceInvitations.revokedAt),
    gt(workspaceInvitations.expiresAt, now),
  );
}

export async function inviteMember(db: Database, actor: Actor, input: z.input<typeof InviteMemberInput>, now = new Date()) {
  const data = parse(InviteMemberInput, input);
  const { ws } = await authorise(db, actor, data.workspaceId, "workspace.invite");

  return db.transaction(async (txRaw) => {
    const tx = txRaw as unknown as Database;
    // Serialise invitations per workspace so seat checks cannot race.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"ws-invite:" + ws.id}))`);

    const [existingMember] = await tx
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .innerJoin(user, eq(user.id, workspaceMembers.userId))
      .where(and(eq(workspaceMembers.workspaceId, ws.id), sql`lower(${user.email}) = ${data.email}`))
      .limit(1);
    if (existingMember) throw conflict("That person is already a member of this workspace.");

    const pending = await tx.select().from(workspaceInvitations).where(pendingInvitationsWhere(ws.id, now));
    if (pending.some((p) => p.email === data.email)) throw conflict("An invitation is already pending for that email.");

    const [{ value: memberCount } = { value: 0 }] = await tx
      .select({ value: count() })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, ws.id));
    const plan = isPlan(ws.plan) ? ws.plan : "free";
    if (memberCount + pending.length >= PLAN_LIMITS[plan].seats) {
      throw new AppError("CONFLICT", `Your ${plan} plan allows ${PLAN_LIMITS[plan].seats} seat(s). Upgrade to invite more people.`, {
        reason: "seat_limit",
      });
    }

    const [{ value: recent } = { value: 0 }] = await tx
      .select({ value: count() })
      .from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.workspaceId, ws.id), gt(workspaceInvitations.createdAt, new Date(now.getTime() - 3_600_000))));
    if (recent >= MAX_INVITATIONS_PER_HOUR) throw conflict("Too many invitations sent recently. Please try again later.");

    const { token, hash } = newSecretToken();
    const invitationId = newId();
    await tx.insert(workspaceInvitations).values({
      id: invitationId,
      workspaceId: ws.id,
      email: data.email,
      role: data.role,
      tokenHash: hash,
      invitedBy: actor.userId,
      expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
      createdAt: now,
    });
    const inviteUrl = `${env().APP_URL}/invite/${token}`;
    await enqueueEmail(tx, {
      to: data.email,
      subject: `You've been invited to ${ws.name} on Retenum`,
      text: `You have been invited to join ${ws.name} on Retenum as ${data.role}.\n\nAccept within 7 days: ${inviteUrl}\n\nIf you were not expecting this, you can ignore this email.`,
    });
    await auditSecurity(tx, "workspace.invitation_created", actor.userId, { workspaceId: ws.id, invitationId, role: data.role });
    return { invitationId };
  });
}

/** Public preview for the invitation page. Reveals only what the invitee needs. */
export async function previewInvitation(db: Database, token: string, now = new Date()) {
  const [inv] = await db
    .select({ inv: workspaceInvitations, wsName: workspaces.name })
    .from(workspaceInvitations)
    .innerJoin(workspaces, eq(workspaces.id, workspaceInvitations.workspaceId))
    .where(eq(workspaceInvitations.tokenHash, hashToken(token)))
    .limit(1);
  if (!inv) return { status: "invalid" as const };
  const i = inv.inv;
  if (i.revokedAt) return { status: "revoked" as const };
  if (i.acceptedAt) return { status: "used" as const };
  if (i.expiresAt <= now) return { status: "expired" as const };
  return { status: "valid" as const, workspaceName: inv.wsName, email: i.email, role: i.role };
}

export async function acceptInvitation(db: Database, actor: Actor, token: string, now = new Date()) {
  requireVerified(actor);
  return db.transaction(async (txRaw) => {
    const tx = txRaw as unknown as Database;
    const [inv] = await tx
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.tokenHash, hashToken(token)))
      .for("update")
      .limit(1);
    if (!inv) throw notFound("This invitation link is not valid.");
    if (inv.revokedAt) throw conflict("This invitation has been withdrawn.");
    if (inv.acceptedAt) throw conflict("This invitation has already been used.");
    if (inv.expiresAt <= now) throw conflict("This invitation has expired. Ask for a new one.");
    if (inv.email !== actor.email.trim().toLowerCase()) {
      throw forbidden("This invitation was sent to a different email address. Sign in with that address to accept it.");
    }
    const already = await getMembershipRole(tx, inv.workspaceId, actor.userId);
    if (!already) {
      await tx.insert(workspaceMembers).values({ id: newId(), workspaceId: inv.workspaceId, userId: actor.userId, role: inv.role });
    }
    await tx
      .update(workspaceInvitations)
      .set({ acceptedAt: now, acceptedBy: actor.userId })
      .where(eq(workspaceInvitations.id, inv.id));
    await auditSecurity(tx, "workspace.invitation_accepted", actor.userId, { workspaceId: inv.workspaceId, invitationId: inv.id });
    return { workspaceId: inv.workspaceId };
  });
}

export async function revokeInvitation(db: Database, actor: Actor, workspaceId: string, invitationId: string, now = new Date()) {
  await authorise(db, actor, workspaceId, "workspace.revoke_invitation");
  const res = await db
    .update(workspaceInvitations)
    .set({ revokedAt: now })
    .where(and(eq(workspaceInvitations.id, invitationId), eq(workspaceInvitations.workspaceId, workspaceId), isNull(workspaceInvitations.acceptedAt), isNull(workspaceInvitations.revokedAt)))
    .returning({ id: workspaceInvitations.id });
  if (res.length === 0) throw notFound("Invitation not found or no longer pending.");
  await auditSecurity(db, "workspace.invitation_revoked", actor.userId, { workspaceId, invitationId });
}

export async function changeMemberRole(db: Database, actor: Actor, input: z.input<typeof ChangeRoleInput>) {
  const data = parse(ChangeRoleInput, input);
  await authorise(db, actor, data.workspaceId, "workspace.change_role");
  const target = await getMembershipRole(db, data.workspaceId, data.memberUserId);
  if (!target) throw notFound("Member not found.");
  if (target === "owner") throw conflict("The owner's role can only change by transferring ownership.");
  await db
    .update(workspaceMembers)
    .set({ role: data.role })
    .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, data.memberUserId)));
  await auditSecurity(db, "workspace.role_changed", actor.userId, { ...data, from: target });
}

/**
 * Remove a member, or leave (when memberUserId is the actor). FR-WS-04/06: the owner cannot be
 * removed or leave without transferring ownership; records the member authored are untouched.
 */
export async function removeMember(db: Database, actor: Actor, input: z.input<typeof MemberRefInput>) {
  const data = parse(MemberRefInput, input);
  const leaving = data.memberUserId === actor.userId;
  if (leaving) await authorise(db, actor, data.workspaceId, "workspace.view");
  else await authorise(db, actor, data.workspaceId, "workspace.remove_member");
  const target = await getMembershipRole(db, data.workspaceId, data.memberUserId);
  if (!target) throw notFound("Member not found.");
  if (target === "owner") throw conflict("Transfer ownership before the owner can leave or be removed.");
  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, data.memberUserId)));
  await auditSecurity(db, leaving ? "workspace.member_left" : "workspace.member_removed", actor.userId, data);
}

export async function transferOwnership(db: Database, actor: Actor, input: z.input<typeof TransferOwnershipInput>) {
  const data = parse(TransferOwnershipInput, input);
  await authorise(db, actor, data.workspaceId, "workspace.transfer_ownership");
  if (data.newOwnerUserId === actor.userId) throw validationError("You are already the owner.");
  const target = await getMembershipRole(db, data.workspaceId, data.newOwnerUserId);
  if (!target) throw notFound("The new owner must already be a member of this workspace.");
  await db.transaction(async (txRaw) => {
    const tx = txRaw as unknown as Database;
    // Demote first: the partial unique index allows only one owner at any moment.
    await tx
      .update(workspaceMembers)
      .set({ role: "admin" })
      .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, actor.userId)));
    await tx
      .update(workspaceMembers)
      .set({ role: "owner" })
      .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, data.newOwnerUserId)));
    await auditSecurity(tx, "workspace.ownership_transferred", actor.userId, data);
  });
}
