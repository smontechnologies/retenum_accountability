import Link from "next/link";
import { ACTIONS, conditionSentence, stepSentence, triggerSentence, type SentenceContext, type WorkflowView } from "@/domain/workflow";
import { cn } from "@/lib/cn";
import { CATEGORY_ICON, TriggerIcon } from "./icons";
import { AddStepButton } from "./pickers";
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
        className={cn("block rounded-panel border bg-raised px-4 py-3", selected === "trigger" ? "border-2 border-fg" : "border-line hover:border-line-strong")}
      >
        <p className="flex items-center gap-1.5 text-caption text-fg-muted"><TriggerIcon aria-hidden className="size-3.5" /> Trigger</p>
        <h2 className="mt-0.5 font-semibold break-words">{triggerSentence(workflow, words)}</h2>
        {workflow.onlyWhen && <p className="mt-1 text-small text-fg-secondary">Only when {conditionSentence(workflow.onlyWhen, words)}</p>}
      </Link>

      <ol className="relative">
        {editable && (
          <li className="flex justify-center py-2" aria-label="Add a step after the trigger">
            <AddStepButton options={options} workflowId={workflow.id} insertAfter="trigger" label="Add a step after the trigger" />
          </li>
        )}
        {!editable && <li aria-hidden className="mx-auto h-4 w-px bg-line-strong" />}
        {workflow.steps.map((s, i) => {
          const a = ACTIONS[s.actionType];
          const Icon = CATEGORY_ICON[a.category];
          return (
            <li key={s.id} className="space-y-0">
              <Link
                href={href(s.id)}
                aria-current={selected === s.id ? "true" : undefined}
                className={cn("flex gap-3 rounded-panel border bg-raised px-4 py-3", selected === s.id ? "border-2 border-fg" : "border-line hover:border-line-strong")}
              >
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-caption font-semibold tabular">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-caption text-fg-muted">
                    <Icon aria-hidden className="size-3.5" /> {a.label}
                    {!a.commercial && <span className="rounded-badge bg-sunken px-1 text-fg-secondary">Helper</span>}
                  </span>
                  <span className="mt-0.5 block font-medium break-words">
                    <span className="sr-only">Step {i + 1}: </span>
                    {stepSentence(s, words)}
                  </span>
                  {s.onlyWhen && <span className="mt-1 block text-small text-fg-secondary">Only when {conditionSentence(s.onlyWhen, words)}</span>}
                </span>
              </Link>
              {editable ? (
                <div className="flex justify-center py-2">
                  <AddStepButton options={options} workflowId={workflow.id} insertAfter={s.id} label={`Add a step after step ${i + 1}`} />
                </div>
              ) : (
                i < workflow.steps.length - 1 && <div aria-hidden className="mx-auto h-4 w-px bg-line-strong" />
              )}
            </li>
          );
        })}
      </ol>
      {workflow.steps.length === 0 && (
        <p className="rounded-panel border border-dashed border-line-strong px-4 py-6 text-center text-small text-fg-secondary">
          {editable ? "No steps yet. Use + to add what happens when this is triggered." : "No steps."}
        </p>
      )}
    </section>
  );
}
