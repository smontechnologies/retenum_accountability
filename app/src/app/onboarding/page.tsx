import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { listWorkspacesForUser } from "@/server/modules/workspaces/service";
import { Wordmark } from "@/components/shell/brand";
import { ActionForm, Field, SelectField } from "@/components/ui/form";
import { signOutAction } from "@/app/(auth)/actions";
import { createWorkspaceAction } from "@/app/app/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set up your business" };

/**
 * Onboarding (FR-ONB-01..03): a user without a workspace must create one before using the app.
 * Users who already belong to a workspace never see this page.
 */
export default async function OnboardingPage() {
  const actor = await requireActor("/onboarding");
  const memberships = await listWorkspacesForUser(getDb(), actor.userId);
  if (memberships.length > 0) redirect("/app");
  return (
    <div className="min-h-dvh bg-surface">
      <main id="main" className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8 sm:py-14">
        <div className="flex items-center justify-between">
          <Wordmark href="/onboarding" />
          <form action={signOutAction}>
            <button type="submit" className="min-h-11 text-small text-fg-secondary underline underline-offset-4">Sign out</button>
          </form>
        </div>
        <div className="mt-8 rounded-panel border border-line bg-raised p-5 sm:p-8">
          <p className="text-small text-fg-muted">Step 1 of 2</p>
          <h1 className="mt-1 text-display font-semibold">Set up your business</h1>
          <p className="mt-2 text-body text-fg-secondary">
            Your workspace represents your business on Retenum. Next, you'll create your first engagement with a client or supplier.
          </p>
          <div className="mt-6">
            <ActionForm action={createWorkspaceAction} submitLabel="Continue" pendingLabel="Setting up…" block>
              <input type="hidden" name="next" value="onboarding" />
              <Field name="name" label="Business or trading name" autoComplete="organization" required />
              <SelectField name="type" label="Type" defaultValue="business" options={[{ value: "business", label: "Business" }, { value: "individual", label: "Individual / sole practitioner" }]} />
              <Field name="contactEmail" label="Contact email" type="email" defaultValue={actor.email} required />
              <Field name="registrationNumber" label="Registration number (optional)" hint="For example, your CAC RC number." />
            </ActionForm>
          </div>
        </div>
        <p className="mt-6 text-caption text-fg-muted">
          Were you invited to join a colleague's workspace? Open the invitation link in your email instead.
        </p>
      </main>
    </div>
  );
}
