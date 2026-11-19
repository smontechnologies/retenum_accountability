import { Wordmark } from "@/components/shell/brand";

/** Focused single-column layout for access screens (UI/UX S1). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8 sm:py-14">
        <Wordmark href="/" />
        <div className="mt-8 rounded-panel border border-line bg-raised p-5 sm:p-8">{children}</div>
        <p className="mt-6 text-caption text-fg-muted">
          Retenum records what both parties confirm. It does not hold money, guarantee payment or decide disputes.
        </p>
      </main>
    </div>
  );
}
