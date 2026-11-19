"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Ellipsis, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { Dialog } from "@/components/ui/dialog";
import { isActive, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "./nav-items";

function SideLink({ item, compact }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={compact ? item.label : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-control px-3 text-small transition-colors duration-[120ms]",
        compact && "justify-center px-0",
        active ? "bg-raised font-semibold text-fg ring-1 ring-line" : "text-fg-secondary hover:bg-raised hover:text-fg",
      )}
    >
      <Icon aria-hidden className="size-5 shrink-0" strokeWidth={active ? 2 : 1.5} />
      <span className={compact ? "sr-only" : ""}>{item.label}</span>
    </Link>
  );
}

/** Desktop sidebar (≥ lg) and tablet icon rail (md) — UI/UX §2. */
export function SideNav({ compact = false, header, footer }: { compact?: boolean; header?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <nav aria-label="Main" className="flex h-full flex-col gap-6">
      {header}
      <ul className="space-y-1">
        {PRIMARY_NAV.map((i) => (
          <li key={i.href}>
            <SideLink item={i} compact={compact} />
          </li>
        ))}
      </ul>
      <ul className="space-y-1 border-t border-line pt-4">
        {SECONDARY_NAV.map((i) => (
          <li key={i.href}>
            <SideLink item={i} compact={compact} />
          </li>
        ))}
      </ul>
      <div className="mt-auto">{footer}</div>
    </nav>
  );
}

/** Mobile bottom navigation (< md) with a More sheet for Business, Settings and sign out (UI/UX §2). */
export function BottomNav({ signOut, email }: { signOut: () => Promise<void>; email: string }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const moreActive = SECONDARY_NAV.some((i) => isActive(pathname, i));
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] leading-tight";
  return (
    <>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex">
          {PRIMARY_NAV.map((i) => {
            const active = isActive(pathname, i);
            const Icon = i.icon;
            return (
              <li key={i.href} className="flex flex-1">
                <Link href={i.href} aria-current={active ? "page" : undefined} className={cn(item, active ? "font-semibold text-fg" : "text-fg-muted")}>
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2 : 1.5} />
                  {i.label}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button type="button" onClick={() => setMore(true)} aria-haspopup="dialog" className={cn(item, moreActive ? "font-semibold text-fg" : "text-fg-muted")}>
              <Ellipsis aria-hidden className="size-5" />
              More
            </button>
          </li>
        </ul>
      </nav>
      <Dialog open={more} onClose={() => setMore(false)} title="More" description={email} variant="drawer">
        <ul className="space-y-1" onClick={() => setMore(false)}>
          {SECONDARY_NAV.map((i) => (
            <li key={i.href}>
              <SideLink item={i} />
            </li>
          ))}
        </ul>
        <form action={signOut} className="mt-4 border-t border-line pt-4">
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-small hover:bg-surface">
            <LogOut aria-hidden className="size-5" /> Sign out
          </button>
        </form>
      </Dialog>
    </>
  );
}
