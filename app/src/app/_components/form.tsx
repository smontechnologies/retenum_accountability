"use client";

import { createContext, useActionState, useContext, useId } from "react";
import type { FormState } from "@/server/lib/form-state";

type ClientState = FormState & { values?: Record<string, string> };
const IDLE: ClientState = { status: "idle" };
const StateContext = createContext<ClientState>(IDLE);

/** Fields never echoed back into the form after a submission. */
const isSecret = (name: string) => /password|token/i.test(name);

type Action = (prev: FormState, data: FormData) => Promise<FormState>;

/** Accessible form bound to a server action (NFR-01/02): errors announced, fields linked to messages. */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Working…",
  children,
  variant = "primary",
}: {
  action: Action;
  submitLabel: string;
  pendingLabel?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}) {
  // React resets uncontrolled fields after an action; keep what the user typed (except secrets)
  // so a failed submission does not wipe the form.
  const [state, formAction, pending] = useActionState(async (prev: ClientState, data: FormData): Promise<ClientState> => {
    const result = await action(prev, data);
    const values: Record<string, string> = {};
    data.forEach((v, k) => {
      if (typeof v === "string" && !isSecret(k) && !k.startsWith("$")) values[k] = v;
    });
    return { ...result, values: result.status === "success" ? undefined : values };
  }, IDLE);
  const style =
    variant === "primary"
      ? "bg-[var(--fg)] text-[var(--bg)]"
      : variant === "danger"
        ? "border-2 border-[var(--fg)] font-semibold"
        : "border border-[var(--border)]";
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <StateContext.Provider value={state}>
        {state.message && (
          <p role={state.status === "error" ? "alert" : "status"} className="rounded border border-[var(--border)] p-3 text-sm">
            {state.status === "error" ? "⚠ " : "✓ "}
            {state.message}
          </p>
        )}
        {children}
        <button type="submit" disabled={pending} className={`w-full rounded px-4 py-3 text-sm font-medium sm:w-auto ${style} disabled:opacity-60`}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </StateContext.Provider>
    </form>
  );
}

export function Field({
  name,
  label,
  type = "text",
  hint,
  ...rest
}: { name: string; label: string; type?: string; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">) {
  const state = useContext(StateContext);
  const id = useId();
  const error = state.fields?.[name];
  const kept = state.values?.[name];
  const { defaultValue, ...inputProps } = rest;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-[var(--muted)]">
          {hint}
        </p>
      )}
      <input
        key={kept ?? "initial"}
        id={id}
        name={name}
        type={type}
        defaultValue={kept ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined}
        className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-base"
        {...inputProps}
      />
      {error && (
        <p id={`${id}-err`} className="text-sm font-medium">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  const state = useContext(StateContext);
  const id = useId();
  const error = state.fields?.[name];
  const kept = state.values?.[name];
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select key={kept ?? "initial"} id={id} name={name} defaultValue={kept ?? defaultValue} aria-invalid={error ? true : undefined} className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-base">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm font-medium">⚠ {error}</p>}
    </div>
  );
}
