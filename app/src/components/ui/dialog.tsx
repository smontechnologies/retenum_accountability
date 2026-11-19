"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { FormState } from "@/server/lib/form-state";
import { cn } from "@/lib/cn";
import { Button, type ButtonVariant } from "./button";
import { ActionForm } from "./form";

/**
 * Modal built on native <dialog> (focus trap, Esc to close, inert background).
 * `variant="drawer"` renders a bottom sheet on mobile and a side panel from lg (design system §7).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "dialog",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  variant?: "dialog" | "drawer";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className={cn(
        "m-0 max-h-[100dvh] border border-line bg-raised p-0 text-fg shadow-overlay",
        variant === "dialog" && "fixed inset-x-4 top-1/2 mx-auto w-auto max-w-lg -translate-y-1/2 rounded-overlay",
        variant === "drawer" &&
          "fixed inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-overlay lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[28rem] lg:rounded-none lg:rounded-l-overlay",
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id="dialog-title" className="text-h3 font-semibold">
            {title}
          </h2>
          {description && <div className="mt-1 text-small text-fg-secondary">{description}</div>}
        </div>
        <button type="button" onClick={onClose} className="-m-1 rounded-control p-2 hover:bg-surface" aria-label="Close">
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="max-h-[70dvh] overflow-y-auto px-5 py-4 lg:max-h-none">{children}</div>
    </dialog>
  );
}

/**
 * Confirmation for commercial and irreversible acts (UI/UX §6.5). States exactly what will be recorded.
 * The least destructive choice (Cancel) gets initial focus.
 */
export function ConfirmAction({
  trigger,
  triggerVariant = "secondary",
  title,
  consequence,
  confirmLabel,
  action,
  hidden,
  successToast,
}: {
  trigger: string;
  triggerVariant?: ButtonVariant;
  title: string;
  consequence: ReactNode;
  confirmLabel: string;
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  hidden: Record<string, string>;
  successToast?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" size="sm" variant={triggerVariant} onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-4">
          <div className="text-small text-fg-secondary">{consequence}</div>
          <Button type="button" variant="ghost" autoFocus onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <ActionForm action={action} submitLabel={confirmLabel} variant={triggerVariant === "destructive" ? "destructive" : "primary"} successToast={successToast} showSuccessInline={false}>
            {Object.entries(hidden).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          </ActionForm>
        </div>
      </Dialog>
    </>
  );
}
