import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { describeEvent } from "@/components/engagement/format";
import { Panel } from "@/components/ui/panel";
import { Timeline } from "@/components/ui/timeline";

export const metadata = { title: "Run history" };

/** Tamper-evident timeline (FR-HIS-04). Filters and PDF export arrive in Slice 6. */
export default async function EngagementActivity(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const actor = await requireActor(`/app/engagements/${id}/activity`);
  const v = await getEngagementView(getDb(), actor, id);
  return (
    <Panel title="Run history" description="Everything recorded on this engagement, in order, with who did it and when. When workflows start running, each run and its steps appear here. Entries can't be edited or deleted.">
      <Timeline
        events={v.events.map((e) => ({
          id: e.id,
          at: e.createdAt,
          actor: e.actorName || (e.actorSide === "system" ? "Retenum" : "Someone"),
          side: (e.actorSide ?? undefined) as "payer" | "payee" | "system" | undefined,
          text: describeEvent(e.type, e.data),
        }))}
      />
    </Panel>
  );
}
