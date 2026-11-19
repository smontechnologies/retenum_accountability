import { Wordmark } from "@/components/shell/brand";
import { ButtonLink } from "@/components/ui/button";

/** Public entry page. Plain statement of what Retenum is and is not (D-03, D-47). */
export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-8">
        <Wordmark href="/" />
        <ButtonLink href="/sign-in" variant="ghost" size="sm">Sign in</ButtonLink>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl px-4 pt-10 pb-16 md:px-8 md:pt-20">
        <p className="text-small text-fg-muted">Design-partner preview</p>
        <h1 className="mt-3 max-w-[18ch] text-[2.25rem] leading-[2.625rem] font-semibold tracking-[-0.02em] md:text-[3.25rem] md:leading-[3.5rem]">
          One record of what was agreed, changed, delivered and paid.
        </h1>
        <p className="mt-5 max-w-[60ch] text-body text-fg-secondary md:text-h3 md:font-normal">
          Retenum gives you and your client a shared commercial record. Nothing counts as agreed until both of you confirm it, and
          nothing confirmed can be quietly changed.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/sign-up">Create an account</ButtonLink>
          <ButtonLink href="/sign-in" variant="secondary">Sign in</ButtonLink>
        </div>
        <dl className="mt-16 grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3">
          {[
            ["Agreed", "Scope, prices and payment terms, confirmed by both parties."],
            ["Changed", "Every change keeps what was agreed before, who authorised it and its price."],
            ["Paid", "Each payment is linked to the obligation it settles. Retenum never holds your money."],
          ].map(([t, d]) => (
            <div key={t} className="bg-bg p-5">
              <dt className="font-semibold">{t}</dt>
              <dd className="mt-1 text-small text-fg-secondary">{d}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
