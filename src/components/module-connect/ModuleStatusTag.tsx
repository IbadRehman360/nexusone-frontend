"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlugZap } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { initiateModuleConsent, type ModuleConsentService } from "@/src/services/module-consent/moduleConsentApi";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";

const MODULE_TO_SERVICE: Record<SubscriptionModule, ModuleConsentService> = {
  entra: "ENTRA_ID",
  pp: "POWER_PLATFORM",
  purview: "PURVIEW",
};

/**
 * Compact inline tag for each module's Overview page title row (via
 * PageHeader's titleBadge) — replaces the old full-width banner. Just
 * "Dummy Data" plus, when paid and Owner, a small inline "Connect" action.
 * Renders nothing once connected.
 */
export function ModuleStatusTag({ module }: { module: SubscriptionModule }) {
  const { user } = useAuth();
  const { paid, connected } = useModuleConnection(module);
  const [connecting, setConnecting] = useState(false);

  if (connected) return null;

  const isOwner = user?.tenantRole === "Owner";

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
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-warning-400/30 bg-warning/8 text-xs font-medium text-warning-400">
      <PlugZap size={12} />
      Dummy Data
      {isOwner && paid && (
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="ml-0.5 underline decoration-warning-400/50 hover:decoration-warning-400 disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect"}
        </button>
      )}
    </span>
  );
}
