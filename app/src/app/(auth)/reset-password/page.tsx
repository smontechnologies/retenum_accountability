import Link from "next/link";
import { ActionForm, Field } from "@/app/_components/form";
import { resetPasswordAction } from "../actions";

export const metadata = { title: "Choose a new password · Retenum" };

export default async function ResetPasswordPage(props: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await props.searchParams;
  if (!token || error) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Link not valid</h1>
        <p>This reset link is invalid or has expired.</p>
        <Link className="underline" href="/forgot-password">Request a new link</Link>
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <ActionForm action={resetPasswordAction} submitLabel="Save new password">
        <input type="hidden" name="token" value={token} />
        <Field name="password" label="New password" type="password" autoComplete="new-password" hint="At least 10 characters." required />
      </ActionForm>
    </section>
  );
}
