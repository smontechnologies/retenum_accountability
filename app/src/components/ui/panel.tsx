import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A bordered section (design system §7). Prefer panels and lists over cards. */
export function Panel({ title, description, actions, children, className, as: Tag = "section" }: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: "section" | "div";
}) {
  return (
    <Tag className={cn("rounded-panel border border-line bg-raised", className)} aria-label={Tag === "section" && title ? title : undefined}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 lg:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-h3 font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-small text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className="px-4 py-4 lg:px-5">{children}</div>
    </Tag>
  );
}

/** A clickable summary that leads somewhere. */
export function Card({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("block rounded-panel border border-line bg-raised p-4 transition-colors duration-[120ms] hover:bg-surface", className)}>
      {children}
    </Link>
  );
}

/** Page heading block: one display title per page (design system §3). */
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-display font-semibold">{title}</h1>
        {description && <p className="mt-1 max-w-[65ch] text-body text-fg-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
