import { notFound } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { getWorkspaceOverview } from "@/server/modules/workspaces/service";
import { canInWorkspace } from "@/server/policy/workspace-policy";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/dialog";
import { DescriptionList } from "@/components/ui/description-list";
import { ActionForm, Field, SelectField } from "@/components/ui/form";
import { PageHeader, Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable } from "@/components/ui/table";
import { inviteMemberAction, memberAction } from "../actions";

export const metadata = { title: "Business" };

const dateFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export default async function BusinessPage(props: { searchParams: Promise<{ ws?: string; created?: string }> }) {
  const { ws, created } = await props.searchParams;
  const actor = await requireActor("/app/business");
  const db = getDb();
  const { current } = await getCurrentWorkspace(db, actor, ws);
  if (!current) {
    return (
      <div className="space-y-8">
        <PageHeader title="Business" />
        <EmptyState icon={Building2} title="No workspace yet" action={<ButtonLink href="/app/business/new" icon={<Plus aria-hidden className="size-4" />}>Create a workspace</ButtonLink>}>
          Create a workspace for your business to invite your team and record engagements.
        </EmptyState>
      </div>
    );
  }
  let overview;
  try {
    overview = await getWorkspaceOverview(db, actor, current.id);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
  const { workspace, myRole, members, invitations, limits } = overview;
  const canManage = canInWorkspace(myRole, "workspace.change_role");
  const seatsUsed = members.length + invitations.length;
  const hidden = (op: string, target: string) => ({ workspaceId: workspace.id, op, target });

  return (
    <div className="space-y-8">
      <PageHeader
        title={workspace.name}
        description={`You are ${ROLE_LABEL[myRole]?.toLowerCase()} of this workspace.`}
        actions={<ButtonLink href="/app/business/new" variant="secondary" size="sm" icon={<Plus aria-hidden className="size-4" />}>New workspace</ButtonLink>}
      />
      {created && <Alert tone="success" title="Workspace created">Invite your team, then create your first engagement.</Alert>}
      {workspace.suspendedAt && <Alert tone="warning" title="This workspace is suspended">You can view records, but nothing new can be created. Contact support.</Alert>}

      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Team" description={`${seatsUsed} of ${limits.seats} seat${limits.seats === 1 ? "" : "s"} used on the ${workspace.plan} plan.`}>
          <ResponsiveTable
            caption="Team members"
            rows={members}
            rowKey={(m) => m.userId}
            columns={[
              { key: "name", header: "Name", primary: true, cell: (m) => <span>{m.name}{m.userId === actor.userId ? " (you)" : ""}<span className="block text-caption font-normal text-fg-muted">{m.email}</span></span> },
              { key: "role", header: "Role", cell: (m) => ROLE_LABEL[m.role] ?? m.role },
              { key: "joined", header: "Joined", cell: (m) => <span className="tabular">{dateFmt.format(m.joinedAt)}</span> },
              {
                key: "actions",
                header: "Actions",
                cell: (m) => {
                  const any = (canManage && m.role !== "owner") || (myRole === "owner" && m.role !== "owner") || (m.role !== "owner" && (canManage || m.userId === actor.userId));
                  if (!any) return null;
                  return (
                  <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                    {canManage && m.role !== "owner" && (
                      <ConfirmAction
                        trigger={m.role === "admin" ? "Make member" : "Make admin"}
                        title={m.role === "admin" ? `Make ${m.name} a member?` : `Make ${m.name} an admin?`}
                        consequence={m.role === "admin" ? "Members can view the workspace but can't manage the team." : "Admins can invite, remove and change the roles of other members."}
                        confirmLabel={m.role === "admin" ? "Make member" : "Make admin"}
                        action={memberAction}
                        hidden={hidden(m.role === "admin" ? "make-member" : "make-admin", m.userId)}
                        successToast="Role changed."
                      />
                    )}
                    {myRole === "owner" && m.role !== "owner" && (
                      <ConfirmAction trigger="Make owner" title={`Transfer ownership to ${m.name}?`} consequence="You will become an admin. Only the new owner can transfer ownership again." confirmLabel="Transfer ownership" action={memberAction} hidden={hidden("transfer", m.userId)} successToast="Ownership transferred." />
                    )}
                    {m.role !== "owner" && (canManage || m.userId === actor.userId) && (
                      <ConfirmAction
                        trigger={m.userId === actor.userId ? "Leave" : "Remove"}
                        triggerVariant="destructive"
                        title={m.userId === actor.userId ? "Leave this workspace?" : `Remove ${m.name}?`}
                        consequence="Anything they recorded stays in the history with their name. They lose access immediately."
                        confirmLabel={m.userId === actor.userId ? "Leave workspace" : "Remove member"}
                        action={memberAction}
                        hidden={hidden("remove", m.userId)}
                        successToast="Member removed."
                      />
                    )}
                  </div>
                  );
                },
              },
            ]}
          />
        </Panel>

        <Panel title="Details">
          <DescriptionList
            items={[
              { label: "Type", value: workspace.type === "business" ? "Business" : "Individual" },
              { label: "Contact email", value: workspace.contactEmail },
              { label: "Registration number", value: workspace.registrationNumber ?? "Not provided" },
              { label: "Plan", value: `${workspace.plan[0]!.toUpperCase()}${workspace.plan.slice(1)}` },
            ]}
          />
        </Panel>
      </div>

      {canInWorkspace(myRole, "workspace.invite") && (
        <Panel title="Invite a colleague" description="They'll receive an email link that expires in 7 days.">
          {invitations.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-small font-semibold">Pending invitations</h3>
              <ResponsiveTable
                caption="Pending invitations"
                rows={invitations}
                rowKey={(i) => i.id}
                columns={[
                  { key: "email", header: "Email", primary: true, cell: (i) => i.email },
                  { key: "role", header: "Role", cell: (i) => ROLE_LABEL[i.role] ?? i.role },
                  { key: "expires", header: "Expires", cell: (i) => <span className="tabular">{dateFmt.format(i.expiresAt)}</span> },
                  { key: "actions", header: "Actions", cell: (i) => <ConfirmAction trigger="Withdraw" title={`Withdraw the invitation to ${i.email}?`} consequence="The link in their email will stop working." confirmLabel="Withdraw invitation" action={memberAction} hidden={hidden("revoke", i.id)} successToast="Invitation withdrawn." /> },
                ]}
              />
            </div>
          )}
          <div className="max-w-md">
            <ActionForm action={inviteMemberAction} submitLabel="Send invitation" successToast="Invitation sent.">
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <Field name="email" label="Email" type="email" autoComplete="off" required />
              <SelectField name="role" label="Role" defaultValue="member" options={[{ value: "member", label: "Member" }, { value: "admin", label: "Admin" }]} />
            </ActionForm>
          </div>
        </Panel>
      )}
    </div>
  );
}
