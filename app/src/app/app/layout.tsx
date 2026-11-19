import { LogOut } from "lucide-react";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getUserTheme } from "@/server/modules/preferences/theme";
import { getCurrentWorkspace } from "@/server/modules/workspaces/current";
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
  const signOut = (
    <form action={signOutAction}>
      <p className="truncate px-3 text-caption text-fg-muted" title={actor.email}>{actor.email}</p>
      <button type="submit" className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-small text-fg-secondary hover:bg-raised hover:text-fg">
        <LogOut aria-hidden className="size-5" /> Sign out
      </button>
    </form>
  );
  return (
    <div className="min-h-dvh md:flex">
      <ThemeSync theme={theme} />
      <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 border-r border-line bg-surface p-4 lg:block">
        <SideNav header={<div className="space-y-4"><Wordmark /><WorkspaceSwitcher current={current} workspaces={memberships} /></div>} footer={signOut} />
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-18 shrink-0 border-r border-line bg-surface p-3 md:block lg:hidden">
        <SideNav compact header={<div className="flex justify-center"><Wordmark compact /></div>} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 backdrop-blur-sm lg:hidden">
          <Wordmark />
          {current && <span className="max-w-[50%] truncate text-small text-fg-secondary">{current.name}</span>}
        </header>
        <main id="main" className="mx-auto w-full max-w-[77.5rem] px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">
          {children}
        </main>
      </div>
      <BottomNav signOut={signOutAction} email={actor.email} />
    </div>
  );
}
