"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CircleCheck, X } from "lucide-react";

type Toast = { id: number; message: string };
const ToastContext = createContext<(message: string) => void>(() => {});

/** One polite toast region; auto-dismisses after 6 s, paused while hovered or focused (design system §7). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((message: string) => {
    setToasts((t) => [...t.slice(-2), { id: nextId.current++, message }]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);
  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-panel border border-line bg-raised px-4 py-3 text-small shadow-overlay"
    >
      <CircleCheck aria-hidden className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">{toast.message}</p>
      <button type="button" onClick={() => onDismiss(toast.id)} className="rounded-control p-1 hover:bg-surface" aria-label="Dismiss notification">
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
