import Link from "next/link";
import { cn } from "@/lib/cn";

/** Link-based tabs: each tab is a route (design system §7). Used on tablet/desktop. */
export function Tabs({ items, current, label }: { items: Array<{ href: string; label: string; key: string }>; current: string; label: string }) {
  return (
    <nav aria-label={label} className="border-b border-line">
      <ul className="flex flex-wrap gap-x-6">
        {items.map((t) => {
          const active = t.key === current;
          return (
            <li key={t.key}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center border-b-2 text-small",
                  active ? "border-fg font-semibold text-fg" : "border-transparent text-fg-secondary hover:text-fg",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
