import Link from "next/link";
import { CircleCheck, FileText, History } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { listEngagementsForActor } from "@/server/modules/engagements/service";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { ENGAGEMENT_STATUS } from "@/components/engagement/format";
import { NewEngagementButton } from "@/components/shell/new-engagement-button";
import { Alert } from "@/components/ui/alert";
import { DescriptionList } from "@/components/ui/description-list";
import { MoneyFigure } from "@/components/ui/money";
import { PageHeader, Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata = { title: "Overview" };

/** Overview (DES-12): actionable items only, each linking to its engagement. New engagement always available (FR-ENG-11). */
export default async function OverviewPage(props: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await props.searchParams;
  const actor = await requireActor();
  const db = getDb();
  const { current } = await getCurrentWorkspace(db, actor);
  const rows = await listEngagementsForActor(db, actor, current?.id ?? null);
  const needs = rows.filter((r) => r.needsMe);
  const active = rows.filter((r) => r.status === "active");
  const inProgress = rows.filter((r) => r.status === "draft" || r.status === "awaiting_confirmation");
  const agreedActive = active.reduce((a, r) => a + r.agreedMinor, 0n);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={current ? `What needs attention in ${current.name}.` : "Engagements you've been asked to confirm."}
        actions={current ? <NewEngagementButton /> : undefined}
      />
      {welcome && (
        <Alert tone="success" title="Your workspace is ready">
          Step 2 of 2: create your first engagement. Add what you've agreed with your client or supplier, then invite them to confirm it.
        </Alert>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {current && rows.length === 0 && (
            <EmptyState icon={FileText} title="Create your first engagement" action={<NewEngagementButton />}>
              An engagement is one piece of paid work with a client or supplier. You record what's included, the price and how it will be paid, then
              the other party confirms it.
            </EmptyState>
          )}
          <Panel title="Needs your response" description="Agreements to confirm, and agreements returned to you with requested changes.">
            {needs.length === 0 ? (
              <EmptyState icon={CircleCheck} title="Nothing needs your response">
                When the other party on an engagement proposes, submits or requests something from you, it appears here.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {needs.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/app/engagements/${r.id}`} className="font-semibold underline-offset-4 hover:underline">{r.title}</Link>
                      <p className="text-small text-fg-secondary">With {r.otherParty}</p>
                    </div>
                    <StatusBadge status={ENGAGEMENT_STATUS[r.status].key} label={r.status === "draft" ? "Changes requested" : "Confirm agreement"} viewerMustAct />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Money position" description="Across engagements confirmed by both parties.">
            {active.length === 0 ? (
              <p className="text-small text-fg-secondary">Appears once an engagement has been confirmed by both parties.</p>
            ) : (
              <DescriptionList
                items={[
                  { label: "Active engagements", value: `${active.length}` },
                  { label: "Agreed value", value: <MoneyFigure amountMinor={agreedActive} /> },
                ]}
              />
            )}
          </Panel>
        </div>
        <Panel title="In progress">
          {inProgress.length === 0 ? (
            <EmptyState icon={History} title="Nothing in progress">Drafts and agreements waiting for confirmation appear here.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {inProgress.map((r) => (
                <li key={r.id} className="space-y-1 py-3">
                  <Link href={`/app/engagements/${r.id}`} className="font-medium underline-offset-4 hover:underline">{r.title}</Link>
                  <div><StatusBadge status={ENGAGEMENT_STATUS[r.status].key} label={ENGAGEMENT_STATUS[r.status].label} /></div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
