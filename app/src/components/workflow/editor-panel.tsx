"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTIONS, TRIGGERS } from "@/domain/workflow";
import { moveAction, removeStepAction, removeWorkflowAction, setConditionAction, updateStepAction, updateTriggerAction } from "@/app/app/engagements/actions";
import { ConfirmAction, Dialog } from "@/components/ui/dialog";
import { ActionForm } from "@/components/ui/form";
import { ConditionFields, StepFields, TriggerFields } from "./fields";
import type { EditableStep, EditableTrigger, EditorOptions } from "./types";

type Selection = { kind: "trigger"; trigger: EditableTrigger; isFirst: boolean; isLast: boolean } | { kind: "step"; step: EditableStep; number: number; isFirst: boolean; isLast: boolean };

/** Right pane: the property editor for the selected trigger or step (Bubble's property editor). */
export function PropertyEditor({ options, selection, editable, readOnly }: { options: EditorOptions; selection: Selection | null; editable: boolean; readOnly: React.ReactNode }) {
  if (!selection) return <p className="text-small text-fg-secondary">Select the trigger or a step to see its details{editable ? " and edit it" : ""}.</p>;
  if (!editable) return <div className="space-y-2">{readOnly}</div>;
  const hidden = { engagementId: options.engagementId };
  if (selection.kind === "trigger") {
    const t = selection.trigger;
    return (
      <div className="space-y-8">
        <section aria-label="Trigger" className="space-y-3">
          <h2 className="text-h3 font-semibold">Trigger</h2>
          <ActionForm key={t.workflowId} action={updateTriggerAction} submitLabel="Save trigger" successToast="Trigger saved." showSuccessInline={false}>
            <input type="hidden" name="engagementId" value={options.engagementId} />
            <input type="hidden" name="workflowId" value={t.workflowId} />
            <TriggerFields options={options} trigger={t} />
          </ActionForm>
        </section>
        <section aria-label="Workflow condition" className="space-y-3 border-t border-line pt-6">
          <ActionForm key={`c-${t.workflowId}`} action={setConditionAction} submitLabel="Save condition" successToast="Condition saved." showSuccessInline={false}>
            <input type="hidden" name="engagementId" value={options.engagementId} />
            <input type="hidden" name="target" value="workflow" />
            <input type="hidden" name="workflowId" value={t.workflowId} />
            <ConditionFields options={options} condition={t.onlyWhen} />
          </ActionForm>
        </section>
        <section aria-label="Workflow actions" className="flex flex-wrap items-center gap-1 border-t border-line pt-6">
          <MoveButtons hidden={{ ...hidden, workflowId: t.workflowId }} isFirst={selection.isFirst} isLast={selection.isLast} label="workflow" />
          <ConfirmAction
            trigger="Delete workflow"
            triggerVariant="ghost"
            triggerIcon={<Trash2 aria-hidden className="size-4" />}
            confirmVariant="destructive"
            title="Delete this workflow?"
            consequence="The workflow and all its steps are removed from this draft. Nothing has been agreed yet."
            confirmLabel="Delete workflow"
            action={removeWorkflowAction}
            hidden={{ ...hidden, workflowId: t.workflowId }}
          />
        </section>
        <p className="text-caption text-fg-muted">{TRIGGERS[t.triggerType].hint}</p>
      </div>
    );
  }
  const s = selection.step;
  return (
    <div className="space-y-8">
      <section aria-label="Step" className="space-y-3">
        <p className="text-caption text-fg-muted">Step {selection.number}</p>
        <h2 className="text-h3 font-semibold">{ACTIONS[s.actionType].label}</h2>
        <ActionForm key={s.id} action={updateStepAction} submitLabel="Save step" successToast="Step saved." showSuccessInline={false}>
          <input type="hidden" name="engagementId" value={options.engagementId} />
          <input type="hidden" name="stepId" value={s.id} />
          <StepFields actionType={s.actionType} options={options} step={s} />
        </ActionForm>
      </section>
      <section aria-label="Step condition" className="space-y-3 border-t border-line pt-6">
        <ActionForm key={`c-${s.id}`} action={setConditionAction} submitLabel="Save condition" successToast="Condition saved." showSuccessInline={false}>
          <input type="hidden" name="engagementId" value={options.engagementId} />
          <input type="hidden" name="target" value="step" />
          <input type="hidden" name="stepId" value={s.id} />
          <ConditionFields options={options} condition={s.onlyWhen} />
        </ActionForm>
      </section>
      <section aria-label="Step actions" className="flex flex-wrap items-center gap-1 border-t border-line pt-6">
        <MoveButtons hidden={{ ...hidden, stepId: s.id }} isFirst={selection.isFirst} isLast={selection.isLast} label="step" />
        <ConfirmAction
          trigger="Delete step"
          triggerVariant="ghost"
          triggerIcon={<Trash2 aria-hidden className="size-4" />}
          confirmVariant="destructive"
          title="Delete this step?"
          consequence="It's removed from this draft. Nothing has been agreed yet."
          confirmLabel="Delete step"
          action={removeStepAction}
          hidden={{ ...hidden, stepId: s.id, workflowId: s.workflowId }}
        />
      </section>
    </div>
  );
}

function MoveButtons({ hidden, isFirst, isLast, label }: { hidden: Record<string, string>; isFirst: boolean; isLast: boolean; label: string }) {
  const btn = (direction: "up" | "down", disabled: boolean) => {
    if (disabled) return null;
    const Icon = direction === "up" ? ArrowUp : ArrowDown;
    return (
      <form action={moveAction}>
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <input type="hidden" name="direction" value={direction} />
        <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-small hover:bg-surface">
          <Icon aria-hidden className="size-4" /> Move {label} {direction}
        </button>
      </form>
    );
  };
  return (
    <>
      {btn("up", isFirst)}
      {btn("down", isLast)}
    </>
  );
}

/**
 * The property editor lives in exactly one place: the right pane on wide screens (xl), a bottom sheet
 * on phones and tablets (FR-WF-02). Before hydration it renders as the right pane (CSS-hidden below xl),
 * so desktop works without JavaScript.
 */
export function PropertyPane({ open, title, closeHref, children }: { open: boolean; title: string; closeHref: string; children: React.ReactNode }) {
  const router = useRouter();
  const [wide, setWide] = useState<boolean | null>(null);
  const [isOpen, setOpen] = useState(open);
  useEffect(() => setOpen(open), [open]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 80rem)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  if (wide !== false) {
    return <aside aria-label="Property editor" className="hidden rounded-panel border border-line bg-raised p-4 xl:block xl:self-start">{children}</aside>;
  }
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setOpen(false);
        router.replace(closeHref, { scroll: false });
      }}
      title={title}
      variant="drawer"
    >
      {isOpen ? children : null}
    </Dialog>
  );
}
