"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { Theme } from "@/server/modules/preferences/theme";
import { setThemeAction } from "@/app/app/settings-actions";
import { ActionForm } from "./form";

const OPTIONS: Array<{ value: Theme; label: string; hint: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", hint: "White background, black text", Icon: Sun },
  { value: "dark", label: "Dark", hint: "Near-black background, white text", Icon: Moon },
  { value: "system", label: "System", hint: "Match this device's setting", Icon: Monitor },
];

/** Settings → Appearance (DES-02). Applies instantly on this device; saved to the account on submit. */
export function ThemeSelect({ current }: { current: Theme }) {
  return (
    <ActionForm action={setThemeAction} submitLabel="Save appearance" successToast="Appearance saved." showSuccessInline={false}>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-small font-medium">Theme</legend>
        {OPTIONS.map(({ value, label, hint, Icon }) => (
          <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border border-line-strong px-3 py-2.5 has-[:checked]:border-2 has-[:checked]:border-fg">
            <input
              type="radio"
              name="theme"
              value={value}
              defaultChecked={current === value}
              onChange={() => document.documentElement.setAttribute("data-theme", value)}
              className="size-4 accent-[var(--fg)]"
            />
            <Icon aria-hidden className="size-4" />
            <span className="flex flex-col">
              <span className="text-small font-medium">{label}</span>
              <span className="text-caption text-fg-muted">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </ActionForm>
  );
}
