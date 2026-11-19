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
}: {
  engagementId: string;
  kind: Kind;
  existing?: EditableCommitment;
  deliverables: Array<{ id: string; title: string }>;
  payerName: string;
  payeeName: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState(existing?.trigger ?? "on_confirmation");
  const title = TITLES[kind][existing ? 1 : 0];
  return (
    <>
      {existing ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)} icon={<Pencil aria-hidden className="size-4" />} aria-label={`Edit ${existing.title}`}>
          Edit
        </Button>
      ) : (
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)} icon={<Plus aria-hidden className="size-4" />}>
          {label}
        </Button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title={title} variant="drawer">
        {open && (
          <ActionForm action={saveCommitmentAction} submitLabel={existing ? "Save changes" : "Add to agreement"} successToast={existing ? "Item updated." : "Item added."} showSuccessInline={false} onSuccess={() => setOpen(false)} block>
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
                {trigger === "on_date" && <Field name="triggerDate" label="Date" type="date" defaultValue={existing?.triggerDate ?? ""} required />}
                {trigger === "on_acceptance" && (
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
