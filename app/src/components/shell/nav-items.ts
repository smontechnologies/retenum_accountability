import { Activity, Building2, LayoutDashboard, Settings, FileText, Wallet, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Matching prefix for the current-page state. */
  match: string;
}

/** Information architecture (UI/UX §1, DES-11). */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, match: "/app$" },
  { href: "/app/engagements", label: "Engagements", icon: FileText, match: "/app/engagements" },
  { href: "/app/payments", label: "Payments", icon: Wallet, match: "/app/payments" },
  { href: "/app/activity", label: "Activity", icon: Activity, match: "/app/activity" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/app/business", label: "Business", icon: Building2, match: "/app/business" },
  { href: "/app/settings", label: "Settings", icon: Settings, match: "/app/settings" },
];

export function isActive(pathname: string, item: NavItem): boolean {
  return new RegExp(`^${item.match}`).test(pathname);
}
