import type { EngagementStatus } from "@/domain/engagement-state";
import type { Side } from "@/domain/baseline";

/**
 * Engagement authorisation (PRD §17, deny by default). A viewer is resolved from the user's relationship
 * to the engagement: initiator-side workspace membership, or counterparty party membership.
 */
export interface EngagementViewer {
  side: Side;
  isInitiatorSide: boolean;
  authority: "approver" | "contributor";
}

export type EngagementAction =
  | "engagement.view"
  | "engagement.edit_draft"
  | "engagement.submit"
  | "engagement.withdraw"
  | "engagement.resend_invitation"
  | "baseline.respond";

export function engagementCan(
  viewer: EngagementViewer | null,
  action: EngagementAction,
  ctx: { status: EngagementStatus; hasSubmission: boolean },
): boolean {
  if (!viewer) return false;
  const approver = viewer.authority === "approver";
  switch (action) {
    case "engagement.view":
      // The counterparty never sees a draft that has never been sent to them.
      return viewer.isInitiatorSide || ctx.hasSubmission;
    case "engagement.edit_draft":
      return viewer.isInitiatorSide && ctx.status === "draft";
    case "engagement.submit":
      return viewer.isInitiatorSide && approver && ctx.status === "draft";
    case "engagement.withdraw":
      return viewer.isInitiatorSide && approver && (ctx.status === "draft" || ctx.status === "awaiting_confirmation");
    case "engagement.resend_invitation":
      return viewer.isInitiatorSide && approver && ctx.status === "awaiting_confirmation";
    case "baseline.respond":
      return !viewer.isInitiatorSide && approver && ctx.status === "awaiting_confirmation";
  }
}
