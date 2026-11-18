export const metadata = { title: "Check your email · Retenum" };

export default async function CheckEmailPage(props: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await props.searchParams;
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p>
        We sent a verification link{email ? <> to <strong>{email}</strong></> : null}. Open it to finish setting up your account.
      </p>
      <p className="text-sm text-[var(--muted)]">Didn't get it? Check spam, or try signing in to receive a new link.</p>
    </section>
  );
}
