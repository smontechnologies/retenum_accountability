import Link from "next/link";
import { getDb } from "@/server/db/client";
import { getSession } from "@/server/auth/session";
import { previewInvitation } from "@/server/modules/workspaces/service";
import { ActionForm } from "@/app/_components/form";
import { acceptInvitationAction } from "@/app/app/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Invitation · Retenum" };

const MESSAGES = {
  invalid: "This invitation link is not valid.",
  revoked: "This invitation has been withdrawn.",
  used: "This invitation has already been used.",
  expired: "This invitation has expired. Ask for a new one.",
} as const;

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const preview = await previewInvitation(getDb(), token);
  if (preview.status !== "valid") {
    return (
      <section className="mx-auto max-w-md space-y-3">
        <h1 className="text-2xl font-semibold">Invitation</h1>
        <p role="alert">{MESSAGES[preview.status]}</p>
      </section>
    );
  }
  const session = await getSession();
  const next = encodeURIComponent(`/invite/${token}`);
  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Join {preview.workspaceName}</h1>
      <p>
        You have been invited as <strong>{preview.role}</strong>. This invitation is for <strong>{preview.email}</strong>.
      </p>
      {!session ? (
        <p className="space-x-3">
          <Link className="underline" href={`/sign-in?next=${next}`}>Sign in</Link>
          <Link className="underline" href="/sign-up">Create an account</Link>
        </p>
      ) : (
        <ActionForm action={acceptInvitationAction} submitLabel="Accept invitation">
          <input type="hidden" name="token" value={token} />
        </ActionForm>
      )}
    </section>
  );
}
