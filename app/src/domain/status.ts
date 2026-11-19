/**
 * Status grammar (RETENUM_DESIGN_SYSTEM.md §6, DES-06). Every commercial state is icon + label + style.
 * Style encodes who must act; it is never conveyed by colour.
 */
export type StatusStyle = "settled" | "waiting" | "needs-you" | "contested" | "neutral";

export const STATUS = {
  draft: { label: "Draft", icon: "FilePen", style: "neutral" },
  proposed: { label: "Proposed", icon: "Clock", style: "waiting" },
  confirmed: { label: "Confirmed", icon: "Check", style: "settled" },
  rejected: { label: "Rejected", icon: "X", style: "contested" },
  countered: { label: "Countered", icon: "ArrowLeftRight", style: "waiting" },
  withdrawn: { label: "Withdrawn", icon: "Undo", style: "neutral" },
  stale: { label: "Stale", icon: "RefreshCcw", style: "contested" },
  authorised: { label: "Authorised", icon: "KeyRound", style: "settled" },
  declined: { label: "Authorisation declined", icon: "KeyRound", style: "contested" },
  valuation_pending: { label: "Valuation pending", icon: "Scale", style: "waiting" },
  valuation_agreed: { label: "Valuation agreed", icon: "Scale", style: "settled" },
  submitted: { label: "Submitted for acceptance", icon: "Send", style: "waiting" },
  accepted: { label: "Accepted", icon: "CheckCheck", style: "settled" },
  partially_accepted: { label: "Partially accepted", icon: "CircleDashed", style: "waiting" },
  correction_requested: { label: "Correction requested", icon: "RotateCcw", style: "waiting" },
  disputed: { label: "Disputed", icon: "Flag", style: "contested" },
  scheduled: { label: "Scheduled", icon: "Calendar", style: "neutral" },
  due: { label: "Due", icon: "CircleDot", style: "waiting" },
  payment_pending: { label: "Payment pending", icon: "Loader", style: "waiting" },
  reported: { label: "Reported, awaiting confirmation", icon: "Inbox", style: "waiting" },
  paid: { label: "Paid", icon: "BadgeCheck", style: "settled" },
  not_received: { label: "Not received", icon: "CircleAlert", style: "contested" },
  refunded: { label: "Refunded", icon: "Undo2", style: "neutral" },
  overdue: { label: "Overdue", icon: "AlarmClock", style: "contested" },
  response_overdue: { label: "Response overdue", icon: "TimerOff", style: "contested" },
  active: { label: "Active", icon: "CirclePlay", style: "settled" },
  stopped: { label: "Stopped", icon: "OctagonPause", style: "contested" },
  closed: { label: "Closed", icon: "Lock", style: "settled" },
  closed_open_items: { label: "Closed with open items", icon: "LockOpen", style: "contested" },
} as const satisfies Record<string, { label: string; icon: string; style: StatusStyle }>;

export type StatusKey = keyof typeof STATUS;

/**
 * The style a viewer sees: "waiting" states become "needs-you" when the viewer is the one who must act.
 */
export function resolveStyle(key: StatusKey, viewerMustAct = false): StatusStyle {
  const base = STATUS[key].style;
  return viewerMustAct && base === "waiting" ? "needs-you" : base;
}
