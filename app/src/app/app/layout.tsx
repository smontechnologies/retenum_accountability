import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getUserTheme } from "@/server/modules/preferences/theme";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
import { isCounterpartyAnywhere } from "@/server/modules/engagements/service";
import { Wordmark } from "@/components/shell/brand";
import { BottomNav, SideNav } from "@/components/shell/nav";
import { ThemeSync } from "@/components/shell/status-banners";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";
import { signOutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

/** App shell (UI/UX §2–§3): sidebar ≥ lg, icon rail at md, top bar + bottom nav below md. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireActor();
  const db = getDb();
  const [{ current, memberships }, theme] = await Promise.all([getCurrentWorkspace(db, actor), getUserTheme(db, actor.userId)]);
  // FR-ONB-01: no app screen without a workspace — except counterparty-only users, who take part in
  // engagements they were invited to without a workspace of their own (D-43).
  if (!current && !(await isCounterpartyAnywhere(db, actor.userId))) redirect("/onboarding");
  const signOut = (
    <form action={signOutAction}>
      <p className="truncate px-2 text-caption text-fg-muted" title={actor.email}>{actor.email}</p>
      <button type="submit" className="mt-1 flex min-h-8 w-full items-center gap-2.5 rounded-control px-2 text-small text-fg-secondary hover:bg-sunken/60 hover:text-fg">
        <LogOut aria-hidden className="size-4" /> Sign out
      </button>
    </form>
  );
  return (
    <div className="min-h-dvh md:flex">
      <ThemeSync theme={theme} />
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 border-r border-line bg-surface px-2.5 py-3 lg:block">
        <SideNav header={<div className="space-y-2.5 px-0.5"><Wordmark /><WorkspaceSwitcher current={current} workspaces={memberships} /></div>} footer={signOut} />
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-18 shrink-0 border-r border-line bg-surface p-3 md:block lg:hidden">
        <SideNav compact header={<div className="flex justify-center"><Wordmark compact /></div>} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 backdrop-blur-sm lg:hidden">
          <Wordmark />
          {current && <span className="max-w-[50%] truncate text-small text-fg-secondary">{current.name}</span>}
        </header>
        <main id="main" className="mx-auto w-full max-w-[77.5rem] px-4 pt-5 pb-28 md:px-6 md:pt-6 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav signOut={signOutAction} email={actor.email} />
    </div>
  );
}
