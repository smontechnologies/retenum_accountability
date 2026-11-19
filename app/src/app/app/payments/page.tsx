import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Payments" description="What is due to you, what you owe, and payments waiting for confirmation, across all engagements." />
      <EmptyState icon={Wallet} title="No payments yet">
        Payment obligations appear here once an engagement is confirmed. Retenum records payments; it never holds your money.
      </EmptyState>
    </div>
  );
}
