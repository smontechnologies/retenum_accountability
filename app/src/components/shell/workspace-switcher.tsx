"use client";

import { useRef } from "react";
import { ChevronsUpDown } from "lucide-react";
import { switchWorkspaceAction } from "@/app/app/settings-actions";

/** Workspace switcher at the top of the sidebar (UI/UX §1). Only the user's own workspaces are listed. */
export function WorkspaceSwitcher({ current, workspaces }: { current: { id: string; name: string } | null; workspaces: Array<{ id: string; name: string }> }) {
  const form = useRef<HTMLFormElement>(null);
  if (!current) return null;
  if (workspaces.length < 2) {
    return <p className="truncate rounded-control border border-line px-3 py-2 text-small font-medium" title={current.name}>{current.name}</p>;
  }
  return (
    <form ref={form} action={switchWorkspaceAction} className="relative">
      <label htmlFor="ws-switch" className="sr-only">Current workspace</label>
      <select
        id="ws-switch"
        name="workspaceId"
        defaultValue={current.id}
        onChange={() => form.current?.requestSubmit()}
        className="w-full appearance-none truncate rounded-control border border-line-strong bg-raised py-2 pr-8 pl-3 text-small font-medium"
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <ChevronsUpDown aria-hidden className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-fg-muted" />
      <noscript><button type="submit" className="mt-2 text-small underline">Switch</button></noscript>
    </form>
  );
}
