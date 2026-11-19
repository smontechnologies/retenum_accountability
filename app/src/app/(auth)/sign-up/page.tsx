import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/form";
import { signUpAction } from "../actions";

export const metadata = { title: "Create account · Retenum" };

export default function SignUpPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-display font-semibold">Create your account</h1>
      <ActionForm action={signUpAction} submitLabel="Create account" pendingLabel="Creating…">
        <Field name="name" label="Your name" autoComplete="name" required />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete="new-password" hint="At least 10 characters." required />
      </ActionForm>
      <p className="text-small">
        Already have an account? <Link className="font-medium underline underline-offset-4" href="/sign-in">Sign in</Link>
      </p>
          </section>
  );
}
