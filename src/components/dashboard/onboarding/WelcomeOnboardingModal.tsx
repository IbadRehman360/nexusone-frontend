"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { ConnectTenantModal } from "@/src/components/layout/header/ConnectTenantModal";
import { useAuth } from "@/src/hooks/useAuth";
import { useTenants } from "@/src/hooks/data/useTenants";
import { acknowledgeWelcome } from "@/src/services/auth";
import { formatModulesInPhase } from "@/src/lib/constants/modules";

const OWNER_ROLE = "Owner" as const;

/**
 * Phase-based UI state. Click handlers transition this *synchronously* so
 * there's no paint between "welcome modal closes" and "next view appears".
 * The server-side acknowledgement runs in the background and the user keeps
 * moving — failure surfaces as a toast but the UX flow isn't blocked.
 */
type Phase = "welcome" | "connecting" | "dismissed";

/**
 * One-time post-auto-onboard welcome. Shown when:
 *   - subscription is non-null AND status === 'TRIAL'
 *   - subscription.welcomeAcknowledgedAt is null (server-tracked, cross-device)
 *   - user is Owner (invited members of a TRIAL tenant didn't kick this off,
 *     so a "your trial has started" message would be misleading)
 *
 * Either CTA marks the welcome acknowledged on the server. Dismissing via
 * the Skip button does the same — once seen, never re-shown.
 */
export function WelcomeOnboardingModal() {
  const { user } = useAuth();
  const { currentTenant } = useTenants();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("welcome");

  const subscription = user?.subscription ?? null;
  const isOwner = user?.tenantRole === OWNER_ROLE;
  const serverAcknowledged = !!subscription?.welcomeAcknowledgedAt;
  const eligible = !!subscription && subscription.status === "TRIAL" && isOwner;

  if (!eligible || serverAcknowledged || phase === "dismissed") {
    return null;
  }

  const tenantName = currentTenant?.name ?? "your tenant";
  const daysRemaining = subscription?.daysRemaining ?? 14;
  const moduleLabel = formatModulesInPhase(subscription?.modulesInTrial ?? subscription?.modules ?? [], "");

  /**
   * Fire-and-forget the server bookkeeping. Idempotent on the backend, so
   * it's safe to run a second time — and if the page reloads before this
   * finishes, the next pageload's /auth/me check returns the still-null
   * welcomeAcknowledgedAt and we re-show the modal once. Acceptable.
   */
  const acknowledgeOnServer = async () => {
    try {
      await acknowledgeWelcome();
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const handleContinue = () => {
    setPhase("dismissed");
    toast.success("Welcome to NexusOne", {
      description: `Your ${daysRemaining}-day trial is active.${moduleLabel ? ` ${moduleLabel} unlocked.` : ""}`,
    });
    void acknowledgeOnServer();
  };

  const handleConnectAnother = () => {
    // Transition to the connect modal *first* so the user sees the next step
    // immediately — no flash of dashboard while the network roundtrip
    // completes. The server-side acknowledge runs in parallel.
    setPhase("connecting");
    void acknowledgeOnServer();
  };

  if (phase === "connecting") {
    return <ConnectTenantModal isOpen onClose={() => setPhase("dismissed")} />;
  }

  return (
    <Modal
      isOpen
      onClose={handleContinue}
      title="Welcome to NexusOne"
      size="md"
      variant="success"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hi <span className="text-foreground font-medium">{user?.fullName}</span> — we just connected{" "}
          <span className="text-foreground font-medium">{tenantName}</span> and started your{" "}
          <span className="text-foreground font-medium">{daysRemaining}-day trial</span>
          {moduleLabel ? (
            <>
              . <span className="text-foreground">{moduleLabel}</span> unlocked while you evaluate.
            </>
          ) : (
            "."
          )}
        </p>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What would you like to do next?
          </p>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border border-info/30 bg-info/5 hover:bg-info/10 hover:border-info/50 text-left transition-all duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-md bg-info/15 border border-info/30 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-info-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Continue with {tenantName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use this tenant for your trial — explore your purchased modules.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleConnectAnother}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border border-border/50 bg-background hover:bg-muted/30 hover:border-info/30 text-left transition-all duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-md bg-muted/40 border border-border/40 flex items-center justify-center shrink-0">
                <Plus size={16} className="text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Connect a different Microsoft tenant</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run NexusOne against a separate Entra tenant — separate billing.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-border/40 flex justify-end">
          <Button size="sm" variant="ghost" onClick={handleContinue}>
            Skip for now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default WelcomeOnboardingModal;
