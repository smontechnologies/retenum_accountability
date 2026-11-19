"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Panel } from "@/components/ui/panel";
import { useToast } from "@/components/ui/toast";

/** Interactive pieces of the catalogue: theme preview, dialog, drawer, toast. */
export function CatalogueInteractive() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const toast = useToast();
  return (
    <Panel title="Theme and overlays">
      <div className="flex flex-wrap items-center gap-3">
        {["light", "dark", "system"].map((t) => (
          <Button key={t} size="sm" variant="secondary" onClick={() => document.documentElement.setAttribute("data-theme", t)}>
            Preview {t}
          </Button>
        ))}
        <Button size="sm" onClick={() => setDialog(true)}>Open dialog</Button>
        <Button size="sm" onClick={() => setDrawer(true)}>Open drawer</Button>
        <Button size="sm" variant="ghost" onClick={() => toast("Change confirmed.")}>Show toast</Button>
      </div>
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Authorise work on CH-3?">
        <p className="text-small text-fg-secondary"><strong className="font-semibold text-fg">You are permitting work to proceed. You are not agreeing a price.</strong> The valuation stays open until both parties agree it.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button variant="ghost" autoFocus onClick={() => setDialog(false)}>Cancel</Button><Button onClick={() => setDialog(false)}>Authorise work</Button></div>
      </Dialog>
      <Dialog open={drawer} onClose={() => setDrawer(false)} title="Record a payment you made" variant="drawer">
        <p className="text-small text-fg-secondary">Drawer content (bottom sheet on mobile, side panel on desktop).</p>
      </Dialog>
    </Panel>
  );
}
