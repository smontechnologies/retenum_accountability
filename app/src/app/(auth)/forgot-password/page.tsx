import { ActionForm, Field } from "@/app/_components/form";
import { forgotPasswordAction } from "../actions";

export const metadata = { title: "Reset password · Retenum" };

export default function ForgotPasswordPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <ActionForm action={forgotPasswordAction} submitLabel="Send reset link">
        <Field name="email" label="Email" type="email" autoComplete="email" required />
      </ActionForm>
    </section>
  );
}
