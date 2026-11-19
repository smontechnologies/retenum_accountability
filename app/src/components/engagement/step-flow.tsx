import { ArrowDown, ArrowUp, CalendarClock, CircleCheck, CornerDownRight, HandCoins, Inbox, Package, Trash2 } from "lucide-react";
import type { CommitmentView } from "@/domain/baseline";
import { ConfirmAction } from "@/components/ui/dialog";
import { MoneyFigure } from "@/components/ui/money";
import { moveStepAction, removeCommitmentAction } from "@/app/app/engagements/actions";
import { AddStepMenu } from "./add-step-menu";
import { CommitmentDrawer, type EditableCommitment } from "./commitment-drawer";
import { formatDate } from "./format";

const decimal = (minor: bigint | null) => (minor === null ? null : `${minor / 100n}.${(minor % 100n).toString().padStart(2, "0")}`);
const toEditable = (c: CommitmentView): EditableCommitment => ({ ...c, price: decimal(c.priceMinor) });

interface Props {
  engagementId: string;
  items: CommitmentView[];
  editable: boolean;
  payerName: string;
  payeeName: string;
}

/**
 * The agreement as an ordered flow of steps (D-65), like Bubble workflows: each step can have things
 * that happen because of it (payments that become due) listed underneath, with a "+" to add more.
 * Step 1 is always "Agreement confirmed". Read-only for the counterparty and after confirmation.
 */
export function StepFlow({ engagementId, items, editable, payerName, payeeName }: Props) {
  const deliverables = items.filter((c) => c.kind === "deliverable");
  const refs = deliverables.map((d) => ({ id: d.id, title: d.title }));
  const onConfirmation = items.filter((c) => c.kind === "payment_obligation" && c.trigger === "on_confirmation");
  const onAcceptance = (id: string) => items.filter((c) => c.kind === "payment_obligation" && c.trigger === "on_acceptance" && c.linkedCommitmentId === id);
  // Top-level steps: deliverables, party obligations, and payments not attached to another step.
  const steps = items.filter((c) => c.kind !== "payment_obligation" || c.trigger === "on_date" || c.trigger === "on_request");
  const common = { engagementId, deliverables: refs, payerName, payeeName };

  const editControls = (c: CommitmentView, index?: number) =>
    editable ? (
      <div className="flex flex-wrap items-center gap-1">
        <CommitmentDrawer {...common} kind={c.kind} label="Edit" existing={toEditable(c)} />
        <ConfirmAction
          trigger="Remove"
          triggerVariant="ghost"
          triggerIcon={<Trash2 aria-hidden className="size-4" />}
          confirmVariant="destructive"
          title={`Remove "${c.title}"?`}
          consequence="It will be removed from this draft. Nothing has been agreed yet, so this doesn't affect any confirmed record."
          confirmLabel="Remove step"
          action={removeCommitmentAction}
          hidden={{ engagementId, commitmentId: c.id }}
          successToast="Step removed."
        />
        {index !== undefined && (
          <>
            <MoveButton engagementId={engagementId} commitmentId={c.id} direction="up" disabled={index === 0} title={c.title} />
            <MoveButton engagementId={engagementId} commitmentId={c.id} direction="down" disabled={index === steps.length - 1} title={c.title} />
          </>
        )}
      </div>
    ) : null;

  const payment = (c: CommitmentView, when: string) => (
    <li key={c.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-2">
        <CornerDownRight aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
        <div className="min-w-0 space-y-0.5">
          <p className="text-small"><span className="font-semibold">{c.title}</span> <span className="text-fg-secondary">becomes due {when}{c.termsDays ? `, payable within ${c.termsDays} day${c.termsDays === 1 ? "" : "s"}` : ""}</span></p>
          {editControls(c)}
        </div>
      </div>
      <MoneyFigure amountMinor={c.priceMinor ?? 0n} className="pl-6 font-medium sm:pl-0" />
    </li>
  );

  return (
    <section aria-label="Agreement steps" className="space-y-3">
      <ol className="space-y-3">
        <Step number={1} icon={CircleCheck} title="Agreement confirmed" subtitle="Both parties confirm this flow.">
          {onConfirmation.length > 0 && <ul className="divide-y divide-line">{onConfirmation.map((c) => payment(c, "when the agreement is confirmed"))}</ul>}
          {editable && <CommitmentDrawer {...common} kind="payment_obligation" label="Payment when confirmed" triggerStyle="inline" preset={{ trigger: "on_confirmation", context: "Becomes due as soon as both parties confirm the agreement." }} />}
        </Step>

        {steps.map((c, i) => {
          const n = i + 2;
          if (c.kind === "deliverable") {
            const pays = onAcceptance(c.id);
            return (
              <Step key={c.id} number={n} icon={Package} title={c.title} kind="Deliverable" amount={c.priceMinor ?? 0n} subtitle={`Delivered by ${payeeName}${c.dueDate ? `, due ${formatDate(c.dueDate)}` : ""}`}>
                {c.definitionOfDone && <p className="text-small text-fg-secondary"><span className="text-fg-muted">Done when: </span>{c.definitionOfDone}</p>}
                {c.exclusions && <p className="text-small text-fg-secondary"><span className="text-fg-muted">Not included: </span>{c.exclusions}</p>}
                {editControls(c, i)}
                {pays.length > 0 && <ul className="mt-1 divide-y divide-line border-t border-line">{pays.map((p) => payment(p, "when this is accepted"))}</ul>}
                {editable && <CommitmentDrawer {...common} kind="payment_obligation" label="Payment when accepted" triggerStyle="inline" preset={{ trigger: "on_acceptance", linkedCommitmentId: c.id, context: `Becomes due when "${c.title}" is accepted.` }} />}
              </Step>
            );
          }
          if (c.kind === "party_obligation") {
            return (
              <Step key={c.id} number={n} icon={HandCoins} title={c.title} kind="Provided by a party" subtitle={`Provided by ${c.owedBySide === "payer" ? payerName : payeeName}${c.dueDate ? ` by ${formatDate(c.dueDate)}` : ""}`}>
                {editControls(c, i)}
              </Step>
            );
          }
          return (
            <Step
              key={c.id}
              number={n}
              icon={c.trigger === "on_date" ? CalendarClock : Inbox}
              title={c.title}
              kind="Payment"
              amount={c.priceMinor ?? 0n}
              subtitle={c.trigger === "on_date" && c.triggerDate ? `Becomes due on ${formatDate(c.triggerDate)}` : "Becomes due when the payee requests it"}
            >
              {editControls(c, i)}
            </Step>
          );
        })}
      </ol>
      {editable && <AddStepMenu engagementId={engagementId} deliverables={refs} payerName={payerName} payeeName={payeeName} />}
      {!editable && steps.length === 0 && <p className="text-small text-fg-secondary">No further steps.</p>}
    </section>
  );
}

function Step({ number, icon: Icon, title, kind, subtitle, amount, children }: {
  number: number;
  icon: typeof Package;
  title: string;
  kind?: string;
  subtitle?: string;
  amount?: bigint;
  children?: React.ReactNode;
}) {
  return (
    <li className="rounded-panel border border-line bg-raised">
      <div className="flex gap-3 px-4 py-3 lg:px-5">
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-caption font-semibold tabular">{number}</span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {kind && (
                <p className="flex items-center gap-1.5 text-caption text-fg-muted">
                  <Icon aria-hidden className="size-3.5" /> {kind}
                </p>
              )}
              <h3 className="font-semibold break-words">
                <span className="sr-only">Step {number}: </span>
                {title}
              </h3>
              {subtitle && <p className="text-small text-fg-secondary">{subtitle}</p>}
            </div>
            {amount !== undefined && <MoneyFigure amountMinor={amount} size="md" className="sm:text-right" />}
          </div>
          {children}
        </div>
      </div>
    </li>
  );
}

function MoveButton({ engagementId, commitmentId, direction, disabled, title }: { engagementId: string; commitmentId: string; direction: "up" | "down"; disabled: boolean; title: string }) {
  if (disabled) return null;
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  return (
    <form action={async (fd: FormData) => { "use server"; await moveStepAction({ status: "idle" }, fd); }}>
      <input type="hidden" name="engagementId" value={engagementId} />
      <input type="hidden" name="commitmentId" value={commitmentId} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" className="inline-flex size-11 items-center justify-center rounded-control text-fg-secondary hover:bg-surface hover:text-fg" aria-label={`Move "${title}" ${direction}`}>
        <Icon aria-hidden className="size-4" />
      </button>
    </form>
  );
}
