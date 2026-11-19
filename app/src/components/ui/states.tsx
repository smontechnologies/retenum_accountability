import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Empty state: what this is and what to do next (design system §10). */
export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-line-strong p-6">
      <Icon aria-hidden className="size-6 text-fg-muted" />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-1 max-w-[60ch] text-small text-fg-secondary">{children}</p>}
      </div>
      {action}
    </div>
  );
}

/** Error state: what failed and how to fix it. Never vague, never apologetic. */
export function ErrorState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-panel border-2 border-fg p-6">
      <p className="font-semibold">{title}</p>
      {children && <p className="max-w-[60ch] text-small text-fg-secondary">{children}</p>}
      {action}
    </div>
  );
}

/** Skeleton block matching final layout (design system §7). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-control bg-sunken", className)} />;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}…</span>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
