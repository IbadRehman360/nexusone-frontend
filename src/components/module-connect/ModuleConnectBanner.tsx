"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlugZap } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { initiateModuleConsent, type ModuleConsentService } from "@/src/services/module-consent/moduleConsentApi";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";

export const MODULE_LABELS: Record<SubscriptionModule, string> = {
  entra: "Entra ID",
  pp: "Power Platform",
  purview: "Purview",
};

const MODULE_TO_SERVICE: Record<SubscriptionModule, ModuleConsentService> = {
  entra: "ENTRA_ID",
  pp: "POWER_PLATFORM",
  purview: "PURVIEW",
};

/**
 * Banner on each module's Overview page only (not repeated on every
 * sub-page) whenever it's showing sample data — i.e. not `connected`, see
 * useModuleConnection. "Dummy Data" is plain text, no chip background, so it
 * reads as a label rather than a loud badge. No Purchase button here — the
 * Owner already has Billing reachable from the nav; this only offers Connect
 * once a purchase has actually happened. Renders nothing once connected.
 */
export function ModuleConnectBanner({ module }: { module: SubscriptionModule }) {
  const { user } = useAuth();
  const { paid, connected } = useModuleConnection(module);
  const [connecting, setConnecting] = useState(false);

  if (connected) return null;

  const isOwner = user?.tenantRole === "Owner";
  const label = MODULE_LABELS[module];

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { authorizationUrl } = await initiateModuleConsent(MODULE_TO_SERVICE[module]);
      window.location.href = authorizationUrl;
    } catch (err) {
      toast.error("Couldn't start the connection", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-warning-400/30 bg-warning/8 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-warning/10 border border-warning-400/20 flex items-center justify-center shrink-0">
          <PlugZap size={16} className="text-warning-400" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-warning-400">Dummy Data</span>
          <p className="text-xs text-muted-foreground">
            {paid
              ? `Connect your Microsoft tenant to see real ${label} data.`
              : `You're on a trial — purchase ${label} to connect your Microsoft tenant and see real data.`}
          </p>
        </div>
      </div>
      {isOwner && paid && (
        <Button size="sm" onClick={handleConnect} loading={connecting} leftIcon={<PlugZap size={14} />}>
          Connect {label}
        </Button>
      )}
    </div>
  );
}
