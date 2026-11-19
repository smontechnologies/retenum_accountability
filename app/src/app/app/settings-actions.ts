"use server";

import { secureCookies } from "@/server/lib/env";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import type { FormState } from "@/server/lib/form-state";
import { isTheme, setUserTheme, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from "@/server/modules/preferences/theme";
import { listWorkspacesForUser } from "@/server/modules/workspaces/service";
import { WORKSPACE_COOKIE } from "@/server/modules/workspaces/current";

const cookieOptions = { path: "/", sameSite: "lax" as const, maxAge: THEME_COOKIE_MAX_AGE, secure: secureCookies() };

/** DES-02/03: saves to the account (cross-device) and to a cookie (no flash on next load). */
export async function setThemeAction(_: FormState, data: FormData): Promise<FormState> {
  const actor = await requireActor();
  const theme = data.get("theme");
  if (!isTheme(theme)) return { status: "error", message: "Choose light, dark or system." };
  await setUserTheme(getDb(), actor.userId, theme);
  (await cookies()).set(THEME_COOKIE, theme, cookieOptions);
  // No revalidatePath here: the page already applied the theme instantly, the next request reads the
  // cookie, and re-rendering the whole layout inside this action re-checked the session against the
  // mutated cookie header and signed the user out (found in e2e, 19 Nov 2026).
  return { status: "success", message: "Appearance saved." };
}

/** Switch the current workspace; only to workspaces the user belongs to. */
export async function switchWorkspaceAction(data: FormData): Promise<void> {
  const actor = await requireActor();
  const id = String(data.get("workspaceId") ?? "");
  const memberships = await listWorkspacesForUser(getDb(), actor.userId);
  if (memberships.some((m) => m.id === id)) {
    (await cookies()).set(WORKSPACE_COOKIE, id, { ...cookieOptions, httpOnly: true });
  }
  redirect("/app/business");
}
