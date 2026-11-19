import { getDb } from "@/server/db/client";
import { getSession } from "@/server/auth/session";
import { previewInvitation } from "@/server/modules/workspaces/service";
import { Wordmark } from "@/components/shell/brand";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/form";
import { acceptInvitationAction } from "@/app/app/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invitation" };

const MESSAGES = {
  invalid: "This invitation link is not valid.",
  revoked: "This invitation has been withdrawn.",
  used: "This invitation has already been used.",
  expired: "This invitation has expired. Ask for a new one.",
} as const;

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const preview = await previewInvitation(getDb(), token);
  const session = preview.status === "valid" ? await getSession() : null;
  const next = encodeURIComponent(`/invite/${token}`);
  return (
    <div className="min-h-dvh bg-surface">
      <main id="main" className="mx-auto flex w-full max-w-md flex-col px-4 py-8 sm:py-14">
        <Wordmark href="/" />
        <div className="mt-8 space-y-5 rounded-panel border border-line bg-raised p-5 sm:p-8">
          {preview.status !== "valid" ? (
            <>
              <h1 className="text-display font-semibold">Invitation</h1>
              <Alert tone="error">{MESSAGES[preview.status]}</Alert>
            </>
          ) : (
            <>
              <h1 className="text-display font-semibold">Join {preview.workspaceName}</h1>
              <p className="text-body text-fg-secondary">
                You've been invited as <strong className="font-semibold text-fg">{preview.role}</strong>. This invitation is for{" "}
                <strong className="font-semibold text-fg">{preview.email}</strong>.
              </p>
              {!session ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={`/sign-in?next=${next}`}>Sign in to accept</ButtonLink>
                  <ButtonLink href="/sign-up" variant="secondary">Create an account</ButtonLink>
                </div>
              ) : (
                <ActionForm action={acceptInvitationAction} submitLabel="Accept invitation" pendingLabel="Joining…">
                  <input type="hidden" name="token" value={token} />
                </ActionForm>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
