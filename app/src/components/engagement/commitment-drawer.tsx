"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ActionForm, Field, SelectField, TextareaField } from "@/components/ui/form";
import { saveCommitmentAction } from "@/app/app/engagements/actions";

export type Kind = "deliverable" | "party_obligation" | "payment_obligation";

/** Serialisable commitment values for editing (prices as decimal strings). */
export interface EditableCommitment {
  id: string;
  kind: Kind;
  owedBySide: "payer" | "payee";
  title: string;
  description: string | null;
  quantity: string | null;
  unit: string | null;
  definitionOfDone: string | null;
  dueDate: string | null;
  exclusions: string | null;
  price: string | null;
  trigger: string | null;
  triggerDate: string | null;
  termsDays: number | null;
  linkedCommitmentId: string | null;
}

const TITLES: Record<Kind, [string, string]> = {
  deliverable: ["Add a deliverable", "Edit deliverable"],
  party_obligation: ["Add something a party provides", "Edit what a party provides"],
  payment_obligation: ["Add a payment", "Edit payment"],
};

/** Drawer form for adding or editing one commitment (UI/UX §6, design system Drawer). */
export function CommitmentDrawer({
  engagementId,
  kind,
  existing,
  deliverables,
  payerName,
  payeeName,
  label,
  preset,
  triggerStyle = "button",
}: {
  engagementId: string;
  kind: Kind;
  existing?: EditableCommitment;
  deliverables: Array<{ id: string; title: string }>;
  payerName: string;
  payeeName: string;
  label: string;
  /** Pre-attach a payment to its trigger (the "+" under a step, like a Bubble action under its event). */
  preset?: { trigger: "on_confirmation" | "on_acceptance" | "on_date" | "on_request"; linkedCommitmentId?: string; context: string };
  triggerStyle?: "button" | "inline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {existing ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)} icon={<Pencil aria-hidden className="size-4" />} aria-label={`Edit ${existing.title}`}>
          Edit
        </Button>
      ) : triggerStyle === "inline" ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-small font-medium text-fg-secondary hover:bg-surface hover:text-fg">
          <Plus aria-hidden className="size-4" /> {label}
        </button>
      ) : (
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)} icon={<Plus aria-hidden className="size-4" />}>
          {label}
        </Button>
      )}
      <CommitmentFormDialog open={open} onClose={() => setOpen(false)} engagementId={engagementId} kind={kind} existing={existing} deliverables={deliverables} payerName={payerName} payeeName={payeeName} preset={preset} />
    </>
  );
}

/** The add/edit form in a drawer. Shared by per-step "+" buttons and the "+ Add step" menu. */
export function CommitmentFormDialog({
  open,
  onClose,
  engagementId,
  kind,
  existing,
  deliverables,
  payerName,
  payeeName,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  engagementId: string;
  kind: Kind;
  existing?: EditableCommitment;
  deliverables: Array<{ id: string; title: string }>;
  payerName: string;
  payeeName: string;
  preset?: { trigger: "on_confirmation" | "on_acceptance" | "on_date" | "on_request"; linkedCommitmentId?: string; context: string };
}) {
  const [trigger, setTrigger] = useState(existing?.trigger ?? preset?.trigger ?? "on_confirmation");
  const title = TITLES[kind][existing ? 1 : 0];
  const setOpen = (v: boolean) => (v ? undefined : onClose());
  return (
    <>
      <Dialog open={open} onClose={onClose} title={title} description={preset?.context} variant="drawer">
        {open && (
          <ActionForm action={saveCommitmentAction} submitLabel={existing ? "Save changes" : "Add to agreement"} successToast={existing ? "Step updated." : "Step added."} showSuccessInline={false} onSuccess={() => setOpen(false)} block>
            <input type="hidden" name="engagementId" value={engagementId} />
            <input type="hidden" name="kind" value={kind} />
            {existing && <input type="hidden" name="commitmentId" value={existing.id} />}

            {kind === "deliverable" && (
              <>
                <Field name="title" label="What will be delivered" defaultValue={existing?.title} required />
                <Field name="price" label="Price (₦)" inputMode="decimal" hint="Use 0 if it's included at no extra cost." defaultValue={existing?.price ?? ""} required />
                <TextareaField name="definitionOfDone" label="Definition of done" hint="What has to be true for this to count as delivered." rows={3} defaultValue={existing?.definitionOfDone ?? ""} />
                <div className="grid grid-cols-2 gap-3">
                  <Field name="quantity" label="Quantity (optional)" inputMode="decimal" defaultValue={existing?.quantity ?? ""} />
                  <Field name="unit" label="Unit (optional)" hint="e.g. concepts, m²" defaultValue={existing?.unit ?? ""} />
                </div>
                <Field name="dueDate" label="Due date (optional)" type="date" defaultValue={existing?.dueDate ?? ""} />
                <TextareaField name="exclusions" label="Not included (optional)" rows={2} defaultValue={existing?.exclusions ?? ""} />
                <TextareaField name="description" label="Notes (optional)" rows={2} defaultValue={existing?.description ?? ""} />
              </>
            )}

            {kind === "party_obligation" && (
              <>
                <SelectField
                  name="owedBySide"
                  label="Who provides it"
                  defaultValue={existing?.owedBySide ?? "payer"}
                  options={[
                    { value: "payer", label: `${payerName} (paying)` },
                    { value: "payee", label: `${payeeName} (being paid)` },
                  ]}
                />
                <Field name="title" label="What they provide" hint="For example: brand assets, site access, approvals." defaultValue={existing?.title} required />
                <Field name="dueDate" label="By when (optional)" type="date" defaultValue={existing?.dueDate ?? ""} />
                <TextareaField name="description" label="Notes (optional)" rows={2} defaultValue={existing?.description ?? ""} />
              </>
            )}

            {kind === "payment_obligation" && (
              <>
                <Field name="title" label="Payment name" hint="For example: Deposit, Second instalment, Balance." defaultValue={existing?.title} required />
                <Field name="amount" label="Amount (₦)" inputMode="decimal" defaultValue={existing?.price ?? ""} required />
                {preset && !existing ? (
                  <>
                    <input type="hidden" name="trigger" value={preset.trigger} />
                    {preset.linkedCommitmentId && <input type="hidden" name="linkedCommitmentId" value={preset.linkedCommitmentId} />}
                    {preset.trigger === "on_date" && <Field name="triggerDate" label="Date" type="date" required />}
                  </>
                ) : (
                <div className="space-y-1.5">
                  <label htmlFor="trigger-select" className="block text-small font-medium">When it becomes due</label>
                  <select
                    id="trigger-select"
                    name="trigger"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="w-full rounded-control border border-line-strong bg-raised px-3 py-2.5 text-body"
                  >
                    <option value="on_confirmation">When the agreement is confirmed</option>
                    <option value="on_date">On a date</option>
                    <option value="on_acceptance" disabled={deliverables.length === 0}>When a deliverable is accepted</option>
                    <option value="on_request">When payment is requested</option>
                  </select>
                </div>
                )}
                {!(preset && !existing) && trigger === "on_date" && <Field name="triggerDate" label="Date" type="date" defaultValue={existing?.triggerDate ?? ""} required />}
                {!(preset && !existing) && trigger === "on_acceptance" && (
                  <SelectField name="linkedCommitmentId" label="Which deliverable" defaultValue={existing?.linkedCommitmentId ?? deliverables[0]?.id} options={deliverables.map((d) => ({ value: d.id, label: d.title }))} />
                )}
                <Field name="termsDays" label="Days to pay after it's due (optional)" type="number" min={0} max={365} hint="For example 7, or leave empty to pay straight away." defaultValue={existing?.termsDays ?? ""} />
              </>
            )}
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}
