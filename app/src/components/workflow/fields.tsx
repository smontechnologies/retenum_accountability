"use client";

import { useState } from "react";
import { ACTIONS, TRIGGERS, V1_TRIGGERS, type ActionType, type Condition, type TriggerType } from "@/domain/workflow";
import { Field, SelectField, TextareaField } from "@/components/ui/form";
import type { EditableStep, EditableTrigger, EditorOptions, Option } from "./types";

const opts = (list: Option[], empty: string) => (list.length ? list.map((o) => ({ value: o.id, label: o.label })) : [{ value: "", label: empty }]);

/** Trigger fields: the parameter shown depends on what the trigger watches (FR-WF-03). */
export function TriggerFields({ options, trigger, editableType = true }: { options: EditorOptions; trigger?: EditableTrigger; editableType?: boolean }) {
  const [type, setType] = useState<TriggerType>(trigger?.triggerType ?? "deliverable_accepted");
  const [dateMode, setDateMode] = useState<"date" | "after">(trigger?.triggerParams.afterDays ? "after" : "date");
  const needs = TRIGGERS[type].needs;
  const p = trigger?.triggerParams ?? {};
  return (
    <div className="space-y-5">
      {editableType ? (
        <div className="space-y-1.5">
          <label htmlFor="trigger-type" className="block text-small font-medium">When this happens</label>
          <select id="trigger-type" name="triggerType" value={type} onChange={(e) => setType(e.target.value as TriggerType)} className="w-full rounded-control border border-line-strong bg-raised px-3 py-2.5 text-body">
            {(V1_TRIGGERS.includes(type) ? V1_TRIGGERS : [...V1_TRIGGERS, type]).map((t) => (
              <option key={t} value={t}>{TRIGGERS[t].label}</option>
            ))}
          </select>
          <p className="text-caption text-fg-muted">{TRIGGERS[type].hint}</p>
        </div>
      ) : (
        <input type="hidden" name="triggerType" value={type} />
      )}
      {needs === "deliverable" && <SelectField name="commitmentId" label="Which deliverable" defaultValue={p.commitmentId} options={opts(options.deliverables, "Add a deliverable step first")} />}
      {needs === "obligation" && <SelectField name="commitmentId" label="Which item" defaultValue={p.commitmentId} options={opts(options.obligations, "Add a 'party provides' step first")} />}
      {needs === "payment" && <SelectField name="commitmentId" label="Which payment" defaultValue={p.commitmentId} options={opts(options.payments, "Add a payment step first")} />}
      {needs === "workflow" && <SelectField name="workflowId" label="After which workflow" defaultValue={p.workflowId} options={opts(options.workflows.filter((w) => w.id !== trigger?.workflowId), "Add another workflow first")} />}
      {needs === "days" && <Field name="days" label="Working days without a response" type="number" min={1} max={30} defaultValue={p.days ?? 3} />}
      {needs === "date" && (
        <fieldset className="space-y-3">
          <legend className="text-small font-medium">When</legend>
          <div className="flex flex-wrap gap-4 text-small">
            <label className="flex min-h-11 items-center gap-2"><input type="radio" checked={dateMode === "date"} onChange={() => setDateMode("date")} className="size-4 accent-[var(--fg)]" /> On a date</label>
            <label className="flex min-h-11 items-center gap-2"><input type="radio" checked={dateMode === "after"} onChange={() => setDateMode("after")} className="size-4 accent-[var(--fg)]" /> Days after confirmation</label>
          </div>
          {dateMode === "date" ? <Field name="date" label="Date" type="date" defaultValue={p.date ?? ""} /> : <Field name="afterDays" label="Days after the agreement is confirmed" type="number" min={1} max={365} defaultValue={p.afterDays ?? 14} />}
        </fieldset>
      )}
    </div>
  );
}

/** Fields for one step type (FR-WF-04). Used both when adding and when editing. */
export function StepFields({ actionType, options, step }: { actionType: ActionType; options: EditorOptions; step?: EditableStep }) {
  const c = step?.commitment;
  const p = step?.params ?? {};
  const who = [
    { value: "both", label: `Both parties` },
    { value: "payer", label: `${options.payerName} (paying)` },
    { value: "payee", label: `${options.payeeName} (being paid)` },
  ];
  switch (actionType) {
    case "start_deliverable":
      return (
        <div className="space-y-5">
          <Field name="title" label="What will be delivered" defaultValue={c?.title} required />
          <Field name="price" label="Price (₦)" inputMode="decimal" hint="Use 0 if it's included at no extra cost." defaultValue={c?.price ?? ""} required />
          <TextareaField name="definitionOfDone" label="Definition of done" hint="What has to be true for this to count as delivered." rows={3} defaultValue={c?.definitionOfDone ?? ""} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="quantity" label="Quantity (optional)" inputMode="decimal" defaultValue={c?.quantity ?? ""} />
            <Field name="unit" label="Unit (optional)" defaultValue={c?.unit ?? ""} />
          </div>
          <Field name="dueDate" label="Due date (optional)" type="date" defaultValue={c?.dueDate ?? ""} />
          <TextareaField name="exclusions" label="Not included (optional)" rows={2} defaultValue={c?.exclusions ?? ""} />
        </div>
      );
    case "make_payment_due":
      return (
        <div className="space-y-5">
          <Field name="title" label="Payment name" hint="For example: Deposit, Second instalment, Balance." defaultValue={c?.title} required />
          <Field name="amount" label="Amount (₦)" inputMode="decimal" defaultValue={c?.price ?? ""} required />
          <Field name="termsDays" label="Days to pay after it becomes due (optional)" type="number" min={0} max={365} defaultValue={c?.termsDays ?? ""} />
          <p className="text-caption text-fg-muted">It becomes due when this workflow runs.</p>
        </div>
      );
    case "party_provides":
      return (
        <div className="space-y-5">
          <SelectField name="owedBySide" label="Who provides it" defaultValue={c?.owedBySide ?? "payer"} options={who.slice(1)} />
          <Field name="title" label="What they provide" hint="Access, materials, information or approvals." defaultValue={c?.title} required />
          <Field name="dueDate" label="By when (optional)" type="date" defaultValue={c?.dueDate ?? ""} />
          <TextareaField name="description" label="Notes (optional)" rows={2} defaultValue={c?.description ?? ""} />
        </div>
      );
    case "require_evidence":
    case "ask_to_accept":
      return <SelectField name="commitmentId" label="Which deliverable" defaultValue={p.commitmentId} options={opts(options.deliverables, "Add a deliverable step first")} />;
    case "request_payment":
      return <SelectField name="commitmentId" label="Which payment" defaultValue={p.commitmentId} options={opts(options.payments, "Add a payment step first")} />;
    case "notify":
      return (
        <div className="space-y-5">
          <SelectField name="who" label="Who to notify" defaultValue={p.who ?? "both"} options={who} />
          <TextareaField name="message" label="Message" rows={3} defaultValue={p.message ?? ""} />
        </div>
      );
    case "remind":
      return (
        <div className="space-y-5">
          <SelectField name="who" label="Who to remind" defaultValue={p.who ?? "both"} options={who} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="afterDays" label="After (days)" type="number" min={1} max={90} defaultValue={p.afterDays ?? 1} />
            <Field name="repeatDays" label="Repeat every (days, optional)" type="number" min={1} max={90} defaultValue={p.repeatDays ?? ""} />
          </div>
          <TextareaField name="message" label="Message (optional)" rows={2} defaultValue={p.message ?? ""} />
        </div>
      );
    case "unlock_workflow":
      return <SelectField name="workflowId" label="Which workflow to start" defaultValue={p.workflowId} options={opts(options.workflows.filter((w) => w.id !== step?.workflowId), "Add another workflow first")} />;
    case "stop_workflow":
      return <p className="text-small text-fg-secondary">{ACTIONS.stop_workflow.hint}</p>;
  }
}

/** Guided "Only when" builder (FR-WF-05): no free-form expressions. */
export function ConditionFields({ options, condition }: { options: EditorOptions; condition: Condition | null }) {
  const [type, setType] = useState<string>(condition?.type ?? "none");
  const amount = condition?.amountMinor ? (Number(BigInt(condition.amountMinor)) / 100).toString() : "";
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="condition-type" className="block text-small font-medium">Only when</label>
        <select id="condition-type" name="conditionType" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-control border border-line-strong bg-raised px-3 py-2.5 text-body">
          <option value="none">Always (no condition)</option>
          <option value="deliverable_accepted">A deliverable has been accepted</option>
          <option value="delivered_before">A deliverable was delivered before a date</option>
          <option value="paid_in_full">A payment has been paid in full</option>
          <option value="change_confirmed">A change has been confirmed</option>
          <option value="days_since_trigger">Days since the trigger</option>
          <option value="outstanding_amount">The amount outstanding</option>
        </select>
      </div>
      {(type === "deliverable_accepted" || type === "delivered_before") && <SelectField name="conditionCommitmentId" label="Which deliverable" defaultValue={condition?.commitmentId} options={opts(options.deliverables, "No deliverables yet")} />}
      {type === "paid_in_full" && <SelectField name="conditionCommitmentId" label="Which payment" defaultValue={condition?.commitmentId} options={opts(options.payments, "No payments yet")} />}
      {type === "delivered_before" && <Field name="conditionDate" label="Before" type="date" defaultValue={condition?.date ?? ""} />}
      {(type === "days_since_trigger" || type === "outstanding_amount") && (
        <SelectField name="conditionOp" label="Is" defaultValue={condition?.op ?? "more"} options={[{ value: "more", label: "More than" }, { value: "less", label: "Less than" }]} />
      )}
      {type === "days_since_trigger" && <Field name="conditionDays" label="Days" type="number" min={1} max={365} defaultValue={condition?.days ?? 7} />}
      {type === "outstanding_amount" && <Field name="conditionAmount" label="Amount (₦)" inputMode="decimal" defaultValue={amount} />}
    </div>
  );
}
