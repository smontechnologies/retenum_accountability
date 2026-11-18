import Link from "next/link";
import { ActionForm, Field } from "@/app/_components/form";
import { signInAction } from "../actions";

export const metadata = { title: "Sign in · Retenum" };

export default async function SignInPage(props: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await props.searchParams;
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {reset && <p role="status" className="rounded border border-[var(--border)] p-3 text-sm">✓ Password changed. Sign in with your new password.</p>}
      <ActionForm action={signInAction} submitLabel="Sign in" pendingLabel="Signing in…">
        <input type="hidden" name="next" value={next ?? ""} />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete="current-password" required />
      </ActionForm>
      <p className="text-sm">
        <Link className="underline" href="/forgot-password">Forgot password?</Link> ·{" "}
        <Link className="underline" href="/sign-up">Create an account</Link>
      </p>
    </section>
  );
}
