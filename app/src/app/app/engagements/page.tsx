import Link from "next/link";
import { FileText } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { listEngagementsForActor } from "@/server/modules/engagements/service";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { ENGAGEMENT_STATUS, formatDate, SIDE_LABEL } from "@/components/engagement/format";
import { NewEngagementButton } from "@/components/shell/new-engagement-button";
import { MoneyFigure } from "@/components/ui/money";
import { PageHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResponsiveTable } from "@/components/ui/table";

export const metadata = { title: "Engagements" };

export default async function EngagementsPage() {
  const actor = await requireActor("/app/engagements");
  const db = getDb();
  const { current } = await getCurrentWorkspace(db, actor);
  const rows = await listEngagementsForActor(db, actor, current?.id ?? null);
  return (
    <div className="space-y-8">
      <PageHeader title="Engagements" description="Every piece of paid work you've agreed with a client or supplier, from agreement to final payment." actions={current ? <NewEngagementButton /> : undefined} />
      <ResponsiveTable
        caption="Engagements"
        rows={rows}
        rowKey={(r) => r.id}
        empty={
          <EmptyState icon={FileText} title="No engagements yet" action={current ? <NewEngagementButton /> : undefined}>
            Engagements you create, and engagements you're invited to confirm, are listed here with their status and value.
          </EmptyState>
        }
        columns={[
          { key: "title", header: "Engagement", primary: true, cell: (r) => <Link href={`/app/engagements/${r.id}`} className="font-semibold underline-offset-4 hover:underline">{r.title}</Link> },
          { key: "other", header: "With", cell: (r) => r.otherParty },
          { key: "role", header: "You are", cell: (r) => SIDE_LABEL[r.mySide] },
          {
            key: "status",
            header: "Status",
            cell: (r) => <StatusBadge status={ENGAGEMENT_STATUS[r.status].key} label={r.needsMe ? `${ENGAGEMENT_STATUS[r.status].label} · your response` : ENGAGEMENT_STATUS[r.status].label} viewerMustAct={r.needsMe} />,
          },
          { key: "updated", header: "Updated", cell: (r) => <span className="tabular">{formatDate(r.updatedAt)}</span> },
          { key: "agreed", header: "Agreed value", numeric: true, cell: (r) => <MoneyFigure amountMinor={r.agreedMinor} /> },
        ]}
      />
    </div>
  );
}
