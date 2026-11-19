import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { ActionForm, Field, SelectField, TextareaField } from "@/components/ui/form";
import { PageHeader, Panel } from "@/components/ui/panel";
import { createDraftAction } from "../actions";

export const metadata = { title: "New engagement" };

/**
 * Step 1 of creating an engagement (FR-ENG-01/02). A draft exists only once it has a title and the
 * other party (FR-ENG-12); it can't be sent until it has priced deliverables and a payment schedule.
 */
export default async function NewEngagementPage() {
  const actor = await requireActor("/app/engagements/new");
  const { current } = await getCurrentWorkspace(getDb(), actor);
  return (
    <div className="space-y-8">
      <PageHeader title="New engagement" description="Start with who it's with. Next you'll add what's included, the prices and how it will be paid." />
      <Panel as="div" className="max-w-2xl">
        <ActionForm action={createDraftAction} submitLabel="Continue to the agreement" pendingLabel="Creating draft…">
          <Field name="title" label="Engagement name" hint="For example: Q1 campaign, Kitchen renovation, Website redesign." required />
          <SelectField
            name="initiatorSide"
            label={`Your role (${current?.name ?? "your business"})`}
            defaultValue="payee"
            options={[
              { value: "payee", label: "We're being paid to deliver the work" },
              { value: "payer", label: "We're paying for the work" },
            ]}
          />
          <fieldset className="space-y-5 rounded-panel border border-line p-4">
            <legend className="px-1 text-small font-semibold">The other party</legend>
            <Field name="counterpartyOrg" label="Business or person" autoComplete="off" required />
            <Field name="counterpartyName" label="Contact name" hint="The person who will confirm the agreement." autoComplete="off" required />
            <Field name="counterpartyEmail" label="Contact email" type="email" hint="They'll get a link and a sign-in code. No password needed." autoComplete="off" required />
          </fieldset>
          <TextareaField name="description" label="Short description (optional)" rows={3} />
        </ActionForm>
      </Panel>
    </div>
  );
}
