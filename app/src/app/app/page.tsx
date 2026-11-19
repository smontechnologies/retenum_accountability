import { CircleCheck, FileText, History } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { NewEngagementButton } from "@/components/shell/new-engagement-button";
import { Alert } from "@/components/ui/alert";
import { PageHeader, Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Overview" };

/**
 * Overview (DES-12, UI/UX S3). Actionable information only, with "New engagement" always available
 * (FR-ENG-11). Engagement, change, delivery and payment data fill these panels from Slices 2–5.
 */
export default async function OverviewPage(props: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await props.searchParams;
  const actor = await requireActor();
  const { current } = await getCurrentWorkspace(getDb(), actor);
  const activeEngagements = 0; // replaced by the real count in Slice 2
  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description={`What needs attention in ${current?.name ?? "your workspace"}.`} actions={<NewEngagementButton />} />
      {welcome && (
        <Alert tone="success" title="Your workspace is ready">
          Step 2 of 2: create your first engagement. Add what you've agreed with your client or supplier, then invite them to confirm it.
        </Alert>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {activeEngagements === 0 && (
            <EmptyState icon={FileText} title="Create your first engagement" action={<NewEngagementButton />}>
              An engagement is one piece of paid work with a client or supplier. You record what's included, the price and how
              it will be paid, then the other party confirms it.
            </EmptyState>
          )}
          <Panel title="Needs your response" description="Confirmations, changes awaiting authorisation and deliveries awaiting acceptance.">
            <EmptyState icon={CircleCheck} title="Nothing needs your response">
              When the other party on an engagement proposes, submits or requests something from you, it appears here.
            </EmptyState>
          </Panel>
          <Panel title="Money position" description="Amounts due, outstanding and received across active engagements.">
            <p className="text-small text-fg-secondary">Appears once an engagement has been confirmed by both parties.</p>
          </Panel>
        </div>
        <Panel title="Recent activity">
          <EmptyState icon={History} title="No activity yet">Every confirmation, change, delivery and payment is recorded here with who did it and when.</EmptyState>
        </Panel>
      </div>
    </div>
  );
}
