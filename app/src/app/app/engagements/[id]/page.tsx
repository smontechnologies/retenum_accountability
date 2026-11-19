import Link from "next/link";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { describeEvent, formatDate } from "@/components/engagement/format";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/dialog";
import { DescriptionList } from "@/components/ui/description-list";
import { MoneyFigure } from "@/components/ui/money";
import { Panel } from "@/components/ui/panel";
import { Timeline } from "@/components/ui/timeline";
import { resendAction, withdrawAction } from "../actions";

export const metadata = { title: "Engagement" };

/** Engagement overview (UI/UX S6): what needs attention, the position, the latest activity. */
export default async function EngagementOverview(props: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string; responded?: string }> }) {
  const { id } = await props.params;
  const { sent, responded } = await props.searchParams;
  const actor = await requireActor(`/app/engagements/${id}`);
  const v = await getEngagementView(getDb(), actor, id);
  const last = v.latestSubmission;
  const sideName = (s: string | null) => v.parties.find((p) => p.side === s)?.orgName;

  let attention: React.ReactNode = null;
  if (v.status === "draft" && v.viewer.isInitiatorSide) {
    attention = (
      <Panel title={last?.status === "changes_requested" ? "Changes requested" : "Finish setting up"}>
        <p className="text-small text-fg-secondary">
          {last?.status === "changes_requested"
            ? `${v.other.orgName} asked for changes: "${last.comment}". Update the agreement and send it again.`
            : v.problems.length > 0
              ? v.problems.join(" ")
              : `Ready to send to ${v.other.orgName} for confirmation.`}
        </p>
        <div className="mt-4"><ButtonLink href={`/app/engagements/${id}/agreement`}>Open the agreement</ButtonLink></div>
      </Panel>
    );
  } else if (v.status === "awaiting_confirmation" && v.can.respond && last) {
    attention = (
      <Panel title="Your response is needed" className="border-2 border-fg">
        <p className="text-small text-fg-secondary">{v.other.orgName} asked you to confirm this agreement by {formatDate(last.respondBy)}.</p>
        <div className="mt-4"><ButtonLink href={`/app/engagements/${id}/agreement`}>Review and respond</ButtonLink></div>
      </Panel>
    );
  } else if (v.status === "awaiting_confirmation" && v.viewer.isInitiatorSide && last) {
    attention = (
      <Panel title={`Waiting for ${v.other.orgName}`}>
        <DescriptionList
          items={[
            { label: "Sent to", value: `${v.other.repName ?? ""} (${v.other.repEmail})` },
            { label: "Sent", value: formatDate(last.submittedAt) },
            { label: "Response due by", value: formatDate(last.respondBy) },
            { label: "Opened", value: v.invitation?.firstAcceptedAt ? formatDate(v.invitation.firstAcceptedAt) : "Not yet" },
          ]}
        />
        {(v.can.resendInvitation || v.can.withdraw) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {v.can.resendInvitation && (
              <ConfirmAction trigger="Send a new link" title="Send a new link?" consequence={`${v.other.repEmail} gets a new email. Earlier links stop working.`} confirmLabel="Send new link" action={resendAction} hidden={{ engagementId: id }} successToast="New link sent." />
            )}
            {v.can.withdraw && (
              <ConfirmAction trigger="Withdraw" triggerVariant="destructive" title="Withdraw this engagement?" consequence="The other party can no longer confirm it. This is recorded and can't be undone." confirmLabel="Withdraw engagement" action={withdrawAction} hidden={{ engagementId: id }} successToast="Engagement withdrawn." />
            )}
          </div>
        )}
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {sent && v.status === "awaiting_confirmation" && <Alert tone="success" title="Sent for confirmation">{v.other.orgName} has been emailed a link. You'll be notified when they respond.</Alert>}
      {responded === "confirm" && v.status === "active" && <Alert tone="success" title="Agreement confirmed">This is now version 1 of the shared record.</Alert>}
      {responded === "request_changes" && v.status === "draft" && <Alert tone="success" title="Request sent">{v.other.orgName} will revise the agreement and send it again.</Alert>}
      {responded === "decline" && v.status === "withdrawn" && <Alert tone="success" title="Declined">The engagement has been withdrawn.</Alert>}
      {v.status === "withdrawn" && <Alert tone="info" title="Withdrawn">This engagement was withdrawn before it was confirmed. Its history is kept.</Alert>}
      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {attention}
          <Panel title="Summary">
            <DescriptionList
              items={[
                { label: "Paying", value: sideName("payer") },
                { label: "Being paid", value: sideName("payee") },
                { label: "Deliverables", value: `${v.summary.deliverables}` },
                { label: "Payments scheduled", value: <>{v.summary.paymentObligations} totalling <MoneyFigure amountMinor={v.summary.scheduledMinor} /></> },
                { label: "Confirmed", value: v.engagement.confirmedAt ? formatDate(v.engagement.confirmedAt) : "Not yet" },
              ]}
            />
            <p className="mt-4 text-small"><Link href={`/app/engagements/${id}/agreement`} className="font-medium underline underline-offset-4">See the full agreement</Link></p>
          </Panel>
        </div>
        <Panel title="Recent activity">
          <Timeline
            events={v.events.slice(0, 6).map((e) => ({
              id: e.id,
              at: e.createdAt,
              actor: e.actorName || (e.actorSide === "system" ? "Retenum" : "Someone"),
              side: (e.actorSide ?? undefined) as "payer" | "payee" | "system" | undefined,
              text: describeEvent(e.type, e.data),
            }))}
          />
          <p className="mt-4 text-small"><Link href={`/app/engagements/${id}/activity`} className="font-medium underline underline-offset-4">All activity</Link></p>
        </Panel>
      </div>
    </div>
  );
}
