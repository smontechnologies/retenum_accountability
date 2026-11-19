"use server";

import { secureCookies } from "@/server/lib/env";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { errorToFormState, type FormState } from "@/server/lib/form-state";
import { kickOutbox } from "@/server/outbox/kick";
import { WORKSPACE_COOKIE } from "@/server/modules/workspaces/current";
import {
  acceptInvitation,
  changeMemberRole,
  createWorkspace,
  inviteMember,
  removeMember,
  revokeInvitation,
  transferOwnership,
} from "@/server/modules/workspaces/service";

const str = (d: FormData, k: string) => String(d.get(k) ?? "");

async function selectWorkspace(id: string) {
  (await cookies()).set(WORKSPACE_COOKIE, id, { path: "/", sameSite: "lax", httpOnly: true, secure: secureCookies(), maxAge: 60 * 60 * 24 * 400 });
}

export async function createWorkspaceAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  let id: string;
  try {
    ({ id } = await createWorkspace(getDb(), actor, {
      name: str(data, "name"),
      type: str(data, "type") as "business" | "individual",
      registrationNumber: str(data, "registrationNumber"),
      address: str(data, "address"),
      contactEmail: str(data, "contactEmail"),
    }));
  } catch (err) {
    return errorToFormState(err);
  }
  await selectWorkspace(id);
  // Onboarding continues to the Overview, where the next step is the first engagement (FR-ONB-02).
  redirect(str(data, "next") === "onboarding" ? "/app?welcome=1" : "/app/business?created=1");
}

export async function inviteMemberAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const workspaceId = str(data, "workspaceId");
  try {
    await inviteMember(getDb(), actor, { workspaceId, email: str(data, "email"), role: str(data, "role") as "admin" | "member" });
  } catch (err) {
    return errorToFormState(err);
  }
  kickOutbox();
  revalidatePath("/app/business");
  return { status: "success", message: "Invitation sent. It expires in 7 days." };
}

const DONE: Record<string, string> = {
  "make-admin": "Role changed to admin.",
  "make-member": "Role changed to member.",
  remove: "Member removed.",
  transfer: "Ownership transferred.",
  revoke: "Invitation withdrawn.",
};

/** Per-row team mutations (each behind a confirmation dialog in the UI). */
export async function memberAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const workspaceId = str(data, "workspaceId");
  const op = str(data, "op");
  const target = str(data, "target");
  try {
    if (op === "make-admin" || op === "make-member") {
      await changeMemberRole(getDb(), actor, { workspaceId, memberUserId: target, role: op === "make-admin" ? "admin" : "member" });
    } else if (op === "remove") {
      await removeMember(getDb(), actor, { workspaceId, memberUserId: target });
    } else if (op === "transfer") {
      await transferOwnership(getDb(), actor, { workspaceId, newOwnerUserId: target });
    } else if (op === "revoke") {
      await revokeInvitation(getDb(), actor, workspaceId, target);
    } else {
      return { status: "error", message: "Unknown action." };
    }
  } catch (err) {
    return errorToFormState(err);
  }
  if (op === "remove" && target === actor.userId) {
    (await cookies()).delete(WORKSPACE_COOKIE);
    redirect("/app");
  }
  revalidatePath("/app/business");
  return { status: "success", message: DONE[op] };
}

export async function acceptInvitationAction(_: FormState, data: FormData): Promise<FormState> {
  const token = str(data, "token");
  const actor = await requireActor(`/invite/${token}`);
  let workspaceId: string;
  try {
    ({ workspaceId } = await acceptInvitation(getDb(), actor, token));
  } catch (err) {
    return errorToFormState(err);
  }
  await selectWorkspace(workspaceId);
  redirect("/app/business");
}
