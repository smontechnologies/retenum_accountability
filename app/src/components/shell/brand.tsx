import Link from "next/link";

/**
 * Monochrome wordmark: a solid square mark and the name (D-60). The accessible name is the visible
 * text "Retenum" (WCAG 2.5.3 label in name); the compact variant keeps it as screen-reader text.
 */
export function Wordmark({ href = "/app", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2.5 font-semibold">
      <span aria-hidden className="grid size-7 place-items-center rounded-[6px] bg-fg text-[0.9375rem] leading-none text-bg">R</span>
      <span className={compact ? "sr-only" : "text-body tracking-[-0.01em]"}>Retenum</span>
    </Link>
  );
}
