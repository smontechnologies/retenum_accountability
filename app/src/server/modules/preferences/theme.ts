import { eq } from "drizzle-orm";
import type { Database } from "../../db/client";
import { userPreferences } from "../../db/schema";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = "rtn_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months

export const isTheme = (v: unknown): v is Theme => typeof v === "string" && (THEMES as readonly string[]).includes(v);

/** Cookie value → theme, defaulting to following the system. */
export function themeFromCookie(value: string | undefined): Theme {
  return isTheme(value) ? value : "system";
}

export async function getUserTheme(db: Database, userId: string): Promise<Theme> {
  const [row] = await db.select({ theme: userPreferences.theme }).from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return isTheme(row?.theme) ? row.theme : "system";
}

export async function setUserTheme(db: Database, userId: string, theme: Theme): Promise<void> {
  if (!isTheme(theme)) throw new Error("Invalid theme");
  await db
    .insert(userPreferences)
    .values({ userId, theme, updatedAt: new Date() })
    .onConflictDoUpdate({ target: userPreferences.userId, set: { theme, updatedAt: new Date() } });
}
