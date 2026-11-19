import { Lock } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Delivery" };

export default async function EngagementDeliveryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const actor = await requireActor(`/app/engagements/${id}/delivery`);
  const v = await getEngagementView(getDb(), actor, id);
  return (
    <EmptyState icon={Lock} title={v.status === "active" ? "Nothing here yet" : "Opens once the agreement is confirmed"}>
      Deliveries submitted for acceptance, with evidence, and each response. {v.status === "active" ? "This section is being built and arrives in an upcoming release." : "Both parties must confirm the agreement first."}
    </EmptyState>
  );
}
