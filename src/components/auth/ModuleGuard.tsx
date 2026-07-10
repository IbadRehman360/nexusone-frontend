"use client";

import { PackageX } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export type SubscriptionModule = "entra" | "pp" | "purview";

const MODULE_LABELS: Record<SubscriptionModule, string> = {
  entra: "Entra ID",
  pp: "Power Platform",
  purview: "Purview",
};

function ModuleNotAvailable({ module }: { module: SubscriptionModule }) {
  const label = MODULE_LABELS[module];
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-info/10 border border-info/20 flex items-center justify-center">
          <PackageX size={36} className="text-info-400" strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">{label} isn't part of your plan</h1>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
        This tenant hasn't purchased {label}, and its trial (if any) has ended.
      </p>
      <a
        href="/dashboard/settings/billing"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-info text-info-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Go to Billing
      </a>
    </div>
  );
}

/**
 * Blocks a module's pages when the tenant doesn't currently own that module
 * (not purchased, and any trial/grace window for it has ended) — mirrors the
 * reference app's ProtectedRoute module gate, minus the capability/role
 * checks (RBAC isn't built in this app yet). Reads `user.subscription.modules`
 * — the EFFECTIVE set (paid ∪ still-in-trial ∪ in-grace) — so a module still
 * inside its trial or grace window stays reachable, only a genuinely LOCKED
 * or never-purchased module is blocked.
 */
export function ModuleGuard({ module, children }: { module: SubscriptionModule; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const owned = user?.subscription?.modules?.includes(module) ?? false;
  if (!owned) return <ModuleNotAvailable module={module} />;

  return <>{children}</>;
}
