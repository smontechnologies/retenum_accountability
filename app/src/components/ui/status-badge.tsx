import { resolveStyle, STATUS, type StatusKey } from "@/domain/status";
import { cn } from "@/lib/cn";
import { STATUS_ICONS } from "./icons";

/**
 * Status badge (design system §6). Always icon + text. Style encodes who must act, never colour.
 * `dimension` labels the concept (Agreement / Authorisation / Valuation / …) so concepts never merge.
 */
export function StatusBadge({
  status,
  dimension,
  viewerMustAct = false,
  label,
}: {
  status: StatusKey;
  dimension?: string;
  viewerMustAct?: boolean;
  label?: string;
}) {
  const def = STATUS[status];
  const style = resolveStyle(status, viewerMustAct);
  const Icon = STATUS_ICONS[def.icon];
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-caption">
      {dimension && <span className="text-fg-muted">{dimension}:</span>}
      <span
        data-status={status}
        data-style={style}
        className={cn(
          "inline-flex items-center gap-1 rounded-badge px-1.5 py-0.5 font-medium whitespace-nowrap",
          style === "settled" && "bg-fg text-bg",
          style === "waiting" && "border border-line-strong text-fg",
          style === "needs-you" && "border-2 border-fg font-semibold text-fg",
          style === "contested" && "border border-fg text-fg",
          style === "neutral" && "bg-sunken text-fg-secondary",
        )}
      >
        {Icon && <Icon aria-hidden className="size-3.5" strokeWidth={2} />}
        {viewerMustAct && style === "needs-you" && <span className="sr-only">Your response needed: </span>}
        {label ?? def.label}
      </span>
    </span>
  );
}
