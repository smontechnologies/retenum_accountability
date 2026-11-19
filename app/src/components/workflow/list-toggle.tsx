"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Below lg the workflow list collapses to one line ("Workflows (3) · current") so the canvas is
 * visible straight away. From lg it is always shown as the left pane. Rendered once (no duplicates).
 */
export function WorkflowListToggle({ count, current, children }: { count: number; current: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Picking a workflow collapses the list again so the canvas comes back into view.
  useEffect(() => setOpen(false), [current]);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="workflow-list"
        onClick={() => setOpen(!open)}
        className="flex min-h-10 w-full items-center gap-2 rounded-control px-2.5 text-left text-small lg:hidden"
      >
        <span className="shrink-0 font-semibold">Workflows ({count})</span>
        <span className="min-w-0 truncate text-fg-secondary">· {current}</span>
        <ChevronDown aria-hidden className={cn("ml-auto size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <div id="workflow-list" className={cn(open ? "block border-t border-line pt-1.5" : "hidden", "lg:block lg:border-0 lg:pt-0")}>
        {children}
      </div>
    </>
  );
}
