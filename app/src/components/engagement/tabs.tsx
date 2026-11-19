"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** D-66: the engagement is its workflows; the agreement text and the run history sit alongside. */
const SECTIONS = [
  { key: "", label: "Workflows" },
  { key: "agreement", label: "Read as agreement" },
  { key: "activity", label: "Run history" },
];

/** Engagement sections (DES-11). Wraps instead of scrolling sideways on small screens. */
export function EngagementTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/app/engagements/${id}`;
  return (
    <nav aria-label="Engagement sections" className="border-b border-line">
      <ul className="flex flex-wrap gap-x-5 sm:gap-x-6">
        {SECTIONS.map((s) => {
          const href = s.key ? `${base}/${s.key}` : base;
          const active = s.key ? pathname.startsWith(href) : pathname === base;
          return (
            <li key={s.key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-10 items-center border-b-2 text-small",
                  active ? "border-fg font-semibold text-fg" : "border-transparent text-fg-secondary hover:text-fg",
                )}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
