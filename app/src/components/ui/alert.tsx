import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };

/** Monochrome alert: meaning comes from icon, title and wording (design system §7). */
export function Alert({ tone = "info", title, children, className }: {
  tone?: keyof typeof ICONS;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-panel p-3 text-small",
        tone === "error" || tone === "warning" ? "border-2 border-fg" : "border border-line-strong",
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 text-fg-secondary" : ""}>{children}</div>}
      </div>
    </div>
  );
}
