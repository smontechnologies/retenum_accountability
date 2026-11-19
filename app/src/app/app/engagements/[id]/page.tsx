import Link from "next/link";
import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getEngagementView } from "@/server/modules/engagements/service";
import { ACTIONS, conditionAllowedOnStep, conditionAllowedOnWorkflow, conditionSentence, stepSentence, triggerSentence, type WorkflowView } from "@/domain/workflow";
import type { CommitmentView } from "@/domain/baseline";
import { Canvas } from "@/components/workflow/canvas";
import { PropertyEditor, PropertyPane } from "@/components/workflow/editor-panel";
import { WorkflowList } from "@/components/workflow/list";
import { AddStepButton } from "@/components/workflow/pickers";
import type { EditableStep, EditorOptions } from "@/components/workflow/types";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Workflows" };

const decimal = (minor: bigint | null) => (minor === null ? null : `${minor / 100n}.${(minor % 100n).toString().padStart(2, "0")}`);

/**
 * The engagement as a Bubble-style workflow editor (D-66, FR-WF-01/02): workflow list · vertical
 * canvas · property editor (bottom sheet on phones). Read-only for the counterparty and once sent.
 */
export default async function WorkflowEditorPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ w?: string; s?: string; created?: string; sent?: string; responded?: string }> }) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const actor = await requireActor(`/app/engagements/${id}`);
  const v = await getEngagementView(getDb(), actor, id);
  const base = `/app/engagements/${id}`;
  const editable = v.can.editDraft;
  const wf: WorkflowView | undefined = v.workflows.find((w) => w.id === sp.w) ?? v.workflows[0];
  const items = v.items;
  const opt = (kind: CommitmentView["kind"]) => items.filter((c) => c.kind === kind).map((c) => ({ id: c.id, label: c.title }));
  const options: EditorOptions = {
    engagementId: id,
    payerName: v.parties.find((p) => p.side === "payer")!.orgName,
    payeeName: v.parties.find((p) => p.side === "payee")!.orgName,
    deliverables: opt("deliverable"),
    obligations: opt("party_obligation"),
    payments: opt("payment_obligation"),
    workflows: v.workflows.map((w) => ({ id: w.id, label: triggerSentence(w, v.words) })),
  };

  // Selection for the property editor.
  const wIndex = wf ? v.workflows.indexOf(wf) : -1;
  let selection: Parameters<typeof PropertyEditor>[0]["selection"] = null;
  let readOnly: React.ReactNode = null;
  let sheetTitle = "Details";
  if (wf && sp.s === "trigger") {
    selection = { kind: "trigger", trigger: { workflowId: wf.id, triggerType: wf.triggerType, triggerParams: wf.triggerParams, onlyWhen: wf.onlyWhen }, isFirst: wIndex === 0, isLast: wIndex === v.workflows.length - 1, conditionAllowed: conditionAllowedOnWorkflow(wf) };
    sheetTitle = "Trigger";
    readOnly = (
      <>
        <h2 className="text-h3 font-semibold">Trigger</h2>
        <p>{triggerSentence(wf, v.words)}</p>
        {wf.onlyWhen && <p className="text-small text-fg-secondary">Only when {conditionSentence(wf.onlyWhen, v.words)}</p>}
      </>
    );
  } else if (wf && sp.s) {
    const i = wf.steps.findIndex((x) => x.id === sp.s);
    const st = wf.steps[i];
    if (st) {
      const c = st.commitment;
      const step: EditableStep = {
        id: st.id,
        workflowId: wf.id,
        actionType: st.actionType,
        params: st.params,
        onlyWhen: st.onlyWhen,
        commitment: c
          ? { title: c.title, price: decimal(c.priceMinor), definitionOfDone: c.definitionOfDone, quantity: c.quantity, unit: c.unit, dueDate: c.dueDate, exclusions: c.exclusions, description: c.description, termsDays: c.termsDays || null, owedBySide: c.owedBySide }
          : null,
      };
      selection = { kind: "step", step, number: i + 1, isFirst: i === 0, isLast: i === wf.steps.length - 1, conditionAllowed: conditionAllowedOnStep(st.actionType) };
      sheetTitle = `Step ${i + 1}: ${ACTIONS[st.actionType].label}`;
      readOnly = (
        <>
          <p className="text-caption text-fg-muted">Step {i + 1} · {ACTIONS[st.actionType].label}</p>
          <p className="font-medium">{stepSentence(st, v.words)}</p>
          {c?.definitionOfDone && <p className="text-small text-fg-secondary">Done when: {c.definitionOfDone}</p>}
          {c?.exclusions && <p className="text-small text-fg-secondary">Not included: {c.exclusions}</p>}
          {st.onlyWhen && <p className="text-small text-fg-secondary">Only when {conditionSentence(st.onlyWhen, v.words)}</p>}
        </>
      );
    }
  }
  const panel = <PropertyEditor options={options} selection={selection} editable={editable} readOnly={readOnly} />;

  return (
    <div className="space-y-5">
      {editable && v.workflows.every((w) => w.steps.length === 0) && (
        <Alert tone="info" title="Start with a few questions">
          Tell Retenum what you'll deliver and how you'll be paid, and it sets up the workflows for you. Or use + below to build them yourself.{" "}
          <Link href={`${base}/start`} className="font-medium underline underline-offset-4">Answer the questions</Link>
        </Alert>
      )}
      {v.status === "draft" && v.viewer.isInitiatorSide && v.workflows.some((w) => w.steps.length > 0) && v.problems.length > 0 && (
        <Alert tone="info" title="Before you can send this">
          <ul className="mt-1 list-disc space-y-0.5 pl-5">{v.problems.slice(0, 4).map((p) => <li key={p}>{p}</li>)}</ul>
        </Alert>
      )}
      {v.status === "draft" && v.viewer.isInitiatorSide && v.problems.length === 0 && (
        <Alert tone="success" title="Ready to send">
          Read it as an agreement and send it to {v.other.orgName}. <Link href={`${base}/agreement`} className="font-medium underline underline-offset-4">Read as agreement</Link>
        </Alert>
      )}
      {v.can.respond && (
        <Alert tone="warning" title="Your response is needed">
          Read the agreement and confirm it, ask for changes or decline. <Link href={`${base}/agreement`} className="font-medium underline underline-offset-4">Review and respond</Link>
        </Alert>
      )}
      {!editable && v.status === "awaiting_confirmation" && v.viewer.isInitiatorSide && <Alert tone="info">Sent to {v.other.orgName}. The workflows are locked while they review them.</Alert>}

      <div className="gap-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]">
        <aside aria-label="Workflow list" className="mb-6 rounded-panel border border-line bg-surface p-2 lg:mb-0 lg:self-start">
          <WorkflowList workflows={v.workflows} words={v.words} selected={wf?.id} base={base} options={options} editable={editable} />
        </aside>
        <div className="min-w-0">
          {wf ? (
            <>
              <Canvas workflow={wf} words={v.words} base={base} selected={sp.s} options={options} editable={editable} />
              {editable && wf.steps.length > 0 && <div className="mt-4"><AddStepButton options={options} workflowId={wf.id} variant="block" label="Add a step at the end" /></div>}
            </>
          ) : (
            <p className="text-small text-fg-secondary">No workflows.</p>
          )}
          {v.status === "draft" && v.viewer.isInitiatorSide && <div className="mt-6"><ButtonLink href={`${base}/agreement`} variant="secondary">Read as agreement</ButtonLink></div>}
        </div>
        <PropertyPane open={Boolean(selection)} title={sheetTitle} closeHref={`${base}?w=${wf?.id ?? ""}`}>{panel}</PropertyPane>
      </div>
    </div>
  );
}
