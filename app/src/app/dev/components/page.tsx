import { notFound } from "next/navigation";
import { Inbox } from "lucide-react";
import { STATUS, type StatusKey } from "@/domain/status";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { DescriptionList } from "@/components/ui/description-list";
import { LedgerStrip } from "@/components/ui/ledger-strip";
import { MoneyFigure } from "@/components/ui/money";
import { PageHeader, Panel } from "@/components/ui/panel";
import { PaymentSummary } from "@/components/ui/payment-summary";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResponsiveTable } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { Wordmark } from "@/components/shell/brand";
import { CatalogueInteractive } from "./interactive";

export const metadata = { title: "Component catalogue" };

/** Internal visual review of the design system (development only; 404 in production). */
export default async function ComponentCatalogue(props: { searchParams: Promise<{ theme?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  await props.searchParams;
  const obligations = [
    { id: "o1", name: "Deposit (40%)", trigger: "On confirmation", amount: 64800000n, status: "paid" as StatusKey },
    { id: "o2", name: "Concepts accepted (30%)", trigger: "On acceptance of concepts", amount: 48600000n, status: "due" as StatusKey },
    { id: "o3", name: "Launch assets (30%)", trigger: "On acceptance of launch assets", amount: 48600000n, status: "scheduled" as StatusKey },
  ];
  return (
    <main id="main" className="mx-auto max-w-[77.5rem] space-y-10 px-4 py-8 md:px-8">
      <Wordmark href="/" />
      <PageHeader title="Component catalogue" description="Every design-system component with sample data. Switch theme in Settings or with the radio below." />
      <CatalogueInteractive />

      <Panel title="Ledger strip (engagement header)">
        <LedgerStrip figures={{ agreed: 162000000n, paid: 60000000n, outstanding: 42000000n, disputed: 5000000n, due: 42000000n, pendingValuation: { low: 10000000n, high: 15000000n } }} />
      </Panel>

      <Panel title="Status grammar">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS) as StatusKey[]).map((k) => (
            <StatusBadge key={k} status={k} />
          ))}
        </div>
        <h3 className="mt-6 mb-2 text-small font-semibold">A change: three dimensions, never merged</h3>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="proposed" dimension="Agreement" />
          <StatusBadge status="authorised" dimension="Authorisation" />
          <StatusBadge status="valuation_pending" dimension="Valuation" viewerMustAct />
        </div>
      </Panel>

      <Panel title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Confirm agreement</Button>
          <Button variant="secondary">Request changes</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Decline</Button>
          <Button loading>Confirming…</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="#" size="sm" variant="secondary">Small link</ButtonLink>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Payment summary">
          <PaymentSummary obligation="Concepts accepted (30%)" reason="Due on acceptance of 3 concepts" recipient="Ada Studio Ltd" method="off_platform" due={48600000n} alreadyPaid={0n} thisPayment={48600000n} status="due" />
        </Panel>
        <Panel title="Money figures">
          <div className="space-y-2">
            <MoneyFigure amountMinor={162000000n} size="xl" />
            <div><MoneyFigure amountMinor={12505n} size="md" /></div>
            <div><MoneyFigure amountMinor={-5000n} /></div>
          </div>
        </Panel>
      </div>

      <Panel title="Responsive table">
        <ResponsiveTable
          caption="Payment schedule"
          rows={obligations}
          rowKey={(o) => o.id}
          columns={[
            { key: "name", header: "Obligation", primary: true, cell: (o) => o.name },
            { key: "trigger", header: "Becomes due", cell: (o) => o.trigger },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            { key: "amount", header: "Amount", numeric: true, cell: (o) => <MoneyFigure amountMinor={o.amount} /> },
          ]}
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Description list">
          <DescriptionList items={[{ label: "Definition of done", value: "Three concepts delivered as PDF, each with headline and key visual." }, { label: "Due date", value: "12 Jan 2027" }, { label: "Price", value: <MoneyFigure amountMinor={60000000n} /> }]} />
        </Panel>
        <Panel title="Tabs">
          <Tabs label="Engagement sections" current="changes" items={["Overview", "Agreement", "Changes", "Delivery", "Payments", "Activity"].map((l) => ({ key: l.toLowerCase(), label: l, href: "#" }))} />
        </Panel>
      </div>

      <Panel title="Alerts">
        <div className="space-y-3">
          <Alert tone="info" title="Response window">Kola Foods has 3 working days to respond to this change.</Alert>
          <Alert tone="success">Change confirmed. Version 2 is now the current agreement.</Alert>
          <Alert tone="warning" title="Work started before authorisation">This is recorded. It does not mean payment is owed.</Alert>
          <Alert tone="error">The amount can't be more than the outstanding balance (₦420,000.00).</Alert>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <EmptyState icon={Inbox} title="Nothing needs your response" action={<Button size="sm" variant="secondary">View engagements</Button>}>When the other party asks you to confirm something, it appears here.</EmptyState>
        <ErrorState title="This change couldn't be confirmed" action={<Button size="sm">Try again</Button>}>Another change to the same item was confirmed first. Ask for it to be re-proposed against version 2.</ErrorState>
        <LoadingState label="Loading engagement" />
      </div>

      <Panel title="Timeline">
        <Timeline
          events={[
            { id: "1", at: new Date("2026-11-18T13:05:00Z"), actor: "Ngozi Okafor", side: "payer", text: "authorised work on change CH-3 (valuation still open)." },
            { id: "2", at: new Date("2026-11-18T10:12:00Z"), actor: "Tunde Bello", side: "payee", text: "proposed change CH-3: radio script, ₦150,000.00." },
            { id: "3", at: new Date("2026-11-17T09:00:00Z"), actor: "Ngozi Okafor", side: "payer", text: "confirmed the agreement (version 1)." },
          ]}
        />
      </Panel>
    </main>
  );
}
