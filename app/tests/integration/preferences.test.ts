import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../helpers/db";
import { createUser } from "../helpers/users";
import { createAuth } from "@/server/auth/auth";
import type { Database } from "@/server/db/client";
import { getUserTheme, setUserTheme, themeFromCookie } from "@/server/modules/preferences/theme";

let db: Database;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(async () => close());

describe("theme preference (DES-02/03)", () => {
  it("defaults to system, saves and updates the choice", async () => {
    const u = await createUser(db, createAuth(db), "Theme User", "theme@example.com");
    expect(await getUserTheme(db, u.userId)).toBe("system");
    await setUserTheme(db, u.userId, "dark");
    expect(await getUserTheme(db, u.userId)).toBe("dark");
    await setUserTheme(db, u.userId, "light");
    expect(await getUserTheme(db, u.userId)).toBe("light");
  });

  it("rejects invalid themes", async () => {
    const u = await createUser(db, createAuth(db), "Theme Two", "theme2@example.com");
    // @ts-expect-error deliberate misuse
    await expect(setUserTheme(db, u.userId, "neon")).rejects.toThrow("Invalid theme");
  });

  it("reads cookie values safely", () => {
    expect(themeFromCookie("dark")).toBe("dark");
    expect(themeFromCookie(undefined)).toBe("system");
    expect(themeFromCookie("<script>")).toBe("system");
  });
});
