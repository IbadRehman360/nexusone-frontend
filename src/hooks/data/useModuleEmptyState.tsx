import { useState } from "react";
import { toast } from "sonner";
import { PlugZap } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { initiateModuleConsent, type ModuleConsentService } from "@/src/services/module-consent/moduleConsentApi";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";
import type { DtEmptyState } from "@/src/components/ui/display/DataTable/types";

const MODULE_LABELS: Record<SubscriptionModule, string> = {
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
 * Generic "not connected yet" DataTable empty state for every page except
 * each module's Overview (which gets curated sample data + ModuleConnectBanner
 * instead — see samplePowerPlatformData.ts and friends). Returns `null` once
 * `connected`, so callers fall back to their own real empty state.
 *
 * No Purchase action here (or anywhere outside Overview) — the Owner always
 * has Billing reachable from the nav. Only offers Connect, and only once
 * something's actually been purchased.
 */
export function useModuleEmptyState(module: SubscriptionModule): DtEmptyState | null {
  const { user } = useAuth();
  const { paid, connected } = useModuleConnection(module);
  const [connecting, setConnecting] = useState(false);

  if (connected) return null;

  const isOwner = user?.tenantRole === "Owner";
  const label = MODULE_LABELS[module];

  const handleConnect = () => {
    setConnecting(true);
    initiateModuleConsent(MODULE_TO_SERVICE[module])
      .then(({ authorizationUrl }) => {
        window.location.href = authorizationUrl;
      })
      .catch((err: unknown) => {
        toast.error("Couldn't start the connection", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
        setConnecting(false);
      });
  };

  return {
    icon: PlugZap,
    title: "Dummy Data",
    description: paid
      ? `Connect your Microsoft tenant to see real ${label} records here.`
      : `You're on a trial — purchase ${label} to connect your Microsoft tenant and see real records here.`,
    ...(isOwner &&
      paid && {
        action: { label: connecting ? "Connecting…" : "Connect", icon: <PlugZap size={13} />, onClick: handleConnect },
      }),
  };
}
