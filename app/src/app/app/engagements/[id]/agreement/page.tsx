import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { submissionWarnings } from "@/domain/baseline";
import { formatDate } from "@/components/engagement/format";
import { ResponsePanel } from "@/components/engagement/response-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/dialog";
import { DescriptionList } from "@/components/ui/description-list";
import { ActionForm, Field } from "@/components/ui/form";
import { MoneyFigure } from "@/components/ui/money";
import { Panel } from "@/components/ui/panel";
import { resendAction, saveResponseWindowsAction, submitAction, withdrawAction } from "../../actions";

export const metadata = { title: "Read as agreement" };

export default async function AgreementPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ responded?: string; sent?: string }> }) {
  const { id } = await props.params;
  const { responded, sent } = await props.searchParams;
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
      {sent && v.status === "awaiting_confirmation" && <Alert tone="success" title="Sent for confirmation">{v.other.orgName} has been emailed a link. You'll be notified when they respond.</Alert>}
      {responded === "confirm" && v.status === "active" && <Alert tone="success" title="Agreement confirmed">This is now version 1 of the shared record.</Alert>}
      {responded === "request_changes" && v.status === "draft" && <Alert tone="success" title="Request sent">{v.other.orgName} will revise the agreement and send it again.</Alert>}
      {responded === "decline" && v.status === "withdrawn" && <Alert tone="success" title="Declined">The engagement has been withdrawn.</Alert>}
      {v.status === "draft" && v.viewer.isInitiatorSide && last?.status === "changes_requested" && (
        <Alert tone="warning" title={`${v.other.orgName} asked for changes`}>{last.comment}</Alert>
      )}
      {v.status === "draft" && !v.viewer.isInitiatorSide && (
        <Alert tone="info" title="Being revised">{v.other.orgName} is revising the agreement after your request. You're seeing the version they last sent you.</Alert>
      )}
      {v.status === "active" && <Alert tone="success" title="Confirmed by both parties">This is version {v.engagement.currentVersion} of the agreement. It can only change through changes both parties confirm.</Alert>}

      {v.can.respond && last && <ResponsePanel engagementId={id} submissionId={last.id} orgName={v.me.orgName} respondBy={formatDate(last.respondBy)} />}

      {v.status === "awaiting_confirmation" && v.viewer.isInitiatorSide && last && (
        <Panel title={`Waiting for ${v.other.orgName}`}>
          <DescriptionList
            items={[
              { label: "Sent to", value: `${v.other.repName ?? ""} (${v.other.repEmail})` },
              { label: "Sent", value: formatDate(last.submittedAt) },
              { label: "Response due by", value: formatDate(last.respondBy) },
              { label: "Opened", value: v.invitation?.firstAcceptedAt ? formatDate(v.invitation.firstAcceptedAt) : "Not yet" },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {v.can.resendInvitation && <ConfirmAction trigger="Send a new link" title="Send a new link?" consequence={`${v.other.repEmail} gets a new email. Earlier links stop working.`} confirmLabel="Send new link" action={resendAction} hidden={{ engagementId: id }} successToast="New link sent." />}
            {v.can.withdraw && <ConfirmAction trigger="Withdraw" triggerVariant="destructive" title="Withdraw this engagement?" consequence="The other party can no longer confirm it. This is recorded and can't be undone." confirmLabel="Withdraw engagement" action={withdrawAction} hidden={{ engagementId: id }} successToast="Engagement withdrawn." />}
          </div>
        </Panel>
      )}

      <section aria-labelledby="clauses-heading" className="rounded-panel border border-line bg-raised p-4 lg:p-6">
        <h2 id="clauses-heading" className="text-h3 font-semibold">Agreement between {payee.orgName} and {payer.orgName}</h2>
        <p className="mt-1 text-small text-fg-secondary">Generated from the workflows{v.viewer.isInitiatorSide && editable ? ". Edit the workflows to change it" : ""}. This is exactly what is confirmed.</p>
        {v.clauses.length === 0 ? (
          <p className="mt-4 text-small text-fg-secondary">Nothing yet. Add steps to the workflows.</p>
        ) : (
          <ol className="mt-5 space-y-5">
            {v.clauses.map((c) => (
              <li key={c.number} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
                <span className="font-semibold tabular">{c.number}.</span>
                <div className="min-w-0">
                  <p className="font-semibold break-words">{c.text}</p>
                  <ul className="mt-1.5 space-y-1">{c.lines.map((l) => <li key={l} className="text-body break-words">{l}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

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
