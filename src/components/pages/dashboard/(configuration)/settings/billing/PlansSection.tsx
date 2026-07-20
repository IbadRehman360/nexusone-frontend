"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { useAuth } from "@/src/hooks/useAuth";
import { useBillingPlans, useInvalidateBilling } from "@/src/hooks/data/useBilling";
import { redirectToCheckout, cancelModule, reactivateModule, retryModuleInvoice } from "@/src/services/billing/billingApi";
import { MODULE_BY_KEY } from "./moduleCatalog";
import type { PlanListItem, ModuleBillingInfo } from "@/src/services/billing/billingApi";

const MODULE_CANCEL_COPY: Record<string, string> = {
  entra: "NexusOne will delete its Enterprise Application and all associated permissions from your Microsoft Entra directory. Your directory, users, and settings are not modified.",
  pp: "NexusOne will remove its Enterprise Application and permissions from your directory, and its application user and System Administrator access from your Power Platform environments. Your environments, apps, flows, and data are not affected.",
  purview: "NexusOne will delete its Enterprise Application and stop reading your Purview and Log Analytics data. Your account, scans, classifications, and data are not affected. The collection and Log Analytics roles you granted no longer do anything once this is removed — you can optionally clean them up from your role assignments.",
};

interface PlansSectionProps {
  isOwner: boolean;
  paidModules: string[];
  modulesInTrial: string[];
  moduleBilling: Record<string, ModuleBillingInfo>;
}

export function PlansSection({ isOwner, paidModules, modulesInTrial, moduleBilling }: PlansSectionProps) {
  const { plans, isLoading, isError } = useBillingPlans();

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Modules & plans</h3>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">
        {modulesInTrial.length > 0
          ? "Move to a paid plan to keep your modules unlocked after the preview. Cancel anytime."
          : "Each module is billed separately — buy only what you need."}
      </p>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-4">Loading plans…</p>
      ) : isError ? (
        <p className="text-xs text-error-400 py-4">Could not load plans — try again in a moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} isOwner={isOwner} plan={plan} paidModules={paidModules} modulesInTrial={modulesInTrial} moduleBilling={moduleBilling} />
          ))}
        </div>
      )}

      {!isOwner && <p className="text-xs text-muted-foreground pt-3">Only the tenant Owner can purchase a plan. Contact your administrator to upgrade.</p>}
    </div>
  );
}

function PlanCard({
  isOwner,
  plan,
  paidModules,
  modulesInTrial,
  moduleBilling,
}: {
  isOwner: boolean;
  plan: PlanListItem;
  paidModules: string[];
  modulesInTrial: string[];
  moduleBilling: Record<string, ModuleBillingInfo>;
}) {
  const { user } = useAuth();
  const subscription = user?.subscription;
  const invalidate = useInvalidateBilling();
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const planModules = plan.modules ?? [];
  const isStandalone = planModules.length === 1;
  const moduleKey = isStandalone ? planModules[0] : null;
  const isOwned = planModules.length > 0 && planModules.every((m) => paidModules.includes(m));
  const billing = moduleKey ? moduleBilling?.[moduleKey] : undefined;

  // Four phases, matching the Backoffice's computeModulePhases exactly:
  //   Preview   — not purchased, still inside the tenant-wide look-around window
  //   Trial     — purchased, riding the module's own post-purchase Stripe trial
  //   Purchased — purchased, Stripe status active/past_due (not trialing)
  //   Locked    — never purchased with preview closed, or purchased-then-canceled
  //               with preview closed (canceling DURING preview falls back to
  //               Preview, not Locked — the same row just re-reads modulesInTrial).
  const isTrialPhase = isOwned && billing?.stripeSubscriptionStatus === "trialing";
  const isPurchasedPhase = isOwned && !isTrialPhase;
  const isPreviewPhase = !isOwned && planModules.some((m) => modulesInTrial.includes(m));
  const isLockedPhase = !isOwned && !isPreviewPhase;

  const meta = isStandalone ? MODULE_BY_KEY[planModules[0]] : undefined;
  const Icon = meta?.icon ?? Users;
  // Once owned, prefer the live per-tenant Stripe amount (billing.monthlyUSDcents)
  // over the flat catalog price — a staff-set custom price override for this
  // tenant repriced the real subscription item, and the catalog price alone
  // would otherwise silently hide that from the customer.
  const priceDollars = Math.round((isOwned ? billing?.monthlyUSDcents ?? plan.monthlyUSDcents : plan.monthlyUSDcents) / 100);
  const features = (plan.features?.length ?? 0) > 0 ? plan.features : meta?.features ?? [];

  const isPastDue = isOwned && billing?.stripeSubscriptionStatus === "past_due";
  const isPendingCancel = isOwned && billing?.cancelAtPeriodEnd === true;
  const renewsAt = isOwned && !isPastDue && billing?.currentPeriodEnd && !isPendingCancel ? new Date(billing.currentPeriodEnd) : null;
  const cancelsAt = isPendingCancel && billing?.currentPeriodEnd ? new Date(billing.currentPeriodEnd) : null;
  const isPaidModule = billing?.stripeSubscriptionStatus !== "trialing";
  const cancelCopy = moduleKey ? MODULE_CANCEL_COPY[moduleKey] : undefined;
  const canConfirmCancel = confirmText.trim().toLowerCase() === plan.displayName.trim().toLowerCase();

  const buy = async () => {
    if (!isOwner || busy) return;
    setBusy(true);
    try {
      await redirectToCheckout({ planId: plan.id });
    } catch (err) {
      toast.error("Couldn't start checkout", { description: err instanceof Error ? err.message : "Please try again." });
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    if (!isOwner || busy || !moduleKey || !canConfirmCancel) return;
    setBusy(true);
    try {
      await cancelModule(moduleKey);
      toast.success(
        isPaidModule ? `${plan.displayName} will be canceled` : `${plan.displayName} canceled`,
        { description: isPaidModule ? "Access continues until the end of your billing period." : "Access has been disconnected." },
      );
      setShowCancelConfirm(false);
      setConfirmText("");
      await invalidate();
    } catch (err) {
      toast.error("Couldn't cancel module", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const undoCancel = async () => {
    if (!isOwner || undoing || !moduleKey) return;
    setUndoing(true);
    try {
      await reactivateModule(moduleKey);
      toast.success("Cancellation reversed", { description: `${plan.displayName} will keep renewing.` });
      await invalidate();
    } catch (err) {
      toast.error("Couldn't undo cancellation", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setUndoing(false);
    }
  };

  const retryInvoice = async () => {
    if (!isOwner || retrying || !moduleKey) return;
    setRetrying(true);
    try {
      await retryModuleInvoice(moduleKey);
      toast.success("Retry initiated", { description: "We'll let you know if the payment succeeds." });
      await invalidate();
    } catch (err) {
      toast.error("Couldn't retry payment", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
            <Icon size={16} className="text-info-400" />
          </div>
          {isPurchasedPhase && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-success-400/40 text-[11px] font-medium text-success-400">Purchased</span>}
          {isTrialPhase && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-info-400/40 text-[11px] font-medium text-info-400">Trial</span>}
          {isPreviewPhase && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-secondary-400/40 text-[11px] font-medium text-secondary-400">Preview</span>}
          {isLockedPhase && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-error-400/40 text-[11px] font-medium text-error-400">Locked</span>}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{plan.displayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="text-lg font-bold text-foreground">${priceDollars}</span> /month · flat rate
          </p>
        </div>
        <ul className="space-y-1">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check size={11} className="text-success-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        {renewsAt && <p className="text-[11px] text-muted-foreground">Renews on {renewsAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>}
        {cancelsAt && (
          <p className="text-[11px] text-warning-400">
            Cancels {cancelsAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        )}
        {isPreviewPhase && (
          <p className="text-[11px] text-muted-foreground">Included in your free preview — buy to keep access once it ends.</p>
        )}
        {isTrialPhase && billing?.currentPeriodEnd && (
          <p className="text-[11px] text-muted-foreground">
            Trial ends {new Date(billing.currentPeriodEnd).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        )}
        {isPastDue && (
          <div className="flex items-start gap-1.5 rounded-lg border border-error-400/30 bg-error/5 px-2.5 py-2">
            <AlertTriangle size={13} className="text-error-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-error-400 leading-snug">Your last payment for this module failed.</p>
          </div>
        )}
        {isPastDue && (
          <Button variant="outline" size="sm" onClick={retryInvoice} loading={retrying} disabled={!isOwner}>
            Retry now
          </Button>
        )}
        {isOwned ? (
          isPendingCancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={undoCancel}
              loading={undoing}
              disabled={!isOwner}
              className="mt-auto border-warning-400/40 bg-warning/10 text-warning-400 hover:bg-warning/20"
            >
              Undo cancellation
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(true)} disabled={!isOwner} className="mt-auto">
              Cancel module
            </Button>
          )
        ) : (
          <Button size="sm" onClick={buy} loading={busy} disabled={!isOwner} className="mt-auto">
            {!subscription?.moduleTrialGrants?.includes(planModules[0])
              ? `Start Trial — ${plan.displayName}`
              : `Purchase ${plan.displayName}`}
          </Button>
        )}
      </div>

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setConfirmText("");
        }}
        title={`Cancel ${plan.displayName}?`}
        subtitle={
          isPaidModule
            ? "Access continues until the end of your billing period, then this is permanent."
            : "You're in preview, so nothing was charged. This is permanent."
        }
        variant="danger"
        size="sm"
        loading={busy}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowCancelConfirm(false); setConfirmText(""); }} disabled={busy}>
              Keep {plan.displayName}
            </Button>
            <Button variant="danger" size="sm" onClick={confirmCancel} loading={busy} disabled={!canConfirmCancel}>
              Cancel {plan.displayName}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{cancelCopy}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reconnecting requires a new purchase and fresh admin consent — this can&apos;t be undone
            {isPaidModule ? " once your billing period ends." : "."}
          </p>
          <FormField label={`Type "${plan.displayName}" to confirm`}>
            <input
              className={formInputClass()}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={plan.displayName}
              autoComplete="off"
            />
          </FormField>
        </div>
      </Modal>
    </>
  );
}
