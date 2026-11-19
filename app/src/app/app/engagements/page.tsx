import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Engagements" };

export default function EngagementsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Engagements" description="Every piece of paid work you've agreed with a client or supplier, from agreement to final payment." />
      <EmptyState icon={FileText} title="No engagements yet">
        Engagements you create, and engagements you're invited to confirm, will be listed here with their status and balances.
      </EmptyState>
    </div>
  );
}
