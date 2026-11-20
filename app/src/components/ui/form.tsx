"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import { CircleAlert, WifiOff } from "lucide-react";
import type { FormState } from "@/server/lib/form-state";
import { cn } from "@/lib/cn";
import { Alert } from "./alert";
import { Button, type ButtonVariant } from "./button";
import { useToast } from "./toast";
import { useOnline } from "./use-online";

type ClientState = FormState & { values?: Record<string, string> };
const IDLE: FormState = { status: "idle" };
const StateContext = createContext<ClientState>({ status: "idle" });
/** Field name → { label, id }, so the error summary can name and link each problem (design system §9.5). */
type Registry = Map<string, { label: string; id: string }>;
const RegistryContext = createContext<Registry | null>(null);
type Action = (prev: FormState, data: FormData) => Promise<FormState>;

/** Fields never echoed back after a submission. */
const isSecret = (name: string) => /password|token/i.test(name);

/**
 * A form bound to a server action (design system §7 "Form").
 * - Keeps non-secret values after a failed submission.
 * - Blocks submission while offline; nothing is queued or retried (PWA-06/07).
 * - Shows a toast using the action's verb on success when `successToast` is given.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Working…",
  successToast,
  children,
  variant = "primary",
  block = false,
  showSuccessInline = true,
  onSuccess,
  disabled = false,
}: {
  action: Action;
  submitLabel: string;
  pendingLabel?: string;
  successToast?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  block?: boolean;
  showSuccessInline?: boolean;
  /** Called once per successful submission (e.g. to close a drawer). */
  onSuccess?: () => void;
  /** Disable submission (the reason must be shown nearby). */
  disabled?: boolean;
}) {
  const online = useOnline();
  const toast = useToast();
  // The server action is passed to React directly so the form still posts securely to the server if
  // it is submitted before hydration (progressive enhancement). Never a native GET with values in the URL.
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, IDLE);
  // Non-secret values captured at submit time, re-applied if the server returns an error.
  const submitted = useRef<Record<string, string> | undefined>(undefined);
  const [offlineBlocked, setOfflineBlocked] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!navigator.onLine) {
      e.preventDefault(); // PWA-06/07: nothing is sent, queued or retried
      setOfflineBlocked(true);
      return;
    }
    setOfflineBlocked(false);
    const values: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((v, k) => {
      if (typeof v === "string" && !isSecret(k) && !k.startsWith("$")) values[k] = v;
    });
    submitted.current = values;
  }

  const view: ClientState = offlineBlocked
    ? { status: "error", message: "You're offline. Nothing was sent. Try again when you're back online.", values: submitted.current }
    : { ...state, values: state.status === "error" ? submitted.current : undefined };

  const registry = useRef<Registry>(new Map()).current;
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = Object.entries(view.fields ?? {}).filter(([k]) => !k.startsWith("_"));

  // Move focus to the first field that needs fixing, so the problem can't be missed.
  useEffect(() => {
    if (view.status !== "error" || fieldErrors.length === 0) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const lastToasted = useRef<FormState | null>(null);
  useEffect(() => {
    if (state.status === "success" && lastToasted.current !== state) {
      lastToasted.current = state;
      if (successToast) toast(state.message ?? successToast);
      onSuccess?.();
    }
  }, [state, successToast, toast, onSuccess]);

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="space-y-5" noValidate>
      <RegistryContext.Provider value={registry}>
      <StateContext.Provider value={view}>
        {view.status === "error" && fieldErrors.length > 0 ? (
          <Alert tone="error" title={fieldErrors.length === 1 ? "Fix this to continue" : `Fix these ${fieldErrors.length} things to continue`}>
            <ul className="mt-1 space-y-0.5">
              {fieldErrors.map(([name, message]) => {
                const f = registry.get(name);
                return (
                  <li key={name}>
                    {f ? (
                      <a href={`#${f.id}`} className="underline underline-offset-2">
                        {f.label}: {message.charAt(0).toLowerCase() + message.slice(1)}
                      </a>
                    ) : (
                      message
                    )}
                  </li>
                );
              })}
            </ul>
          </Alert>
        ) : (
          view.message && (view.status === "error" || showSuccessInline) && <Alert tone={view.status === "error" ? "error" : "success"}>{view.message}</Alert>
        )}
        {children}
        <div className="space-y-2">
          <Button type="submit" variant={variant} loading={pending} disabled={!online || disabled} block={block} className={block ? "" : "w-full sm:w-auto"}>
            {pending ? pendingLabel : submitLabel}
          </Button>
          {!online && (
            <p className="flex items-center gap-1.5 text-caption text-fg-secondary">
              <WifiOff aria-hidden className="size-3.5" /> Available when you're back online.
            </p>
          )}
        </div>
      </StateContext.Provider>
      </RegistryContext.Provider>
    </form>
  );
}

function useFieldState(name: string) {
  const state = useContext(StateContext);
  return { error: state.fields?.[name], kept: state.values?.[name] };
}

function FieldShell({ id, label, hint, error, children, name }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode; name?: string }) {
  const registry = useContext(RegistryContext);
  if (registry && name) registry.set(name, { label, id });
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-small font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-caption text-fg-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-small font-medium">
          <CircleAlert aria-hidden className="size-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

const controlClasses = (invalid: boolean) =>
  cn(
    "w-full rounded-control bg-raised px-3 py-2.5 text-body pointer-fine:py-1.5 text-fg placeholder:text-fg-muted",
    "disabled:bg-sunken disabled:text-fg-muted",
    invalid ? "border-2 border-fg" : "border border-line-strong",
  );

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

export function Field({ name, label, type = "text", hint, defaultValue, ...rest }: { name: string; label: string; type?: string; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">) {
  const id = useId();
  const { error, kept } = useFieldState(name);
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} error={error}>
      <input
        key={kept ?? "initial"}
        id={id}
        name={name}
        type={type}
        defaultValue={kept ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses(Boolean(error)), "read-only:bg-sunken")}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextareaField({ name, label, hint, defaultValue, rows = 4, ...rest }: { name: string; label: string; hint?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = useId();
  const { error, kept } = useFieldState(name);
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} error={error}>
      <textarea
        key={kept ?? "initial"}
        id={id}
        name={name}
        rows={rows}
        defaultValue={kept ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(Boolean(error))}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({ name, label, hint, options, defaultValue }: { name: string; label: string; hint?: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  const id = useId();
  const { error, kept } = useFieldState(name);
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} error={error}>
      <select
        key={kept ?? "initial"}
        id={id}
        name={name}
        defaultValue={kept ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(Boolean(error))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label, value = "yes" }: { name: string; label: React.ReactNode; value?: string }) {
  const id = useId();
  const { error } = useFieldState(name);
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-3">
        <input id={id} type="checkbox" name={name} value={value} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} className="mt-0.5 size-5 shrink-0 accent-[var(--fg)]" />
        <label htmlFor={id} className="text-small">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-small font-medium">
          <CircleAlert aria-hidden className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}
