"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { errorToFormState, type FormState } from "@/server/lib/form-state";
import { kickOutbox } from "@/server/outbox/kick";
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
  redirect(`/app/w/${id}`);
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
  revalidatePath(`/app/w/${workspaceId}`);
  return { status: "success", message: "Invitation sent. It expires in 7 days." };
}

/** Small mutations used by per-row forms. */
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
  if (op === "remove" && target === actor.userId) redirect("/app");
  revalidatePath(`/app/w/${workspaceId}`);
  return { status: "success", message: "Done." };
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
  redirect(`/app/w/${workspaceId}`);
}
