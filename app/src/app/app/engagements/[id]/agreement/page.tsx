import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { submissionWarnings } from "@/domain/baseline";
import { StepFlow } from "@/components/engagement/step-flow";
import { formatDate } from "@/components/engagement/format";
import { ResponsePanel } from "@/components/engagement/response-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/dialog";
import { DescriptionList } from "@/components/ui/description-list";
import { ActionForm, Field } from "@/components/ui/form";
import { MoneyFigure } from "@/components/ui/money";
import { Panel } from "@/components/ui/panel";
import { saveResponseWindowsAction, submitAction } from "../../actions";

export const metadata = { title: "Agreement" };

export default async function AgreementPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await props.params;
  const { created } = await props.searchParams;
  const actor = await requireActor(`/app/engagements/${id}/agreement`);
  const v = await getEngagementView(getDb(), actor, id);
  const payer = v.parties.find((p) => p.side === "payer")!;
  const payee = v.parties.find((p) => p.side === "payee")!;
  const editable = v.can.editDraft;
  const warnings = submissionWarnings(v.items);
  const last = v.latestSubmission;
  const w = v.engagement.responseWindows;

  return (
    <div className="space-y-6">
      {created && (
        <Alert tone="success" title="Draft created">
          Add what will be delivered and the payment schedule, then send it to {v.other.orgName} to confirm. Nothing is shared with them until you send it.
        </Alert>
      )}
      {v.status === "draft" && v.viewer.isInitiatorSide && last?.status === "changes_requested" && (
        <Alert tone="warning" title={`${v.other.orgName} asked for changes`}>{last.comment}</Alert>
      )}
      {v.status === "draft" && !v.viewer.isInitiatorSide && (
        <Alert tone="info" title="Being revised">{v.other.orgName} is revising the agreement after your request. You're seeing the version they last sent you.</Alert>
      )}
      {v.status === "active" && <Alert tone="success" title="Confirmed by both parties">This is version {v.engagement.currentVersion} of the agreement. It can only change through changes both parties confirm.</Alert>}

      {v.can.respond && last && <ResponsePanel engagementId={id} submissionId={last.id} orgName={v.me.orgName} respondBy={formatDate(last.respondBy)} />}

      <StepFlow engagementId={id} items={v.items} editable={editable} payerName={payer.orgName} payeeName={payee.orgName} />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel title="Totals">
          <DescriptionList
            items={[
              { label: "Agreed value (deliverables)", value: <MoneyFigure amountMinor={v.summary.agreedMinor} /> },
              { label: "Payment schedule", value: <MoneyFigure amountMinor={v.summary.scheduledMinor} /> },
              { label: "Unscheduled", value: <MoneyFigure amountMinor={v.summary.unscheduledMinor} /> },
            ]}
          />
          {warnings.map((m) => (
            <p key={m} className="mt-3 text-small text-fg-secondary">{m}</p>
          ))}
        </Panel>
        <Panel title="Response times" description="Working days each side has to respond. Silence is recorded as no response, never as acceptance.">
          {editable ? (
            <ActionForm action={saveResponseWindowsAction} submitLabel="Save response times" successToast="Response times saved." showSuccessInline={false}>
              <input type="hidden" name="engagementId" value={id} />
              <div className="grid grid-cols-2 gap-3">
                <Field name="baseline" label="To confirm the agreement" type="number" min={1} max={30} defaultValue={w.baseline} />
                <Field name="changes" label="To respond to changes" type="number" min={1} max={30} defaultValue={w.changes} />
                <Field name="deliveries" label="To review deliveries" type="number" min={1} max={30} defaultValue={w.deliveries} />
                <Field name="paymentConfirmations" label="To confirm payments" type="number" min={1} max={30} defaultValue={w.paymentConfirmations} />
              </div>
            </ActionForm>
          ) : (
            <DescriptionList
              items={[
                { label: "To confirm the agreement", value: `${w.baseline} working days` },
                { label: "To respond to changes", value: `${w.changes} working days` },
                { label: "To review deliveries", value: `${w.deliveries} working days` },
                { label: "To confirm payments", value: `${w.paymentConfirmations} working days` },
              ]}
            />
          )}
        </Panel>
      </div>

      {v.viewer.isInitiatorSide && v.status === "draft" && (
        <Panel title="Send for confirmation" description={`${v.other.repName ?? v.other.orgName} (${v.other.repEmail}) will get a link and a sign-in code by email.`}>
          {v.problems.length > 0 ? (
            <div className="space-y-4">
              <Alert tone="warning" title="Before you can send this">
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {v.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Alert>
              <Button disabled>Send for confirmation</Button>
            </div>
          ) : v.can.submit ? (
            <ConfirmAction
              trigger="Send for confirmation"
              triggerVariant="primary"
              title={`Send to ${v.other.orgName}?`}
              consequence={
                <>
                  {v.other.repName ?? "They"} will be asked to confirm exactly what you see here. While they review it, you can't edit it; if they ask for changes it comes back to you.
                  {warnings.length > 0 && <span className="mt-2 block">{warnings[0]}</span>}
                </>
              }
              confirmLabel="Send for confirmation"
              action={submitAction}
              hidden={{ engagementId: id }}
            />
          ) : (
            <p className="text-small text-fg-secondary">Ready to send. Someone who can approve for your business (the creator, an owner or an admin) needs to send it.</p>
          )}
        </Panel>
      )}
    </div>
  );
}
