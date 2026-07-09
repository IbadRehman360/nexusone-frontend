"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Clock, AlertTriangle, Lock, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { createPortalSession, reactivateSubscription, cancelSubscription } from "@/src/services/billing/billingApi";
import { useInvalidateBilling } from "@/src/hooks/data/useBilling";
import type { BillingState } from "@/src/services/billing/billingApi";

export type DisplayState = "trial-active" | "trial-ending" | "grace" | "active" | "past-due" | "canceled" | "expired";

export function computeDisplayState(state: BillingState): DisplayState {
  if (state.nexusStatus === "GRACE") return "grace";
  if (state.nexusStatus === "LOCKED") return "expired";

  if (state.stripeStatus) {
    if (state.stripeStatus === "trialing") return (state.daysRemaining ?? 0) <= 3 ? "trial-ending" : "trial-active";
    if (state.stripeStatus === "active") return state.cancelAtPeriodEnd ? "canceled" : "active";
    if (state.stripeStatus === "past_due") return "past-due";
    if (state.stripeStatus === "canceled" || state.stripeStatus === "unpaid") return "expired";
  }
  if (state.nexusStatus === "TRIAL") return (state.daysRemaining ?? 0) <= 3 ? "trial-ending" : "trial-active";
  if (state.nexusStatus === "ACTIVE") return "active";
  return "trial-active";
}

const BANNER: Record<DisplayState, { icon: typeof Clock; variant: "info" | "warning" | "error" | "success"; label: string }> = {
  "trial-active": { icon: Clock, variant: "info", label: "You're on a free trial." },
  "trial-ending": { icon: AlertTriangle, variant: "warning", label: "Your trial is ending soon." },
  grace: { icon: AlertTriangle, variant: "warning", label: "Payment issue — you're in a grace period." },
  active: { icon: CheckCircle2, variant: "success", label: "Your subscription is active." },
  "past-due": { icon: AlertTriangle, variant: "error", label: "Your last payment failed." },
  canceled: { icon: AlertTriangle, variant: "warning", label: "Your subscription is set to cancel." },
  expired: { icon: Lock, variant: "error", label: "Access is locked." },
};

const VARIANT_CLASS: Record<string, string> = {
  info: "bg-info/10 border-info/20 text-info-400",
  warning: "bg-warning/10 border-warning/20 text-warning-400",
  error: "bg-error/10 border-error/20 text-error-400",
  success: "bg-success/10 border-success/20 text-success-400",
};

interface StatusBannerProps {
  displayState: DisplayState;
  state: BillingState;
  isOwner: boolean;
}

export function StatusBanner({ displayState, state, isOwner }: StatusBannerProps) {
  const invalidate = useInvalidateBilling();
  const [busy, setBusy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const { icon: Icon, variant, label } = BANNER[displayState];

  const daysLabel =
    state.daysRemaining != null && state.daysRemaining <= 1 && state.hoursRemaining
      ? `${state.hoursRemaining}h left`
      : state.daysRemaining != null && state.daysRemaining > 0
        ? `${state.daysRemaining} days left`
        : null;

  const handlePortal = async () => {
    setBusy(true);
    try {
      const url = await createPortalSession();
      window.location.assign(url);
    } catch (err) {
      toast.error("Couldn't open billing portal", { description: err instanceof Error ? err.message : "Please try again." });
      setBusy(false);
    }
  };

  const handleReactivate = async () => {
    setBusy(true);
    try {
      await reactivateSubscription();
      toast.success("Subscription reactivated");
      await invalidate();
    } catch (err) {
      toast.error("Couldn't reactivate", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelSubscription();
      toast.success("Subscription will cancel at the end of the billing period");
      setShowCancel(false);
      await invalidate();
    } catch (err) {
      toast.error("Couldn't cancel", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-end gap-4">
      <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium ${VARIANT_CLASS[variant]}`}>
        <Icon size={13} className="shrink-0" />
        {label}
        {daysLabel && (
          <>
            <span className="opacity-40 mx-0.5">·</span>
            <span className="opacity-70 font-normal">{daysLabel}</span>
          </>
        )}
      </span>
      {isOwner && (
        <div className="flex items-center gap-2 shrink-0">
          {(displayState === "past-due" || displayState === "grace") && (
            <Button size="sm" leftIcon={<CreditCard size={13} />} onClick={handlePortal} loading={busy}>
              Update payment
            </Button>
          )}
          {displayState === "canceled" && (
            <Button size="sm" onClick={handleReactivate} loading={busy}>
              Reactivate
            </Button>
          )}
          {displayState === "active" && (
            <>
              <Button variant="outline" size="sm" onClick={handlePortal} loading={busy}>
                Manage billing
              </Button>
              <Button variant="danger-ghost" size="sm" onClick={() => setShowCancel(true)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel subscription"
        subtitle="You'll keep access until the end of the current billing period."
        variant="danger"
        size="sm"
        loading={busy}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCancel(false)} disabled={busy}>
              Keep subscription
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancel} loading={busy}>
              Cancel subscription
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">Are you sure you want to cancel? Your paid modules will stop renewing.</p>
      </Modal>
    </div>
  );
}
