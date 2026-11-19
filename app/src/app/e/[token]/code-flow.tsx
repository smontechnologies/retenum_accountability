"use client";

import { useState } from "react";
import { ActionForm, Field } from "@/components/ui/form";
import { sendCodeAction, verifyCodeAction } from "@/app/app/engagements/actions";

/** Step 1: send a code to the invited email. Step 2: enter it (FR-ID-05). */
export function CodeFlow({ token, email }: { token: string; email: string }) {
  const [sent, setSent] = useState(false);
  return sent ? (
    <div className="space-y-4">
      <p className="text-small text-fg-secondary">We emailed a 6-digit code to <strong className="font-semibold text-fg">{email}</strong>. It expires in 10 minutes.</p>
      <ActionForm action={verifyCodeAction} submitLabel="Continue" pendingLabel="Checking…" block>
        <input type="hidden" name="token" value={token} />
        <Field name="code" label="Sign-in code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required />
      </ActionForm>
      <ActionForm action={sendCodeAction} submitLabel="Send a new code" pendingLabel="Sending…" variant="ghost" successToast="New code sent." showSuccessInline={false}>
        <input type="hidden" name="token" value={token} />
      </ActionForm>
    </div>
  ) : (
    <ActionForm action={sendCodeAction} submitLabel={`Email a sign-in code to ${email}`} pendingLabel="Sending…" block onSuccess={() => setSent(true)} showSuccessInline={false}>
      <input type="hidden" name="token" value={token} />
    </ActionForm>
  );
}
