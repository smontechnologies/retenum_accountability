import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { GuidedStartForm } from "@/components/workflow/guided-start-form";

export const metadata = { title: "Set up the agreement" };

/** D-67: a few plain questions generate the workflows. Only for a draft with no steps yet. */
export default async function GuidedStartPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const actor = await requireActor(`/app/engagements/${id}/start`);
  const v = await getEngagementView(getDb(), actor, id);
  if (!v.can.editDraft || v.workflows.some((w) => w.steps.length > 0)) redirect(`/app/engagements/${id}`);
  const payer = v.parties.find((p) => p.side === "payer")!.orgName;
  return <GuidedStartForm engagementId={id} payerName={payer} otherName={v.other.orgName} />;
}
