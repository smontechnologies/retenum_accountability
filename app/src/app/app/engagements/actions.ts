"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db/client";
import { getSession, requireActor } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { errorToFormState, type FormState } from "@/server/lib/form-state";
import { kickOutbox } from "@/server/outbox/kick";
import {
  acceptEngagementInvitation,
  createDraft,
  previewEngagementInvitation,
  resendInvitation,
  respondToBaseline,
  submitForConfirmation,
  updateResponseWindows,
  withdrawEngagement,
} from "@/server/modules/engagements/service";
import {
  addStep,
  addWorkflow,
  moveStep,
  moveWorkflow,
  removeStep,
  removeWorkflow,
  setStepCondition,
  setWorkflowCondition,
  updateStep,
  updateWorkflowTrigger,
} from "@/server/modules/engagements/workflows";
import type { ActionType } from "@/domain/workflow";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";

const str = (d: FormData, k: string) => String(d.get(k) ?? "");
const fields = (d: FormData) => Object.fromEntries([...d.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")).map(([k, v]) => [k, String(v)]));
/**
 * Refresh the engagement header (a shared layout) and its pages. Per the Next.js docs, a layout on a
 * dynamic route is revalidated with the route pattern plus type "layout", not a literal URL.
 */
const refresh = (_id: string) => revalidatePath("/app/engagements/[id]", "layout");

/** AppError with a list of problems (e.g. not ready to send) becomes a readable message. */
function toState(err: unknown): FormState {
  if (err instanceof AppError && Array.isArray((err.details as { problems?: string[] })?.problems)) {
    return { status: "error", message: `${err.message} ${(err.details as { problems: string[] }).problems.join(" ")}` };
  }
  return errorToFormState(err);
}

export async function createDraftAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor("/app/engagements/new");
  const { current } = await getCurrentWorkspace(getDb(), actor);
  if (!current) return { status: "error", message: "Create a workspace for your business first." };
  let id: string;
  try {
    ({ id } = await createDraft(getDb(), actor, { ...fields(data), workspaceId: current.id } as never));
  } catch (err) {
    return toState(err);
  }
  redirect(`/app/engagements/${id}?created=1`);
}

// ----- Workflow editor (D-66) ---------------------------------------------------------------------

async function run(data: FormData, fn: (actor: Awaited<ReturnType<typeof requireActor>>, engagementId: string) => Promise<unknown>, message: string): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await fn(actor, engagementId);
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  return { status: "success", message };
}

export async function addWorkflowAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  let id: string;
  try {
    ({ id } = await addWorkflow(getDb(), actor, engagementId, fields(data)));
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  redirect(`/app/engagements/${engagementId}?w=${id}&s=trigger`);
}

export async function updateTriggerAction(_: FormState, data: FormData): Promise<FormState> {
  return run(data, (a, e) => updateWorkflowTrigger(getDb(), a, e, str(data, "workflowId"), fields(data)), "Trigger saved.");
}

export async function removeWorkflowAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await removeWorkflow(getDb(), actor, engagementId, str(data, "workflowId"));
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  redirect(`/app/engagements/${engagementId}`);
}

export async function addStepAction(_: FormState, data: FormData): Promise<FormState> {
  return run(data, (a, e) => addStep(getDb(), a, e, str(data, "workflowId"), str(data, "actionType") as ActionType, fields(data)), "Step added.");
}

export async function updateStepAction(_: FormState, data: FormData): Promise<FormState> {
  return run(data, (a, e) => updateStep(getDb(), a, e, str(data, "stepId"), fields(data)), "Step saved.");
}

export async function removeStepAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await removeStep(getDb(), actor, engagementId, str(data, "stepId"));
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  redirect(`/app/engagements/${engagementId}?w=${str(data, "workflowId")}`);
}

export async function setConditionAction(_: FormState, data: FormData): Promise<FormState> {
  const target = str(data, "target");
  return run(
    data,
    (a, e) => (target === "workflow" ? setWorkflowCondition(getDb(), a, e, str(data, "workflowId"), fields(data)) : setStepCondition(getDb(), a, e, str(data, "stepId"), fields(data))),
    "Condition saved.",
  );
}

/** Plain form actions (no form state) for the reorder arrows. */
export async function moveAction(data: FormData): Promise<void> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  const direction = str(data, "direction") === "up" ? "up" : "down";
  if (str(data, "stepId")) await moveStep(getDb(), actor, engagementId, str(data, "stepId"), direction);
  else await moveWorkflow(getDb(), actor, engagementId, str(data, "workflowId"), direction);
  refresh(engagementId);
}

export async function saveResponseWindowsAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await updateResponseWindows(getDb(), actor, engagementId, fields(data) as never);
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  return { status: "success", message: "Response times saved." };
}

export async function submitAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await submitForConfirmation(getDb(), actor, engagementId);
  } catch (err) {
    return toState(err);
  }
  kickOutbox();
  refresh(engagementId);
  redirect(`/app/engagements/${engagementId}/agreement?sent=1`);
}

export async function resendAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await resendInvitation(getDb(), actor, engagementId);
  } catch (err) {
    return toState(err);
  }
  kickOutbox();
  refresh(engagementId);
  return { status: "success", message: "A new link has been sent. Earlier links no longer work." };
}

export async function withdrawAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  try {
    await withdrawEngagement(getDb(), actor, engagementId);
  } catch (err) {
    return toState(err);
  }
  refresh(engagementId);
  return { status: "success", message: "Engagement withdrawn." };
}

export async function respondAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const engagementId = str(data, "engagementId");
  const response = str(data, "response");
  try {
    await respondToBaseline(getDb(), actor, engagementId, fields(data) as never);
  } catch (err) {
    return toState(err);
  }
  kickOutbox();
  refresh(engagementId);
  redirect(`/app/engagements/${engagementId}/agreement?responded=${encodeURIComponent(response)}`);
}

// ----- Counterparty access: invitation link + email code (FR-ID-05, D-43) ---------------------------

/** Sends a sign-in code to the INVITED email (never an address typed by the visitor). */
export async function sendCodeAction(_: FormState, data: FormData): Promise<FormState> {
  const preview = await previewEngagementInvitation(getDb(), str(data, "token"));
  if (preview.status !== "valid") return { status: "error", message: "This link no longer works. Ask the sender for a new one." };
  try {
    await getAuth().api.sendVerificationOTP({ body: { email: preview.email, type: "sign-in" } });
  } catch (err) {
    return errorToFormState(err);
  }
  kickOutbox();
  return { status: "success", message: `We've emailed a 6-digit code to ${preview.email}. It expires in 10 minutes.` };
}

export async function verifyCodeAction(_: FormState, data: FormData): Promise<FormState> {
  const token = str(data, "token");
  const otp = str(data, "code").replace(/\s/g, "");
  const preview = await previewEngagementInvitation(getDb(), token);
  if (preview.status !== "valid") return { status: "error", message: "This link no longer works. Ask the sender for a new one." };
  if (!/^\d{6}$/.test(otp)) return { status: "error", message: "Enter the 6-digit code from the email.", fields: { code: "Enter the 6-digit code" } };
  let engagementId: string;
  try {
    const res = await getAuth().api.signInEmailOTP({ body: { email: preview.email, otp, name: preview.repName ?? "" }, headers: await headers() });
    ({ engagementId } = await acceptEngagementInvitation(getDb(), { userId: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified }, token));
  } catch (err) {
    const state = errorToFormState(err);
    if (!(err instanceof AppError)) return { status: "error", message: "That code didn't work. Check it, or send a new one.", fields: { code: "Code not accepted" } };
    return state;
  }
  redirect(`/app/engagements/${engagementId}/agreement`);
}

/** Already signed in as the invited email: accept without a code. */
export async function acceptSignedInAction(_: FormState, data: FormData): Promise<FormState> {
  const token = str(data, "token");
  const session = await getSession();
  if (!session) return { status: "error", message: "Please sign in again." };
  let engagementId: string;
  try {
    ({ engagementId } = await acceptEngagementInvitation(getDb(), { userId: session.user.id, email: session.user.email, emailVerified: session.user.emailVerified }, token));
  } catch (err) {
    return errorToFormState(err);
  }
  redirect(`/app/engagements/${engagementId}/agreement`);
}
