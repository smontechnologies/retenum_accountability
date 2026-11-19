"use client";

import { useState } from "react";
import { respondAction } from "@/app/app/engagements/actions";
import { ActionForm, CheckboxField, TextareaField } from "@/components/ui/form";
import { cn } from "@/lib/cn";

type Mode = "confirm" | "request_changes" | "decline";

/**
 * Counterparty response to the baseline (FR-BAS-02/04, UI/UX §6.1). The confirm option requires an
 * explicit acknowledgement that states the consequence and the governing-document rule (D-45).
 */
export function ResponsePanel({ engagementId, submissionId, orgName, respondBy }: { engagementId: string; submissionId: string; orgName: string; respondBy: string }) {
  const [mode, setMode] = useState<Mode>("confirm");
  const options: Array<{ value: Mode; label: string; hint: string }> = [
    { value: "confirm", label: "Confirm the agreement", hint: "It becomes version 1 of the shared record." },
    { value: "request_changes", label: "Ask for changes", hint: "It goes back to them to revise and resend." },
    { value: "decline", label: "Decline", hint: "The engagement is withdrawn." },
  ];
  return (
    <section aria-labelledby="respond-heading" className="rounded-panel border-2 border-fg p-4 lg:p-5">
      <h2 id="respond-heading" className="text-h3 font-semibold">Your response</h2>
      <p className="mt-1 text-small text-fg-secondary">Please respond by {respondBy}. Nothing is agreed until you confirm.</p>
      <fieldset className="mt-4 grid gap-2 md:grid-cols-3">
        <legend className="sr-only">Choose a response</legend>
        {options.map((o) => (
          <label key={o.value} className={cn("flex min-h-11 cursor-pointer gap-3 rounded-control border px-3 py-2.5", mode === o.value ? "border-2 border-fg" : "border-line-strong")}>
            <input type="radio" name="response-mode" value={o.value} checked={mode === o.value} onChange={() => setMode(o.value)} className="mt-1 size-4 accent-[var(--fg)]" />
            <span className="flex flex-col">
              <span className="text-small font-medium">{o.label}</span>
              <span className="text-caption text-fg-muted">{o.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-5">
        <ActionForm
          key={mode}
          action={respondAction}
          submitLabel={mode === "confirm" ? "Confirm agreement" : mode === "request_changes" ? "Send request for changes" : "Decline agreement"}
          pendingLabel="Sending…"
          variant={mode === "decline" ? "destructive" : "primary"}
        >
          <input type="hidden" name="engagementId" value={engagementId} />
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="response" value={mode} />
          {mode === "confirm" ? (
            <CheckboxField
              name="acknowledged"
              label={
                <>
                  I confirm this agreement on behalf of <strong className="font-semibold">{orgName}</strong>. Once confirmed it becomes version 1 of the
                  shared record and can only change through changes both parties confirm. Where a signed contract exists, it governs; this record
                  summarises it and records changes, delivery and payment.
                </>
              }
            />
          ) : (
            <TextareaField name="comment" label={mode === "request_changes" ? "What needs to change" : "Reason for declining"} rows={4} required />
          )}
        </ActionForm>
      </div>
    </section>
  );
}
