import Link from "next/link";
import { ACTIONS, conditionSentence, stepSentence, triggerSentence, type SentenceContext, type WorkflowView } from "@/domain/workflow";
import { cn } from "@/lib/cn";
import { CATEGORY_ICON, TriggerIcon } from "./icons";
import { AddStepButton } from "./pickers";

/** The vertical line joining cards, with the small "+" sitting on it (Bubble-style). */
const CONNECTOR = "relative flex justify-center py-1 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-line-strong";
import type { EditorOptions } from "./types";

/**
 * Centre pane: Bubble's vertical canvas. The trigger card sits on top; numbered step cards follow,
 * joined by a line, each showing its category, sentence and Only-when condition. A "+" sits after the
 * trigger and after every step (FR-WF-02).
 */
export function Canvas({ workflow, words, base, selected, options, editable }: {
  workflow: WorkflowView;
  words: SentenceContext;
  base: string;
  selected?: string;
  options: EditorOptions;
  editable: boolean;
}) {
  const href = (s: string) => `${base}?w=${workflow.id}&s=${s}`;
  return (
    <section aria-label="Workflow canvas" className="space-y-0">
      <Link
        href={href("trigger")}
        aria-current={selected === "trigger" ? "true" : undefined}
        className={cn("block rounded-panel border bg-raised px-3 py-2", selected === "trigger" ? "border-fg ring-1 ring-fg" : "border-line hover:border-line-strong")}
      >
        <p className="flex items-center gap-1.5 text-caption text-fg-muted"><TriggerIcon aria-hidden className="size-3.5" /> Trigger</p>
        <h2 className="font-semibold break-words">{triggerSentence(workflow, words)}</h2>
        {workflow.onlyWhen && <p className="text-small text-fg-secondary">Only when {conditionSentence(workflow.onlyWhen, words)}</p>}
      </Link>

      <ol className="relative">
        {editable && (
          <li className={CONNECTOR} aria-label="Add a step after the trigger">
            <AddStepButton options={options} workflowId={workflow.id} insertAfter="trigger" label="Add a step after the trigger" />
          </li>
        )}
        {!editable && <li aria-hidden className="mx-auto h-3 w-px bg-line-strong" />}
        {workflow.steps.map((s, i) => {
          const a = ACTIONS[s.actionType];
          const Icon = CATEGORY_ICON[a.category];
          return (
            <li key={s.id} className="space-y-0">
              <Link
                href={href(s.id)}
                aria-current={selected === s.id ? "true" : undefined}
                className={cn("flex gap-2.5 rounded-panel border bg-raised px-3 py-2", selected === s.id ? "border-fg ring-1 ring-fg" : "border-line hover:border-line-strong")}
              >
                <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-caption font-semibold tabular">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-caption text-fg-muted">
                    <Icon aria-hidden className="size-3.5" /> {a.label}
                    {!a.commercial && <span className="rounded-badge bg-sunken px-1 text-fg-secondary">Helper</span>}
                  </span>
                  <span className="block text-small font-medium break-words sm:text-body">
                    <span className="sr-only">Step {i + 1}: </span>
                    {stepSentence(s, words)}
                  </span>
                  {s.onlyWhen && <span className="block text-small text-fg-secondary">Only when {conditionSentence(s.onlyWhen, words)}</span>}
                </span>
              </Link>
              {editable ? (
                <div className={CONNECTOR}>
                  <AddStepButton options={options} workflowId={workflow.id} insertAfter={s.id} label={`Add a step after step ${i + 1}`} />
                </div>
              ) : (
                i < workflow.steps.length - 1 && <div aria-hidden className="mx-auto h-3 w-px bg-line-strong" />
              )}
            </li>
          );
        })}
      </ol>
      {workflow.steps.length === 0 && (
        <p className="rounded-panel border border-dashed border-line-strong px-3 py-4 text-center text-small text-fg-secondary">
          {editable ? "No steps yet. Use + to add what happens when this is triggered." : "No steps."}
        </p>
      )}
    </section>
  );
}
