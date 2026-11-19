import { Lock } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Payments" };

export default async function EngagementPaymentsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const actor = await requireActor(`/app/engagements/${id}/payments`);
  const v = await getEngagementView(getDb(), actor, id);
  return (
    <EmptyState icon={Lock} title={v.status === "active" ? "Nothing here yet" : "Opens once the agreement is confirmed"}>
      What has become due, what has been requested and paid, and what is outstanding or disputed. {v.status === "active" ? "This section is being built and arrives in an upcoming release." : "Both parties must confirm the agreement first."}
    </EmptyState>
  );
}
