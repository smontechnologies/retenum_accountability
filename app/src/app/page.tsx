import Link from "next/link";
import { StatusBadge } from "./status-badge";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <StatusBadge label="Design-partner preview · not yet open" tone="attention" />
        <h1 className="text-2xl font-semibold sm:text-3xl">Retenum</h1>
        <p className="text-[var(--muted)]">
          One shared record for both parties: what was agreed, what changed, what was authorised, what was delivered and
          what was paid.
        </p>
      </header>
      <section aria-labelledby="principles" className="space-y-2">
        <h2 id="principles" className="text-lg font-medium">
          How it works
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nothing counts as agreed until both parties confirm it.</li>
          <li>Confirmed history is never edited — only added to.</li>
          <li>Retenum does not hold money or decide disputes.</li>
        </ul>
      </section>
      <p className="flex gap-4">
        <Link className="underline" href="/sign-in">Sign in</Link>
        <Link className="underline" href="/sign-up">Create an account</Link>
      </p>
    </div>
  );
}
