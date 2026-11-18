import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, desc, eq } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { createUser } from "../helpers/users";
import { createAuth, type Auth } from "@/server/auth/auth";
import type { Database } from "@/server/db/client";
import { outbox, securityAuditLog, workspaceInvitations, workspaceMembers, workspaces } from "@/server/db/schema";
import type { Actor } from "@/server/lib/actor";
import { AppError } from "@/server/lib/errors";
import { hashToken, newId } from "@/server/lib/ids";
import {
  acceptInvitation,
  changeMemberRole,
  createWorkspace,
  getWorkspaceOverview,
  INVITATION_TTL_MS,
  inviteMember,
  listWorkspacesForUser,
  previewInvitation,
  removeMember,
  revokeInvitation,
  transferOwnership,
} from "@/server/modules/workspaces/service";
import { canInWorkspace, WORKSPACE_ACTIONS } from "@/server/policy/workspace-policy";

let db: Database;
let auth: Auth;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  auth = createAuth(db);
});
afterAll(async () => close());

async function expectCode(p: Promise<unknown>, code: AppError["code"]) {
  const err = await p.then(() => null, (e: unknown) => e);
  expect(err, `expected ${code}`).toBeInstanceOf(AppError);
  expect((err as AppError).code).toBe(code);
  return err as AppError;
}

/** Extracts the invitation token from the most recent email queued to `to`. */
async function lastInviteToken(to: string): Promise<string> {
  const rows = await db.select().from(outbox).orderBy(desc(outbox.createdAt));
  const mail = rows.find((r) => (r.payload as { to: string; subject: string }).to === to && String((r.payload as { subject: string }).subject).includes("invited"));
  const m = /\/invite\/([A-Za-z0-9_-]+)/.exec(String((mail!.payload as { text: string }).text));
  return m![1]!;
}

async function proWorkspace(owner: Actor, name: string) {
  const { id } = await createWorkspace(db, owner, { name, type: "business", contactEmail: owner.email });
  await db.update(workspaces).set({ plan: "pro" }).where(eq(workspaces.id, id));
  return id;
}

describe("workspace policy matrix (PRD §17, FR-WS-03/04)", () => {
  const expected: Record<string, string[]> = {
    "workspace.view": ["owner", "admin", "member"],
    "workspace.update": ["owner", "admin"],
    "workspace.invite": ["owner", "admin"],
    "workspace.revoke_invitation": ["owner", "admin"],
    "workspace.change_role": ["owner", "admin"],
    "workspace.remove_member": ["owner", "admin"],
    "workspace.transfer_ownership": ["owner"],
  };
  for (const action of WORKSPACE_ACTIONS) {
    for (const role of ["owner", "admin", "member", null] as const) {
      const allowed = role !== null && expected[action]!.includes(role);
      it(`${role ?? "non-member"} ${allowed ? "can" : "cannot"} ${action}`, () => {
        expect(canInWorkspace(role, action)).toBe(allowed);
      });
    }
  }
});

describe("creating workspaces (FR-WS-01/02)", () => {
  it("refuses unverified users (FR-ID-02)", async () => {
    const u = await createUser(db, auth, "Unverified", "unverified@example.com", false);
    await expectCode(createWorkspace(db, u, { name: "X", type: "business", contactEmail: "x@example.com" }), "FORBIDDEN");
  });

  it("makes the creator the owner, records an audit entry and lists the workspace", async () => {
    const ada = await createUser(db, auth, "Ada", "ada@studio.ng");
    const { id } = await createWorkspace(db, ada, { name: "Ada Studio", type: "business", contactEmail: "Hello@Studio.ng" });
    const [m] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, id));
    expect(m!.role).toBe("owner");
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    expect(ws!.contactEmail).toBe("hello@studio.ng");
    expect(ws!.plan).toBe("free");
    const audit = await db.select().from(securityAuditLog).where(eq(securityAuditLog.type, "workspace.created"));
    expect(audit.some((a) => a.actorUserId === ada.userId)).toBe(true);
    expect((await listWorkspacesForUser(db, ada.userId)).map((w) => w.name)).toContain("Ada Studio");
  });

  it("validates input", async () => {
    const u = await createUser(db, auth, "Val", "val@example.com");
    const err = await expectCode(createWorkspace(db, u, { name: " ", type: "business", contactEmail: "not-an-email" }), "VALIDATION");
    expect(Object.keys((err.details as { fields: object }).fields)).toEqual(expect.arrayContaining(["name", "contactEmail"]));
  });

  it("hides workspaces from non-members (NOT_FOUND, not FORBIDDEN)", async () => {
    const a = await createUser(db, auth, "A", "a-hide@example.com");
    const b = await createUser(db, auth, "B", "b-hide@example.com");
    const { id } = await createWorkspace(db, a, { name: "Private", type: "individual", contactEmail: a.email });
    await expectCode(getWorkspaceOverview(db, b, id), "NOT_FOUND");
  });
});

describe("invitations (FR-WS-03, SEC-06)", () => {
  it("enforces the free plan seat limit (FR-WS-07)", async () => {
    const owner = await createUser(db, auth, "Free Owner", "free-owner@example.com");
    const { id } = await createWorkspace(db, owner, { name: "Free WS", type: "business", contactEmail: owner.email });
    const err = await expectCode(inviteMember(db, owner, { workspaceId: id, email: "x@example.com", role: "member" }), "CONFLICT");
    expect(err.details).toEqual({ reason: "seat_limit" });
  });

  it("stores only a hash of the token, emails the link, and lets the invitee join once", async () => {
    const owner = await createUser(db, auth, "Owner One", "owner1@example.com");
    const wsId = await proWorkspace(owner, "Pro One");
    await inviteMember(db, owner, { workspaceId: wsId, email: "Tunde@Example.com", role: "member" });
    const token = await lastInviteToken("tunde@example.com");
    const [inv] = await db.select().from(workspaceInvitations).where(eq(workspaceInvitations.workspaceId, wsId));
    expect(inv!.tokenHash).toBe(hashToken(token));
    expect(inv!.tokenHash).not.toContain(token);

    expect((await previewInvitation(db, token)).status).toBe("valid");
    const tunde = await createUser(db, auth, "Tunde", "tunde@example.com");
    await acceptInvitation(db, tunde, token);
    const overview = await getWorkspaceOverview(db, owner, wsId);
    expect(overview.members.find((m) => m.email === "tunde@example.com")?.role).toBe("member");
    await expectCode(acceptInvitation(db, tunde, token), "CONFLICT"); // single use
    expect((await previewInvitation(db, token)).status).toBe("used");
  });

  it("rejects acceptance by a different email address", async () => {
    const owner = await createUser(db, auth, "Owner Two", "owner2@example.com");
    const wsId = await proWorkspace(owner, "Pro Two");
    await inviteMember(db, owner, { workspaceId: wsId, email: "intended@example.com", role: "member" });
    const token = await lastInviteToken("intended@example.com");
    const intruder = await createUser(db, auth, "Intruder", "intruder@example.com");
    await expectCode(acceptInvitation(db, intruder, token), "FORBIDDEN");
  });

  it("rejects expired and revoked invitations, and invalid tokens", async () => {
    const owner = await createUser(db, auth, "Owner Three", "owner3@example.com");
    const wsId = await proWorkspace(owner, "Pro Three");
    const past = new Date(Date.now() - INVITATION_TTL_MS - 60_000);
    await inviteMember(db, owner, { workspaceId: wsId, email: "late@example.com", role: "member" }, past);
    const lateToken = await lastInviteToken("late@example.com");
    const late = await createUser(db, auth, "Late", "late@example.com");
    expect((await previewInvitation(db, lateToken)).status).toBe("expired");
    await expectCode(acceptInvitation(db, late, lateToken), "CONFLICT");

    const { invitationId } = await inviteMember(db, owner, { workspaceId: wsId, email: "revoked@example.com", role: "member" });
    const revokedToken = await lastInviteToken("revoked@example.com");
    await revokeInvitation(db, owner, wsId, invitationId);
    const r = await createUser(db, auth, "Rev", "revoked@example.com");
    await expectCode(acceptInvitation(db, r, revokedToken), "CONFLICT");

    expect((await previewInvitation(db, "not-a-real-token")).status).toBe("invalid");
    await expectCode(acceptInvitation(db, r, "not-a-real-token"), "NOT_FOUND");
  });

  it("blocks duplicate pending invitations and inviting existing members", async () => {
    const owner = await createUser(db, auth, "Owner Four", "owner4@example.com");
    const wsId = await proWorkspace(owner, "Pro Four");
    await inviteMember(db, owner, { workspaceId: wsId, email: "dup@example.com", role: "member" });
    await expectCode(inviteMember(db, owner, { workspaceId: wsId, email: "DUP@example.com", role: "admin" }), "CONFLICT");
    await expectCode(inviteMember(db, owner, { workspaceId: wsId, email: owner.email, role: "member" }), "CONFLICT");
  });

  it("does not let members invite (FORBIDDEN) and counts pending invitations against seats", async () => {
    const owner = await createUser(db, auth, "Owner Five", "owner5@example.com");
    const wsId = await proWorkspace(owner, "Pro Five"); // 3 seats
    await inviteMember(db, owner, { workspaceId: wsId, email: "m5@example.com", role: "member" });
    const m5 = await createUser(db, auth, "M5", "m5@example.com");
    await acceptInvitation(db, m5, await lastInviteToken("m5@example.com"));
    await expectCode(inviteMember(db, m5, { workspaceId: wsId, email: "z@example.com", role: "member" }), "FORBIDDEN");
    await inviteMember(db, owner, { workspaceId: wsId, email: "p5@example.com", role: "member" }); // seat 3 (pending)
    const err = await expectCode(inviteMember(db, owner, { workspaceId: wsId, email: "q5@example.com", role: "member" }), "CONFLICT");
    expect(err.details).toEqual({ reason: "seat_limit" });
  });
});

describe("roles, removal and ownership (FR-WS-04/06)", () => {
  async function teamOf3() {
    const owner = await createUser(db, auth, "Owner", `own-${newId()}@example.com`);
    const wsId = await proWorkspace(owner, `Team ${newId()}`);
    const join = async (label: string, role: "admin" | "member") => {
      const email = `${label}-${newId()}@example.com`;
      await inviteMember(db, owner, { workspaceId: wsId, email, role });
      const a = await createUser(db, auth, label, email);
      await acceptInvitation(db, a, await lastInviteToken(email));
      return a;
    };
    return { owner, wsId, admin: await join("admin", "admin"), member: await join("member", "member") };
  }

  it("admins change roles of non-owners; members cannot; nobody can change the owner by role", async () => {
    const { owner, wsId, admin, member } = await teamOf3();
    await changeMemberRole(db, admin, { workspaceId: wsId, memberUserId: member.userId, role: "admin" });
    await expectCode(changeMemberRole(db, admin, { workspaceId: wsId, memberUserId: owner.userId, role: "member" }), "CONFLICT");
    await changeMemberRole(db, owner, { workspaceId: wsId, memberUserId: member.userId, role: "member" });
    await expectCode(changeMemberRole(db, member, { workspaceId: wsId, memberUserId: admin.userId, role: "member" }), "FORBIDDEN");
  });

  it("the owner cannot leave or be removed; members can leave; admins can remove members", async () => {
    const { owner, wsId, admin, member } = await teamOf3();
    await expectCode(removeMember(db, owner, { workspaceId: wsId, memberUserId: owner.userId }), "CONFLICT");
    await expectCode(removeMember(db, admin, { workspaceId: wsId, memberUserId: owner.userId }), "CONFLICT");
    await expectCode(removeMember(db, member, { workspaceId: wsId, memberUserId: admin.userId }), "FORBIDDEN");
    await removeMember(db, member, { workspaceId: wsId, memberUserId: member.userId }); // leave
    expect((await getWorkspaceOverview(db, owner, wsId)).members).toHaveLength(2);
    await removeMember(db, owner, { workspaceId: wsId, memberUserId: admin.userId });
    await expectCode(getWorkspaceOverview(db, admin, wsId), "NOT_FOUND");
  });

  it("transfers ownership atomically, leaving exactly one owner", async () => {
    const { owner, wsId, admin, member } = await teamOf3();
    await expectCode(transferOwnership(db, admin, { workspaceId: wsId, newOwnerUserId: admin.userId }), "FORBIDDEN");
    await transferOwnership(db, owner, { workspaceId: wsId, newOwnerUserId: member.userId });
    const roles = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, wsId));
    expect(roles.filter((r) => r.role === "owner").map((r) => r.userId)).toEqual([member.userId]);
    expect(roles.find((r) => r.userId === owner.userId)?.role).toBe("admin");
  });

  it("the database itself refuses a second owner", async () => {
    const { wsId, admin } = await teamOf3();
    const err = await db
      .update(workspaceMembers)
      .set({ role: "owner" })
      .where(and(eq(workspaceMembers.workspaceId, wsId), eq(workspaceMembers.userId, admin.userId)))
      .then(() => null, (e: Error & { cause?: Error }) => e);
    expect(err).not.toBeNull();
    expect(`${err!.message} ${err!.cause?.message ?? ""}`).toMatch(/one_owner|duplicate key/);
  });
});

describe("password reset (FR-ID-04)", () => {
  it("issues a reset link by email; the new password works and the old one does not", async () => {
    await createUser(db, auth, "Reset Me", "reset@example.com");
    await auth.api.requestPasswordReset({ body: { email: "reset@example.com", redirectTo: "/reset-password" } });
    const rows = await db.select().from(outbox).orderBy(desc(outbox.createdAt));
    const mail = rows.find((r) => (r.payload as { to: string; subject: string }).to === "reset@example.com" && (r.payload as { subject: string }).subject.includes("Reset"));
    expect(mail).toBeDefined();
    const token = /reset-password\/([^?\s]+)/.exec((mail!.payload as { text: string }).text)?.[1];
    expect(token).toBeTruthy();
    await auth.api.resetPassword({ body: { token: token!, newPassword: "brand-new-password-42" } });
    await expect(auth.api.signInEmail({ body: { email: "reset@example.com", password: "a-strong-test-password" } })).rejects.toThrow();
    const ok = await auth.api.signInEmail({ body: { email: "reset@example.com", password: "brand-new-password-42" } });
    expect(ok.user.email).toBe("reset@example.com");
  });

  it("does not reveal whether an email is registered", async () => {
    await expect(auth.api.requestPasswordReset({ body: { email: "nobody@example.com", redirectTo: "/reset-password" } })).resolves.toBeDefined();
  });
});
