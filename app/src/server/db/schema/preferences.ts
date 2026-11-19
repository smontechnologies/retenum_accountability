import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Per-user preferences that follow the user across devices (DES-03). */
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"), // 'light' | 'dark' | 'system'
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
