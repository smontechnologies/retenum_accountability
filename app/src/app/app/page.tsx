import { CircleCheck, FileText, History, Building2 } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Overview" };

/**
 * Overview (DES-12, UI/UX S3). Only actionable information. Engagement, change, delivery and payment
 * data fill these panels from Slices 2–5; until then each panel states plainly what will appear.
 */
export default async function OverviewPage() {
  const actor = await requireActor();
  const { current } = await getCurrentWorkspace(getDb(), actor);
  if (!current) {
    return (
      <div className="space-y-8">
        <PageHeader title="Welcome to Retenum" description="Create a workspace for your business to start recording engagements with your clients and suppliers." />
        <EmptyState icon={Building2} title="You're not in a workspace yet" action={<ButtonLink href="/app/business/new">Create a workspace</ButtonLink>}>
          A workspace holds your team and your engagements. If a colleague invited you, open the link in their email instead.
        </EmptyState>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description={`What needs attention in ${current.name}.`} />
      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Panel title="Needs your response" description="Confirmations, changes awaiting authorisation and deliveries awaiting acceptance.">
            <EmptyState icon={CircleCheck} title="Nothing needs your response">
              When the other party on an engagement proposes, submits or requests something from you, it appears here.
            </EmptyState>
          </Panel>
          <Panel title="Money position" description="Amounts due, outstanding and received across active engagements.">
            <EmptyState icon={FileText} title="No active engagements">
              Once an engagement is confirmed by both parties, its agreed value, payments and outstanding balance are summarised here.
            </EmptyState>
          </Panel>
        </div>
        <Panel title="Recent activity">
          <EmptyState icon={History} title="No activity yet">Every confirmation, change, delivery and payment is recorded here with who did it and when.</EmptyState>
        </Panel>
      </div>
    </div>
  );
}
