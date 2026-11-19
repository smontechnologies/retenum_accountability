import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  numeric?: boolean;
  /** Shown as the bold title of the stacked block on mobile. */
  primary?: boolean;
}

/**
 * Table on md+, stacked list below md (design system §7, UI/UX §3.4). Nothing is dropped and there is
 * no horizontal scrolling.
 */
export function ResponsiveTable<T>({ columns, rows, rowKey, caption, empty }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  const primary = columns.find((c) => c.primary) ?? columns[0]!;
  const rest = columns.filter((c) => c !== primary);
  return (
    <>
      <table className="hidden w-full border-collapse text-small md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-3 py-2 font-medium text-fg-secondary", c.numeric ? "text-right" : "text-left")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-line last:border-b-0">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-3 align-top", c.numeric && "text-right tabular")}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((r) => (
          <li key={rowKey(r)} className="py-3">
            <div className="font-semibold">{primary.cell(r)}</div>
            <dl className="mt-1 space-y-1">
              {rest.map((c) => {
                const value = c.cell(r);
                if (value === null || value === undefined || value === false) return null; // no empty label rows
                return (
                  <div key={c.key} className="flex items-start justify-between gap-3 text-small">
                    <dt className="text-fg-muted">{c.header}</dt>
                    <dd className={cn("min-w-0 text-right", c.numeric && "tabular")}>{value}</dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
