import { requireActor } from "@/server/auth/session";
import { ActionForm, Field, SelectField } from "@/components/ui/form";
import { PageHeader, Panel } from "@/components/ui/panel";
import { createWorkspaceAction } from "../../actions";

export const metadata = { title: "Create a workspace" };

export default async function NewWorkspacePage() {
  const actor = await requireActor("/app/business/new");
  return (
    <div className="space-y-8">
      <PageHeader title="Create a workspace" description="A workspace represents your business on Retenum. You can invite your team after creating it." />
      <Panel as="div" className="max-w-xl">
        <ActionForm action={createWorkspaceAction} submitLabel="Create workspace" pendingLabel="Creating…">
          <Field name="name" label="Business or trading name" autoComplete="organization" required />
          <SelectField name="type" label="Type" defaultValue="business" options={[{ value: "business", label: "Business" }, { value: "individual", label: "Individual / sole practitioner" }]} />
          <Field name="contactEmail" label="Contact email" type="email" defaultValue={actor.email} required />
          <Field name="registrationNumber" label="Registration number (optional)" hint="For example, your CAC RC number." />
          <Field name="address" label="Address (optional)" autoComplete="street-address" />
        </ActionForm>
      </Panel>
    </div>
  );
}
