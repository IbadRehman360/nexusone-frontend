"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlugZap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/inputs/Button";
import { initiateModuleConsent } from "@/src/services/module-consent/moduleConsentApi";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";
import { MODULE_LABELS, MODULE_TO_CONSENT_SERVICE } from "@/src/lib/constants/modules";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";

/**
 * Self-contained sample-data banner — reads its own phase via
 * `useModulePhase` rather than being told by the caller, so every page just
 * renders `<ModuleConnectBanner module="x" />` unconditionally and the right
 * thing happens: nothing when connected, a Connect prompt when trialing
 * (purchased, not yet connected — the only real UI consumer of
 * `moduleConsentApi.ts`), a plain sample-data notice with a link to Billing
 * when locked (look-around window, never purchased — nothing to Connect yet).
 */
export function ModuleConnectBanner({ module }: { module: SubscriptionModule }) {
  const router = useRouter();
  const { phase } = useModulePhase(module);
  const [connecting, setConnecting] = useState(false);
  const label = MODULE_LABELS[module] ?? module;

  if (phase === "connected") return null;

  const handleConnect = async () => {
    // Purview's connect flow is a multi-step wizard (account details, then
    // two separate manual role grants, then verification) — enough steps
    // that it gets its own page rather than a modal. Every other module
    // redirects straight to Microsoft consent since there's nothing else to
    // collect first.
    if (module === "purview") {
      router.push("/dashboard/purview/connect");
      return;
    }
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
          {phase === "trialing" ? <PlugZap size={18} /> : <Sparkles size={18} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">You&apos;re viewing sample data</p>
          <p className="text-xs text-muted-foreground">
            {phase === "trialing"
              ? `Connect your Microsoft tenant to see real ${label} data and unlock actions.`
              : `Purchase or start a trial of ${label} to see real data and unlock actions.`}
          </p>
          {phase === "trialing" && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {module === "purview"
                ? "A short setup wizard walks you through connecting your existing Purview account."
                : "You'll be redirected to Microsoft to sign in as your Global Admin and approve access — a one-time step, about 30 seconds."}
            </p>
          )}
        </div>
      </div>
      {phase === "trialing" ? (
        <Button size="sm" onClick={handleConnect} loading={connecting} className="shrink-0">
          Connect
        </Button>
      ) : (
        <Link href="/dashboard/settings/billing">
          <Button size="sm" variant="outline" className="shrink-0">
            View Plans
          </Button>
        </Link>
      )}
    </div>
  );
}
