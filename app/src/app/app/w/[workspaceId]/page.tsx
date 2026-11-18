import { notFound } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { getWorkspaceOverview } from "@/server/modules/workspaces/service";
import { canInWorkspace } from "@/server/policy/workspace-policy";
import { ActionForm, Field, SelectField } from "@/app/_components/form";
import { StatusBadge } from "@/app/status-badge";
import { inviteMemberAction, memberAction } from "../../actions";

export const metadata = { title: "Workspace · Retenum" };

function RowAction({ workspaceId, op, target, label, variant = "secondary" }: { workspaceId: string; op: string; target: string; label: string; variant?: "secondary" | "danger" }) {
  return (
    <ActionForm action={memberAction} submitLabel={label} variant={variant}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="target" value={target} />
    </ActionForm>
  );
}

export default async function WorkspacePage(props: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await props.params;
  const actor = await requireActor(`/app/w/${workspaceId}`);
  let overview;
  try {
    overview = await getWorkspaceOverview(getDb(), actor, workspaceId);
  } catch (err) {
    if (err instanceof AppError && (err.code === "NOT_FOUND" || err.code === "VALIDATION")) notFound();
    throw err;
  }
  const { workspace, myRole, members, invitations, limits } = overview;
  const canManage = canInWorkspace(myRole, "workspace.change_role");
  const seatsUsed = members.length + invitations.length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{workspace.name}</h1>
        <p className="flex flex-wrap gap-2 text-sm">
          <StatusBadge label={`You: ${myRole}`} />
          <StatusBadge label={`Plan: ${workspace.plan}`} />
          <StatusBadge label={`Seats: ${seatsUsed} of ${limits.seats}`} />
          {workspace.suspendedAt && <StatusBadge label="Suspended" tone="attention" />}
        </p>
        <p className="text-sm text-[var(--muted)]">Engagements arrive in the next release.</p>
      </header>

      <section aria-labelledby="members-heading" className="space-y-3">
        <h2 id="members-heading" className="text-lg font-medium">
          Team
        </h2>
        <ul className="divide-y divide-[var(--border)] rounded border border-[var(--border)]">
          {members.map((m) => (
            <li key={m.userId} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {m.name}
                    {m.userId === actor.userId && " (you)"}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{m.email}</p>
                </div>
                <StatusBadge label={m.role} tone={m.role === "owner" ? "done" : "neutral"} />
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage && m.role !== "owner" && (
                  <RowAction workspaceId={workspaceId} op={m.role === "admin" ? "make-member" : "make-admin"} target={m.userId} label={m.role === "admin" ? "Make member" : "Make admin"} />
                )}
                {myRole === "owner" && m.role !== "owner" && <RowAction workspaceId={workspaceId} op="transfer" target={m.userId} label="Make owner" />}
                {m.role !== "owner" && (canManage || m.userId === actor.userId) && (
                  <RowAction workspaceId={workspaceId} op="remove" target={m.userId} label={m.userId === actor.userId ? "Leave workspace" : "Remove"} variant="danger" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {canInWorkspace(myRole, "workspace.invite") && (
        <section aria-labelledby="invite-heading" className="space-y-3">
          <h2 id="invite-heading" className="text-lg font-medium">
            Invite a colleague
          </h2>
          {invitations.length > 0 && (
            <ul className="divide-y divide-[var(--border)] rounded border border-[var(--border)]">
              {invitations.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{i.email}</p>
                    <p className="text-sm text-[var(--muted)]">
                      Pending · {i.role} · expires {i.expiresAt.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}
                    </p>
                  </div>
                  <RowAction workspaceId={workspaceId} op="revoke" target={i.id} label="Withdraw" />
                </li>
              ))}
            </ul>
          )}
          <ActionForm action={inviteMemberAction} submitLabel="Send invitation">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <Field name="email" label="Email" type="email" required />
            <SelectField name="role" label="Role" defaultValue="member" options={[{ value: "member", label: "Member" }, { value: "admin", label: "Admin" }]} />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
