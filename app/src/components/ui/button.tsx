import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "md" | "sm";

/** Button styles (design system §7–§8). Destructive is monochrome: heavy outline + icon + confirmation. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", block = false) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-[120ms]",
    "disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
    size === "md" ? "min-h-11 px-4 text-small" : "min-h-9 px-3 text-small",
    block && "w-full",
    variant === "primary" && "bg-action text-action-fg hover:bg-action-hover",
    variant === "secondary" && "border border-line-strong bg-transparent text-fg hover:bg-surface",
    variant === "ghost" && "bg-transparent text-fg underline-offset-4 hover:bg-surface",
    variant === "destructive" && "border-2 border-fg bg-transparent font-semibold text-fg hover:bg-surface",
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ variant, size, block, loading, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonClasses(variant, size, block), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader aria-hidden className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; icon?: ReactNode };

export function ButtonLink({ variant, size, block, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses(variant, size, block), className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
