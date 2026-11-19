"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useOnline } from "@/components/ui/use-online";

/** PWA-03: offline / back-online banner. */
export function OfflineBanner() {
  const online = useOnline();
  const [showBack, setShowBack] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  useEffect(() => {
    if (!online) setWasOffline(true);
    else if (wasOffline) {
      setShowBack(true);
      setWasOffline(false);
      const t = setTimeout(() => setShowBack(false), 3000);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);
  if (online && !showBack) return null;
  return (
    <div role="status" className="sticky top-0 z-50 flex items-start gap-2 border-b border-fg bg-fg px-4 py-2 text-small text-bg">
      {online ? <Wifi aria-hidden className="mt-0.5 size-4 shrink-0" /> : <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0" />}
      <p>
        {online
          ? "Back online."
          : "You're offline. You can read pages already open, but nothing can be confirmed, recorded or paid until you reconnect."}
      </p>
    </div>
  );
}

/**
 * Registers the service worker (TD-24) and offers updates when a new version is waiting (PWA-04).
 * The new worker only activates after the user chooses to reload.
 */
export function ServiceWorkerManager({ enabled }: { enabled: boolean }) {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (!enabled || !("serviceWorker" in navigator)) return;
    // Only reload when a NEW worker replaces one that was already in control (an update the user
    // accepted). The first install also fires controllerchange; reloading then would interrupt the user.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    const onControllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          sw?.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) setWaiting(sw);
          });
        });
      })
      .catch(() => {
        /* registration failure must never break the app */
      });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, [enabled]);
  if (!waiting) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-panel border border-line bg-raised px-4 py-3 text-small shadow-overlay lg:bottom-6">
      <RefreshCw aria-hidden className="size-4 shrink-0" />
      <p className="flex-1">A new version of Retenum is ready.</p>
      <button type="button" onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })} className="rounded-control bg-action px-3 py-2 font-medium text-action-fg hover:bg-action-hover">
        Reload to update
      </button>
    </div>
  );
}

/** DES-03: brings this device's cookie in line with the account's saved theme. */
export function ThemeSync({ theme }: { theme: string }) {
  useEffect(() => {
    const current = document.cookie.match(/(?:^|; )rtn_theme=([^;]+)/)?.[1];
    if (current !== theme) {
      document.cookie = `rtn_theme=${theme}; path=/; max-age=34560000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);
  return null;
}
