"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Clock, AlertTriangle, Lock } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import type { SubscriptionView } from "@/src/services/auth";
import { formatModulesInPhase } from "@/src/lib/constants/modules";

interface ChipDef {
  Icon: typeof Clock;
  label: string;
  chipClass: string;
}

function buildChip(status: SubscriptionView["status"] | undefined): ChipDef | null {
  switch (status) {
    case "TRIAL":
      return { Icon: Clock, label: "Preview", chipClass: "bg-info/10 border-info/20 text-info-400" };
    case "GRACE":
      return { Icon: AlertTriangle, label: "Grace period", chipClass: "bg-warning/10 border-warning/20 text-warning-400" };
    case "LOCKED":
      return { Icon: Lock, label: "Locked", chipClass: "bg-error/10 border-error/20 text-error-400" };
    default:
      return null;
  }
}

function formatDays(status: SubscriptionView["status"], daysRemaining: number | null, hoursRemaining: number | null): string {
  if (status === "LOCKED") return "Upgrade to restore access";
  if (daysRemaining !== null && daysRemaining <= 1 && hoursRemaining) return `${hoursRemaining}h left`;
  if (daysRemaining !== null && daysRemaining > 0) return `${daysRemaining} days left`;
  return "";
}

export function HeaderStatusChip() {
  const { user } = useAuth();
  const subscription = user?.subscription ?? null;
  const modulesInTrial = subscription?.modulesInTrial ?? [];
  const modulesInGrace = subscription?.modulesInGrace ?? [];

  // Trial/Grace banners stay visible as long as ANY module is still riding that
  // phase, even if the tenant's overall status already moved past it because
  // one or two modules were purchased early — status alone hides it too soon.
  const effectiveStatus: SubscriptionView["status"] | undefined =
    subscription?.anyModuleInTrial && subscription.status !== "LOCKED"
      ? "TRIAL"
      : subscription?.anyModuleInGrace && subscription.status !== "LOCKED"
        ? "GRACE"
        : subscription?.status;

  const chip = useMemo(() => buildChip(effectiveStatus), [effectiveStatus]);
  if (!subscription || !chip) return null;

  const finalStatus: SubscriptionView["status"] = effectiveStatus ?? subscription.status;
  const daysLabel = formatDays(finalStatus, subscription.daysRemaining, subscription.hoursRemaining);
  const modulesLabel =
    effectiveStatus === "TRIAL"
      ? formatModulesInPhase(modulesInTrial, "on trial")
      : effectiveStatus === "GRACE"
        ? formatModulesInPhase(modulesInGrace, "in grace period")
        : "";
  const detail = [daysLabel, modulesLabel].filter(Boolean).join(" · ");

  return (
    <Link
      href="/dashboard/settings/billing"
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-opacity hover:opacity-80 shrink-0 ${chip.chipClass}`}
    >
      <chip.Icon size={13} />
      {chip.label}
      {detail && (
        <>
          <span className="opacity-40 mx-0.5">·</span>
          <span className="opacity-70 font-normal">{detail}</span>
        </>
      )}
    </Link>
  );
}
