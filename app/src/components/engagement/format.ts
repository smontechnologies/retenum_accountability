import type { EngagementStatus } from "@/domain/engagement-state";
import type { StatusKey } from "@/domain/status";

/** Engagement status → status grammar key (design system §6). */
export const ENGAGEMENT_STATUS: Record<EngagementStatus, { key: StatusKey; label: string }> = {
  draft: { key: "draft", label: "Draft" },
  awaiting_confirmation: { key: "proposed", label: "Awaiting confirmation" },
  active: { key: "active", label: "Active" },
  stopped: { key: "stopped", label: "Stopped" },
  closed_agreed: { key: "closed", label: "Closed" },
  closed_open_items: { key: "closed_open_items", label: "Closed with open items" },
  withdrawn: { key: "withdrawn", label: "Withdrawn" },
};

export const SIDE_LABEL = { payer: "paying", payee: "being paid" } as const;

const dayFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
export const formatDate = (d: Date | string) => dayFmt.format(typeof d === "string" ? new Date(`${d}T12:00:00Z`) : d);

/** Human sentence for an engagement event (timeline). Neutral voice: records, never judges. */
export function describeEvent(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "engagement.draft_created":
      return `created the draft engagement with ${String(data.counterpartyOrg ?? "the other party")}.`;
    case "draft.commitment_added":
      return `added "${String(data.title)}" to the draft.`;
    case "draft.commitment_updated":
      return `updated "${String(data.title)}" in the draft.`;
    case "draft.commitment_removed":
      return `removed "${String(data.title)}" from the draft.`;
    case "draft.response_windows_updated":
      return "updated the response times.";
    case "baseline.submitted":
      return "sent the agreement for confirmation.";
    case "baseline.resubmitted":
      return `sent a revised agreement for confirmation (submission ${String(data.seq)}).`;
    case "invitation.resent":
      return "sent a new link to the other party.";
    case "invitation.accepted":
      return "opened the engagement from their invitation.";
    case "baseline.confirmed":
      return "confirmed the agreement. It is now version 1 of the shared record.";
    case "baseline.changes_requested":
      return `asked for changes${data.comment ? `: "${String(data.comment)}"` : "."}`;
    case "baseline.declined":
      return `declined the agreement${data.comment ? `: "${String(data.comment)}"` : "."}`;
    case "engagement.withdrawn":
      return "withdrew the engagement.";
    default:
      return type.replace(/[._]/g, " ") + ".";
  }
}
