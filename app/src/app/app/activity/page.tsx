import { History } from "lucide-react";
import { PageHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Activity" description="A time-stamped history of everything recorded across your engagements." />
      <EmptyState icon={History} title="No activity yet">
        Confirmations, changes, deliveries, payments and disputes are recorded here in order, with who did each one.
      </EmptyState>
    </div>
  );
}
