import Link from "next/link";
import { requireActor } from "@/server/auth/session";
import { signOutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireActor();
  return (
    <div className="space-y-6">
      <nav aria-label="Account" className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3 text-sm">
        <Link href="/app" className="font-semibold">
          Retenum
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-[var(--muted)] sm:inline">{actor.email}</span>
          <form action={signOutAction}>
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
