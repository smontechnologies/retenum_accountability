"use client";

import { useState } from "react";
import { CalendarClock, HandCoins, Package, Plus, Inbox } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { CommitmentFormDialog, type Kind } from "./commitment-drawer";

type Choice = { kind: Kind; trigger?: "on_date" | "on_request"; label: string; hint: string; Icon: typeof Plus };

const CHOICES: Choice[] = [
  { kind: "deliverable", label: "Deliverable", hint: "Something that will be delivered, with its price and when it counts as done.", Icon: Package },
  { kind: "party_obligation", label: "What a party provides", hint: "Access, materials, information or approvals either side must provide.", Icon: HandCoins },
  { kind: "payment_obligation", trigger: "on_date", label: "Payment on a date", hint: "A payment that becomes due on a set date.", Icon: CalendarClock },
  { kind: "payment_obligation", trigger: "on_request", label: "Payment when requested", hint: "A payment that becomes due when the payee requests it.", Icon: Inbox },
];

/**
 * "+ Add step" at the end of the flow (Bubble-style action picker, D-65). Payments that depend on a
 * step are added with the "+" under that step instead.
 */
export function AddStepMenu(props: { engagementId: string; deliverables: Array<{ id: string; title: string }>; payerName: string; payeeName: string }) {
  const [menu, setMenu] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setMenu(true)}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-panel border border-dashed border-line-strong text-small font-medium hover:bg-surface"
      >
        <Plus aria-hidden className="size-4" /> Add step
      </button>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Add a step" description="Choose what kind of step to add to the end of the flow." variant="drawer">
        <ul className="space-y-2">
          {CHOICES.map((c) => (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setChoice(c);
                }}
                className="flex min-h-14 w-full items-start gap-3 rounded-control border border-line-strong px-3 py-3 text-left hover:bg-surface"
              >
                <c.Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
                <span className="flex flex-col">
                  <span className="text-small font-semibold">{c.label}</span>
                  <span className="text-caption text-fg-muted">{c.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-caption text-fg-muted">To add a payment that becomes due when the agreement is confirmed or when a deliverable is accepted, use the + under that step.</p>
      </Dialog>
      {choice && (
        <CommitmentFormDialog
          key={choice.label}
          open
          onClose={() => setChoice(null)}
          engagementId={props.engagementId}
          kind={choice.kind}
          deliverables={props.deliverables}
          payerName={props.payerName}
          payeeName={props.payeeName}
          preset={choice.trigger ? { trigger: choice.trigger, context: choice.label } : undefined}
        />
      )}
    </>
  );
}
