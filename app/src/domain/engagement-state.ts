/** Engagement lifecycle (PRD §18). Pure: callers persist the result. */
export type EngagementStatus =
  | "draft"
  | "awaiting_confirmation"
  | "active"
  | "stopped"
  | "closed_agreed"
  | "closed_open_items"
  | "withdrawn";

export type EngagementEvent = "submit" | "confirm" | "request_changes" | "decline" | "withdraw";

const TRANSITIONS: Record<EngagementEvent, Partial<Record<EngagementStatus, EngagementStatus>>> = {
  submit: { draft: "awaiting_confirmation" },
  confirm: { awaiting_confirmation: "active" },
  request_changes: { awaiting_confirmation: "draft" },
  decline: { awaiting_confirmation: "withdrawn" },
  withdraw: { draft: "withdrawn", awaiting_confirmation: "withdrawn" },
};

export function nextStatus(current: EngagementStatus, event: EngagementEvent): EngagementStatus | null {
  return TRANSITIONS[event][current] ?? null;
}

/** Statuses that count towards the plan's active-engagement limit (FR-WS-07). */
export const COUNTS_TOWARDS_LIMIT: EngagementStatus[] = ["draft", "awaiting_confirmation", "active", "stopped"];

/** Commitments can be edited directly only before anything is confirmed (FR-BAS-03/05). */
export const isEditable = (s: EngagementStatus) => s === "draft";
