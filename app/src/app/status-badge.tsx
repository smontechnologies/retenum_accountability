/**
 * Status badge primitive (PRD P-10, NFR-02): status is always conveyed by text, never colour alone.
 */
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "attention" | "done" }) {
  const border = tone === "attention" ? "border-2 border-dashed" : tone === "done" ? "border-2" : "border";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${border} border-[var(--border)]`}>
      {label}
    </span>
  );
}
