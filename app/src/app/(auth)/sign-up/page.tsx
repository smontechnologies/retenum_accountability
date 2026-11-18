import Link from "next/link";
import { ActionForm, Field } from "@/app/_components/form";
import { signUpAction } from "../actions";

export const metadata = { title: "Create account · Retenum" };

export default function SignUpPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <ActionForm action={signUpAction} submitLabel="Create account" pendingLabel="Creating…">
        <Field name="name" label="Your name" autoComplete="name" required />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete="new-password" hint="At least 10 characters." required />
      </ActionForm>
      <p className="text-sm">
        Already have an account? <Link className="underline" href="/sign-in">Sign in</Link>
      </p>
      <p className="text-xs text-[var(--muted)]">
        Retenum records what both parties confirm. It does not hold money, guarantee payment or decide disputes.
      </p>
    </section>
  );
}
