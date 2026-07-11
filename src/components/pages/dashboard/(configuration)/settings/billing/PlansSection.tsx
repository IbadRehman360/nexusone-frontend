"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { useAuth } from "@/src/hooks/useAuth";
import { useBillingPlans, useInvalidateBilling } from "@/src/hooks/data/useBilling";
import { redirectToCheckout, cancelModule, retryModuleInvoice } from "@/src/services/billing/billingApi";
import { MODULE_BY_KEY } from "./moduleCatalog";
import type { PlanListItem, ModuleBillingInfo } from "@/src/services/billing/billingApi";

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
          ? "Move to a paid plan to keep your modules unlocked after the trial. Cancel anytime."
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const planModules = plan.modules ?? [];
  const isStandalone = planModules.length === 1;
  const moduleKey = isStandalone ? planModules[0] : null;
  const isOwned = planModules.length > 0 && planModules.every((m) => paidModules.includes(m));
  const isInTrial = planModules.some((m) => modulesInTrial.includes(m));
  const meta = isStandalone ? MODULE_BY_KEY[planModules[0]] : undefined;
  const Icon = meta?.icon ?? Users;
  const priceDollars = Math.round(plan.monthlyUSDcents / 100);
  const features = (plan.features?.length ?? 0) > 0 ? plan.features : meta?.features ?? [];

  const billing = moduleKey ? moduleBilling?.[moduleKey] : undefined;
  const isPastDue = isOwned && billing?.stripeSubscriptionStatus === "past_due";
  const renewsAt = isOwned && !isPastDue && billing?.currentPeriodEnd && !billing.cancelAtPeriodEnd ? new Date(billing.currentPeriodEnd) : null;

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
    if (!isOwner || busy || !moduleKey) return;
    setBusy(true);
    try {
      await cancelModule(moduleKey);
      toast.success("Module canceled", { description: `${plan.displayName} will no longer renew.` });
      setShowCancelConfirm(false);
      await invalidate();
    } catch (err) {
      toast.error("Couldn't cancel module", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
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
          {isOwned && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-success-400/40 text-[11px] font-medium text-success-400">Owned</span>}
          {!isOwned && isInTrial && <span className="inline-flex items-center px-1.5 py-px rounded-full border border-info-400/40 text-[11px] font-medium text-info-400">Trial</span>}
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
        {!isOwned && isInTrial && (
          <p className="text-[11px] text-info-400">Included in your free trial — buy to keep access once it ends.</p>
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
          <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(true)} disabled={!isOwner} className="mt-auto">
            Cancel module
          </Button>
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
        onClose={() => setShowCancelConfirm(false)}
        title={`Cancel ${plan.displayName}?`}
        subtitle="This is a billing change — it takes effect immediately and can't be undone."
        variant="danger"
        size="sm"
        loading={busy}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)} disabled={busy}>
              Keep module
            </Button>
            <Button variant="danger" size="sm" onClick={confirmCancel} loading={busy}>
              Cancel module
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          You'll lose access to <span className="font-semibold">{plan.displayName}</span> and its data will stop syncing. You can buy it again anytime.
        </p>
      </Modal>
    </>
  );
}
