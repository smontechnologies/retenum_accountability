import type { ReactNode } from "react";

/** Label/value pairs. Stacks in narrow containers, two columns when its container is wide (≥ 28rem). */
export function DescriptionList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="@container divide-y divide-line">
      {items.map((i) => (
        <div key={i.label} className="grid gap-1 py-2.5 @md:grid-cols-[minmax(10rem,1fr)_2fr] @md:gap-4">
          <dt className="text-small text-fg-muted">{i.label}</dt>
          <dd className="min-w-0 text-small break-words">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
