import { getDb } from "@/server/db/client";
import { getSession } from "@/server/auth/session";
import { previewEngagementInvitation } from "@/server/modules/engagements/service";
import { Wordmark } from "@/components/shell/brand";
import { Alert } from "@/components/ui/alert";
import { ActionForm } from "@/components/ui/form";
import { signOutAction } from "@/app/(auth)/actions";
import { acceptSignedInAction } from "@/app/app/engagements/actions";
import { CodeFlow } from "./code-flow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review an engagement" };

/** Counterparty entry point (FR-ID-05, D-43): link + email code, no password, no workspace needed. */
export default async function EngagementInvitationPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const preview = await previewEngagementInvitation(getDb(), token);
  const session = preview.status === "valid" ? await getSession() : null;
  return (
    <div className="min-h-dvh bg-surface">
      <main id="main" className="mx-auto flex w-full max-w-md flex-col px-4 py-8 sm:py-14">
        <Wordmark href="/" />
        <div className="mt-8 space-y-5 rounded-panel border border-line bg-raised p-5 sm:p-8">
          {preview.status !== "valid" ? (
            <>
              <h1 className="text-display font-semibold">Engagement link</h1>
              <Alert tone="error">{preview.status === "revoked" ? "This link no longer works. A newer link may have been sent; check your email or ask the sender." : "This link is not valid."}</Alert>
            </>
          ) : (
            <>
              <p className="text-small text-fg-muted">{preview.fromOrg} asked you to confirm</p>
              <h1 className="text-display font-semibold break-words">{preview.title}</h1>
              <p className="text-body text-fg-secondary">
                This is a shared record between {preview.fromOrg} and {preview.toOrg}. Nothing counts as agreed until you confirm it, and nothing
                confirmed can be changed later without both of you agreeing.
              </p>
              {session && session.user.email === preview.email ? (
                <ActionForm action={acceptSignedInAction} submitLabel="Review the agreement" block>
                  <input type="hidden" name="token" value={token} />
                </ActionForm>
              ) : session ? (
                <div className="space-y-3">
                  <Alert tone="warning">You're signed in as {session.user.email}, but this link was sent to {preview.email}.</Alert>
                  <form action={signOutAction}>
                    <button type="submit" className="min-h-11 text-small font-medium underline underline-offset-4">Sign out and continue as {preview.email}</button>
                  </form>
                </div>
              ) : (
                <CodeFlow token={token} email={preview.email} />
              )}
            </>
          )}
        </div>
        <p className="mt-6 text-caption text-fg-muted">Retenum records what both parties confirm. It does not hold money, guarantee payment or decide disputes.</p>
      </main>
    </div>
  );
}
