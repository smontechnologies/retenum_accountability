import { PageHeader } from "@/components/ui/panel";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "New engagement" };

/**
 * Entry point of engagement creation. The full guided flow (commitments, payment schedule,
 * response windows, counterparty invitation) is Slice 2 and replaces this page. It deliberately does
 * NOT create a draft yet, so no empty engagement can exist.
 */
export default function NewEngagementPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="New engagement" description="Record what you've agreed: what's included, the price, how it will be paid, and who the other party is." />
      <Alert tone="info" title="Engagement creation is being built now">
        This is the next part of Retenum. Nothing has been created, so there is no empty engagement in your workspace.
      </Alert>
      <ButtonLink href="/app" variant="secondary">Back to Overview</ButtonLink>
    </div>
  );
}
