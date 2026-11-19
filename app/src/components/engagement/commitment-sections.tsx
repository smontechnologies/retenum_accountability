import { Trash2 } from "lucide-react";
import type { CommitmentView } from "@/domain/baseline";
import { TRIGGER_LABEL } from "@/domain/baseline";
import { CommitmentDrawer, type EditableCommitment } from "./commitment-drawer";
import { ConfirmAction } from "@/components/ui/dialog";
import { MoneyFigure } from "@/components/ui/money";
import { Panel } from "@/components/ui/panel";
import { removeCommitmentAction } from "@/app/app/engagements/actions";
import { formatDate } from "./format";

const decimal = (minor: bigint | null) => (minor === null ? null : `${minor / 100n}.${(minor % 100n).toString().padStart(2, "0")}`);
export const toEditable = (c: CommitmentView): EditableCommitment => ({ ...c, price: decimal(c.priceMinor) });

interface Props {
  engagementId: string;
  items: CommitmentView[];
  editable: boolean;
  payerName: string;
  payeeName: string;
}

/** The agreement's three structured lists (UI/UX §6.1): deliverables, party obligations, payment schedule. */
export function CommitmentSections({ engagementId, items, editable, payerName, payeeName }: Props) {
  const deliverables = items.filter((c) => c.kind === "deliverable");
  const obligations = items.filter((c) => c.kind === "party_obligation");
  const payments = items.filter((c) => c.kind === "payment_obligation");
  const deliverableRefs = deliverables.map((d) => ({ id: d.id, title: d.title }));
  const drawer = (kind: EditableCommitment["kind"], label: string, existing?: CommitmentView) => (
    <CommitmentDrawer engagementId={engagementId} kind={kind} label={label} existing={existing ? toEditable(existing) : undefined} deliverables={deliverableRefs} payerName={payerName} payeeName={payeeName} />
  );
  const remove = (c: CommitmentView) => (
    <ConfirmAction
      trigger="Remove"
      triggerVariant="ghost"
      triggerIcon={<Trash2 aria-hidden className="size-4" />}
      confirmVariant="destructive"
      title={`Remove "${c.title}"?`}
      consequence="It will be removed from this draft. Nothing has been agreed yet, so this doesn't affect any confirmed record."
      confirmLabel="Remove item"
      action={removeCommitmentAction}
      hidden={{ engagementId, commitmentId: c.id }}
      successToast="Item removed."
    />
  );
  const controls = (kind: EditableCommitment["kind"], c: CommitmentView) =>
    editable ? (
      <div className="flex flex-wrap gap-2">
        {drawer(kind, "Edit", c)}
        {remove(c)}
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <Panel title="What will be delivered" description={`Owed by ${payeeName}.`} actions={editable ? drawer("deliverable", "Add deliverable") : undefined}>
        {deliverables.length === 0 ? (
          <p className="text-small text-fg-secondary">No deliverables yet. Add each thing that will be delivered, with its price.</p>
        ) : (
          <ul className="divide-y divide-line">
            {deliverables.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold break-words">
                    {c.title}
                    {c.quantity ? <span className="font-normal text-fg-secondary"> · {Number(c.quantity)} {c.unit ?? ""}</span> : null}
                  </p>
                  {c.definitionOfDone && <p className="text-small text-fg-secondary"><span className="text-fg-muted">Done when: </span>{c.definitionOfDone}</p>}
                  {c.exclusions && <p className="text-small text-fg-secondary"><span className="text-fg-muted">Not included: </span>{c.exclusions}</p>}
                  {c.dueDate && <p className="text-caption text-fg-muted">Due {formatDate(c.dueDate)}</p>}
                  {controls("deliverable", c)}
                </div>
                <MoneyFigure amountMinor={c.priceMinor ?? 0n} size="md" className="sm:text-right" />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="What each side provides" description="Things either side must provide, such as access, materials, information or approvals." actions={editable ? drawer("party_obligation", "Add") : undefined}>
        {obligations.length === 0 ? (
          <p className="text-small text-fg-secondary">Nothing recorded. Optional, but it helps when delays are caused by missing inputs.</p>
        ) : (
          <ul className="divide-y divide-line">
            {obligations.map((c) => (
              <li key={c.id} className="space-y-1 py-3">
                <p className="font-semibold break-words">{c.title}</p>
                <p className="text-small text-fg-secondary">
                  Provided by {c.owedBySide === "payer" ? payerName : payeeName}
                  {c.dueDate ? ` by ${formatDate(c.dueDate)}` : ""}
                </p>
                {controls("party_obligation", c)}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Payment schedule" description={`Paid by ${payerName} to ${payeeName}.`} actions={editable ? drawer("payment_obligation", "Add payment") : undefined}>
        {payments.length === 0 ? (
          <p className="text-small text-fg-secondary">No payments yet. Add each payment and when it becomes due.</p>
        ) : (
          <ul className="divide-y divide-line">
            {payments.map((c) => {
              const linked = deliverables.find((d) => d.id === c.linkedCommitmentId);
              const when =
                c.trigger === "on_date" && c.triggerDate
                  ? `On ${formatDate(c.triggerDate)}`
                  : c.trigger === "on_acceptance" && linked
                    ? `When "${linked.title}" is accepted`
                    : c.trigger
                      ? TRIGGER_LABEL[c.trigger]
                      : "";
              return (
                <li key={c.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold break-words">{c.title}</p>
                    <p className="text-small text-fg-secondary">
                      {when}
                      {c.termsDays ? `, payable within ${c.termsDays} day${c.termsDays === 1 ? "" : "s"}` : ""}
                    </p>
                    {controls("payment_obligation", c)}
                  </div>
                  <MoneyFigure amountMinor={c.priceMinor ?? 0n} size="md" className="sm:text-right" />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
