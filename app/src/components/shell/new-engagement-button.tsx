import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** FR-ENG-11: "New engagement" is always available, whether or not engagements already exist. */
export function NewEngagementButton({ size = "md" }: { size?: "md" | "sm" }) {
  return (
    <ButtonLink href="/app/engagements/new" size={size} icon={<Plus aria-hidden className="size-4" />}>
      New engagement
    </ButtonLink>
  );
}
