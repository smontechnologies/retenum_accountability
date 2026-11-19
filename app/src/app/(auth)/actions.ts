"use server";

import { secureCookies } from "@/server/lib/env";
import { cookies, headers } from "next/headers";
import { getDb } from "@/server/db/client";
import { getUserTheme, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from "@/server/modules/preferences/theme";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuth } from "@/server/auth/auth";
import { safeNext } from "@/server/auth/session";
import { errorToFormState, type FormState } from "@/server/lib/form-state";
import { kickOutbox } from "@/server/outbox/kick";

const Email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));
const Password = z.string().min(10, "Use at least 10 characters").max(128, "Use at most 128 characters");

function fieldErrors(error: z.ZodError): FormState {
  return { status: "error", message: "Please check the highlighted fields.", fields: Object.fromEntries(error.issues.map((i) => [String(i.path[0]), i.message])) };
}

export async function signUpAction(_: FormState, data: FormData): Promise<FormState> {
  const parsed = z
    .object({ name: z.string().trim().min(1, "Required").max(100), email: Email, password: Password })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await getAuth().api.signUpEmail({ body: { ...parsed.data, callbackURL: "/app" } });
  } catch (err) {
    return errorToFormState(err);
  }
  kickOutbox();
  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signInAction(_: FormState, data: FormData): Promise<FormState> {
  const parsed = z.object({ email: Email, password: z.string().min(1, "Required") }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return fieldErrors(parsed.error);
  let userId: string;
  try {
    ({ user: { id: userId } } = await getAuth().api.signInEmail({ body: parsed.data, headers: await headers() }));
  } catch (err) {
    const state = errorToFormState(err);
    if (state.fields?._code === "EMAIL_NOT_VERIFIED") {
      kickOutbox(); // Better Auth re-sends the verification email on this attempt
      return { status: "error", message: "Please verify your email first. We have sent you a new link." };
    }
    // Same message for unknown email and wrong password (no account enumeration).
    return { status: "error", message: "Email or password is incorrect." };
  }
  // DES-03: apply the theme saved on the account to this device.
  const theme = await getUserTheme(getDb(), userId);
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", sameSite: "lax", maxAge: THEME_COOKIE_MAX_AGE, secure: secureCookies() });
  redirect(safeNext(data.get("next")));
}

export async function signOutAction(): Promise<void> {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

export async function forgotPasswordAction(_: FormState, data: FormData): Promise<FormState> {
  const parsed = z.object({ email: Email }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await getAuth().api.requestPasswordReset({ body: { email: parsed.data.email, redirectTo: "/reset-password" } });
  } catch {
    // ignore: the response must not reveal whether the email exists
  }
  kickOutbox();
  return { status: "success", message: "If an account exists for that email, a reset link is on its way. It expires in 30 minutes." };
}

export async function resetPasswordAction(_: FormState, data: FormData): Promise<FormState> {
  const parsed = z.object({ token: z.string().min(1), password: Password }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await getAuth().api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.password } });
  } catch {
    return { status: "error", message: "This reset link is invalid or has expired. Please request a new one." };
  }
  redirect("/sign-in?reset=1");
}
