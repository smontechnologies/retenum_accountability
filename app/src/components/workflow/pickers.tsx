"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ACTIONS, CATEGORY_ORDER, V1_ACTIONS, type ActionType } from "@/domain/workflow";
import { addStepAction, addWorkflowAction } from "@/app/app/engagements/actions";
import { Dialog } from "@/components/ui/dialog";
import { ActionForm } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { StepFields, TriggerFields } from "./fields";
import { CATEGORY_ICON } from "./icons";
import type { EditorOptions } from "./types";

/**
 * The "+" under a trigger or step (Bubble's action picker, FR-WF-02/04): a categorised menu of step
 * types; choosing one opens its form. `insertAfter` places the new step right below.
 */
export function AddStepButton({ options, workflowId, insertAfter, label = "Add a step", variant = "inline" }: {
  options: EditorOptions;
  workflowId: string;
  insertAfter?: string;
  label?: string;
  variant?: "inline" | "block";
}) {
  const [menu, setMenu] = useState(false);
  const [type, setType] = useState<ActionType | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setMenu(true)}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-2 text-small font-medium",
          variant === "block"
            ? "min-h-10 w-full rounded-panel border border-dashed border-line-strong hover:bg-surface"
            : "relative size-7 rounded-full border border-line-strong bg-bg text-fg-secondary hover:border-fg hover:text-fg",
        )}
      >
        <Plus aria-hidden className={variant === "block" ? "size-4" : "size-3.5"} />
        {variant === "block" && label}
      </button>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Add a step" description="Choose what happens at this point in the workflow." variant="drawer">
        <div className="space-y-5">
          {CATEGORY_ORDER.map((cat) => {
            const Icon = CATEGORY_ICON[cat];
            const items = V1_ACTIONS.filter((a) => ACTIONS[a].category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} aria-label={cat}>
                <h3 className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-fg-secondary"><Icon aria-hidden className="size-3.5" /> {cat}</h3>
                <ul className="space-y-2">
                  {items.map((a) => (
                    <li key={a}>
                      <button
                        type="button"
                        onClick={() => {
                          setMenu(false);
                          setType(a);
                        }}
                        className="flex min-h-12 w-full flex-col items-start rounded-control border border-line-strong px-3 py-2.5 text-left hover:bg-surface"
                      >
                        <span className="text-small font-semibold">{ACTIONS[a].label}</span>
                        <span className="text-caption text-fg-muted">{ACTIONS[a].hint}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Dialog>
      {type && (
        <Dialog open onClose={() => setType(null)} title={ACTIONS[type].label} description={ACTIONS[type].hint} variant="drawer">
          <ActionForm action={addStepAction} submitLabel="Add step" pendingLabel="Adding…" successToast="Step added." showSuccessInline={false} onSuccess={() => setType(null)} block>
            <input type="hidden" name="engagementId" value={options.engagementId} />
            <input type="hidden" name="workflowId" value={workflowId} />
            <input type="hidden" name="actionType" value={type} />
            {insertAfter && <input type="hidden" name="insertAfter" value={insertAfter} />}
            <StepFields actionType={type} options={options} />
          </ActionForm>
        </Dialog>
      )}
    </>
  );
}

/** "+ New workflow": choose what starts it (Bubble's event picker). */
export function NewWorkflowButton({ options }: { options: EditorOptions }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-10 w-full items-center gap-2 rounded-control px-2.5 text-small font-medium text-fg-secondary hover:bg-surface hover:text-fg">
        <Plus aria-hidden className="size-4" /> New workflow
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New workflow" description="Choose what starts it. You'll add its steps next." variant="drawer">
        {open && (
          <ActionForm action={addWorkflowAction} submitLabel="Create workflow" pendingLabel="Creating…" block>
            <input type="hidden" name="engagementId" value={options.engagementId} />
            <TriggerFields options={options} />
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}
