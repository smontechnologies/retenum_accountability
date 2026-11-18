import Link from "next/link";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { listWorkspacesForUser } from "@/server/modules/workspaces/service";
import { ActionForm, Field, SelectField } from "@/app/_components/form";
import { StatusBadge } from "@/app/status-badge";
import { createWorkspaceAction } from "./actions";

export const metadata = { title: "Your workspaces · Retenum" };

export default async function DashboardPage() {
  const actor = await requireActor();
  const workspaces = await listWorkspacesForUser(getDb(), actor.userId);
  return (
    <div className="space-y-8">
      <section aria-labelledby="ws-heading" className="space-y-3">
        <h1 id="ws-heading" className="text-2xl font-semibold">
          Your workspaces
        </h1>
        {workspaces.length === 0 ? (
          <p className="text-[var(--muted)]">You are not in a workspace yet. Create one below, or accept an invitation from a colleague.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded border border-[var(--border)]">
            {workspaces.map((w) => (
              <li key={w.id}>
                <Link href={`/app/w/${w.id}`} className="flex items-center justify-between gap-3 p-4">
                  <span className="font-medium">{w.name}</span>
                  <StatusBadge label={w.role} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="create-heading" className="space-y-3">
        <h2 id="create-heading" className="text-lg font-medium">
          Create a workspace
        </h2>
        <ActionForm action={createWorkspaceAction} submitLabel="Create workspace">
          <Field name="name" label="Business or trading name" required />
          <SelectField
            name="type"
            label="Type"
            defaultValue="business"
            options={[
              { value: "business", label: "Business" },
              { value: "individual", label: "Individual / sole practitioner" },
            ]}
          />
          <Field name="contactEmail" label="Contact email" type="email" defaultValue={actor.email} required />
          <Field name="registrationNumber" label="Registration number (optional)" hint="e.g. CAC RC number" />
          <Field name="address" label="Address (optional)" />
        </ActionForm>
      </section>
    </div>
  );
}
