import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/form";
import { signInAction } from "../actions";

export const metadata = { title: "Sign in · Retenum" };

export default async function SignInPage(props: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await props.searchParams;
  return (
    <section className="space-y-6">
      <h1 className="text-display font-semibold">Sign in</h1>
      {reset && <Alert tone="success">Password changed. Sign in with your new password.</Alert>}
      <ActionForm action={signInAction} submitLabel="Sign in" pendingLabel="Signing in…">
        <input type="hidden" name="next" value={next ?? ""} />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete="current-password" required />
      </ActionForm>
      <p className="text-small">
        <Link className="font-medium underline underline-offset-4" href="/forgot-password">Forgot password?</Link> ·{" "}
        <Link className="font-medium underline underline-offset-4" href="/sign-up">Create an account</Link>
      </p>
    </section>
  );
}
