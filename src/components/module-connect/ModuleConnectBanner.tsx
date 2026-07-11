"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlugZap } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { initiateModuleConsent, type ModuleConsentService } from "@/src/services/module-consent/moduleConsentApi";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";
import { MODULE_LABELS } from "@/src/lib/constants/modules";

const MODULE_TO_CONSENT_SERVICE: Record<SubscriptionModule, ModuleConsentService> = {
  entra: "ENTRA_ID",
  pp: "POWER_PLATFORM",
  purview: "PURVIEW",
};

/**
 * Shown on a module's pages while it's `trialing` (purchased, not yet
 * connected) — the only real UI consumer of `moduleConsentApi.ts`, which has
 * existed fully wired since the original consent-flow work but was never
 * called from anywhere until this.
 */
export function ModuleConnectBanner({ module }: { module: SubscriptionModule }) {
  const [connecting, setConnecting] = useState(false);
  const label = MODULE_LABELS[module] ?? module;

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { authorizationUrl } = await initiateModuleConsent(MODULE_TO_CONSENT_SERVICE[module]);
      window.location.href = authorizationUrl;
    } catch (err) {
      toast.error("Couldn't start Connect", { description: err instanceof Error ? err.message : "Please try again." });
      setConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-xl p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info-400">
          <PlugZap size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">You're viewing sample data</p>
          <p className="text-xs text-muted-foreground">
            Connect your Microsoft tenant to see real {label} data and unlock actions.
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleConnect} loading={connecting} className="shrink-0">
        Connect
      </Button>
    </div>
  );
}
