import type { ReactNode } from "react";

export interface TimelineEvent {
  id: string;
  at: Date;
  actor: string;
  side?: "payer" | "payee" | "system";
  text: ReactNode;
}

const dayFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const timeFmt = new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" });

/** Activity timeline grouped by day (design system §7). Absolute times always shown. */
export function Timeline({ events, label = "Activity" }: { events: TimelineEvent[]; label?: string }) {
  const groups = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const k = dayFmt.format(e.at);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return (
    <section aria-label={label} className="space-y-6">
      {[...groups.entries()].map(([day, items]) => (
        <div key={day}>
          <h3 className="text-small font-semibold text-fg-secondary">{day}</h3>
          <ol className="mt-2 border-l border-line">
            {items.map((e) => (
              <li key={e.id} className="relative py-2 pl-5">
                <span aria-hidden className="absolute top-3.5 -left-[4.5px] size-2 rounded-full bg-fg" />
                <p className="text-small">
                  <span className="font-semibold">{e.actor}</span>
                  {e.side && e.side !== "system" && <span className="text-fg-muted"> ({e.side})</span>} {e.text}
                </p>
                <p className="text-caption text-fg-muted tabular">
                  <time dateTime={e.at.toISOString()}>{timeFmt.format(e.at)}</time>
                </p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
