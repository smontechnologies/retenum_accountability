import { notFound } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { getEngagementView } from "@/server/modules/engagements/service";
import { ENGAGEMENT_STATUS, SIDE_LABEL } from "@/components/engagement/format";
import { EngagementTabs } from "@/components/engagement/tabs";
import { LedgerStrip } from "@/components/ui/ledger-strip";
import { StatusBadge } from "@/components/ui/status-badge";

/** Engagement workspace header (DES-11): name, other party, status, agreed, paid, outstanding. */
export default async function EngagementLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const actor = await requireActor(`/app/engagements/${id}`);
  let v;
  try {
    v = await getEngagementView(getDb(), actor, id);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
  const st = ENGAGEMENT_STATUS[v.status];
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={st.key} label={st.label} />
            {v.engagement.currentVersion > 0 && <span className="text-caption text-fg-muted">Version {v.engagement.currentVersion}</span>}
          </div>
          <h1 className="text-h2 font-semibold break-words">{v.engagement.title}</h1>
          <p className="text-small text-fg-secondary">
            With <span className="font-medium text-fg">{v.other.orgName}</span>
            {v.other.repName ? ` (${v.other.repName})` : ""} · you are {SIDE_LABEL[v.viewer.side]}
          </p>
        </div>
        <div className="lg:shrink-0">
          <LedgerStrip compact figures={{ agreed: v.figures.agreed, paid: v.figures.paid, outstanding: v.figures.outstanding, due: v.status === "active" ? v.figures.due : undefined }} />
        </div>
      </header>
      <EngagementTabs id={id} />
      {props.children}
    </div>
  );
}
