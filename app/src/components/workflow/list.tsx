import Link from "next/link";
import { groupOf, triggerSentence, type Group, type SentenceContext, type WorkflowView } from "@/domain/workflow";
import { cn } from "@/lib/cn";
import { NewWorkflowButton } from "./pickers";
import type { EditorOptions } from "./types";

const ORDER: Group[] = ["Agreement", "Delivery", "Payments", "Changes", "Reminders"];

/** Left pane: workflows grouped like Bubble's folders (FR-WF-02). */
export function WorkflowList({ workflows, words, selected, base, options, editable }: {
  workflows: WorkflowView[];
  words: SentenceContext;
  selected?: string;
  base: string;
  options: EditorOptions;
  editable: boolean;
}) {
  return (
    <nav aria-label="Workflows" className="space-y-4">
      {ORDER.map((g) => {
        const items = workflows.filter((w) => groupOf(w) === g);
        if (items.length === 0) return null;
        return (
          <section key={g} aria-label={g}>
            <h2 className="mb-1 px-3 text-caption font-semibold text-fg-muted">{g}</h2>
            <ul className="space-y-0.5">
              {items.map((w) => {
                const active = w.id === selected;
                return (
                  <li key={w.id}>
                    <Link
                      href={`${base}?w=${w.id}`}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex min-h-11 items-start gap-2 rounded-control px-3 py-2 text-small", active ? "bg-raised font-semibold ring-1 ring-line" : "text-fg-secondary hover:bg-raised hover:text-fg")}
                    >
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-fg" />
                      <span className="min-w-0">
                        <span className="block break-words">{triggerSentence(w, words)}</span>
                        <span className="block text-caption font-normal text-fg-muted">{w.steps.length} step{w.steps.length === 1 ? "" : "s"}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {editable && <NewWorkflowButton options={options} />}
    </nav>
  );
}
