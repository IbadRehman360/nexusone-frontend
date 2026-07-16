"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  ChevronDown,
  Palette,
  RotateCcw,
  UserCog,
  RefreshCcw as RefreshIcon,
} from "lucide-react";
import { isDev } from "@/src/lib/devHarness";
import { cn } from "@/src/lib/utils/cn";
import { useAuth } from "@/src/hooks/useAuth";
import { ThemeCustomizer } from "@/src/components/pages/dashboard/configuration/settings/ThemeCustomizer";
import {
  getImpersonationStatus,
  startImpersonation,
  stopImpersonation,
  resetOwnOnboarding,
  toggleTenantStatus,
  startModuleScenario,
  stopModuleScenario,
} from "@/src/services/dev/impersonationApi";

type PanelTab = "theme" | "role" | "onboarding";

const TABS: { id: PanelTab; label: string; icon: typeof Palette }[] = [
  { id: "theme", label: "Theme Testing", icon: Palette },
  { id: "role", label: "Role Testing", icon: UserCog },
  { id: "onboarding", label: "Onboarding", icon: RefreshIcon },
];

/**
 * Dev-only floating panel: Theme Testing, Role Testing (tenant-role
 * capability impersonation), and Onboarding (reset registration state /
 * toggle tenant approval status) — all hitting real backend endpoints, not
 * client-side fakes, except the Theme tab.
 */
export function DevTestingPanel() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("theme");
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [moduleScenarioBusy, setModuleScenarioBusy] = useState(false);
  const queryClient = useQueryClient();

  const { data: impersonationStatus } = useQuery({
    queryKey: ["dev", "impersonation-status"],
    queryFn: getImpersonationStatus,
    enabled: isDev && isAuthenticated,
    staleTime: 10_000,
  });

  const activeRole = impersonationStatus?.active ?? null;
  const activeModuleScenario = impersonationStatus?.activeModuleScenario ?? null;

  const refreshEverything = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    await queryClient.invalidateQueries({ queryKey: ["billing"] });
    await queryClient.invalidateQueries({ queryKey: ["tenants"] });
    await queryClient.refetchQueries({ queryKey: ["dev", "impersonation-status"] });
  };

  const applyRole = async (roleName: string) => {
    setRoleBusy(roleName);
    try {
      await startImpersonation(roleName);
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't impersonate role", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setRoleBusy(null);
    }
  };

  const revertRole = async () => {
    setRoleBusy("revert");
    try {
      await stopImpersonation();
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't revert role", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setRoleBusy(null);
    }
  };

  const handleResetOnboarding = async () => {
    if (!window.confirm("This deletes your ENTIRE organization — every tenant, member, and invite tied to it — so the next sign-in starts registration from scratch. Continue?")) {
      return;
    }
    setResetBusy(true);
    try {
      await resetOwnOnboarding();
      toast.success("Onboarding reset — you'll be signed out now.");
      window.location.href = "/signin";
    } catch (err) {
      toast.error("Couldn't reset onboarding", { description: err instanceof Error ? err.message : "Please try again." });
      setResetBusy(false);
    }
  };

  const handleToggleTenantStatus = async () => {
    setToggleBusy(true);
    try {
      const { status } = await toggleTenantStatus();
      toast.success(`Tenant status is now "${status}"`, {
        description:
          status === "pending_approval"
            ? "The holding screen will show on next load — use this toggle again to flip back."
            : "The tenant is unblocked — dashboard access is restored.",
      });
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't toggle tenant status", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setToggleBusy(false);
    }
  };

  const handleStartLockedScenario = async () => {
    setModuleScenarioBusy(true);
    try {
      await startModuleScenario("trial-ended");
      toast.success("Simulating fully locked tenant", {
        description: "Every module now genuinely 403s, as if the 3-day window expired.",
      });
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't start the locked-tenant simulation", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setModuleScenarioBusy(false);
    }
  };

  const handleClearModuleScenario = async () => {
    setModuleScenarioBusy(true);
    try {
      await stopModuleScenario();
      toast.success("Module scenario cleared", { description: "Real subscription status is back in effect." });
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't clear the module scenario", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setModuleScenarioBusy(false);
    }
  };

  // Every tab except Theme Testing needs a real session (Role/Onboarding
  // both hit @AuthenticatedOnly() endpoints) — hide the whole panel rather than
  // show controls that just 401 on pages like /signin.
  if (!isDev || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-9999 select-none">
      {open ? (
        <div className="rounded-xl border border-warning/30 bg-card shadow-2xl shadow-warning/10 overflow-hidden transition-all duration-200 w-205">
          <div className="flex items-center justify-between px-3 py-2 bg-warning/10 border-b border-warning/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-warning-400">
              <FlaskConical size={13} />
              Dev Testing Settings
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Collapse"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center border-b border-border/20 bg-card">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium relative whitespace-nowrap",
                  tab === t.id ? "text-warning-400" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon size={11} />
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-warning-400 rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-3">
            {tab === "theme" && <ThemeCustomizer />}

            {tab === "role" && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground mb-2">
                  Re-issues your session with a preset role's REAL capabilities baked in — Owner-only buttons, capability
                  gates, and backend 403s all respond as that role, not a UI skin.
                </p>

                {!impersonationStatus?.eligible ? (
                  <p className="text-[11px] text-error-400">Not eligible for role impersonation on this account.</p>
                ) : (
                  <>
                    {impersonationStatus.roles.map((roleName) => (
                      <button
                        key={roleName}
                        onClick={() => applyRole(roleName)}
                        disabled={roleBusy !== null}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                          activeRole === roleName ? "border-info-400 bg-info/10 text-info-400" : "border-border/40 text-foreground hover:border-border/70",
                        )}
                      >
                        <UserCog size={13} className={roleBusy === roleName ? "animate-pulse" : ""} />
                        {roleName}
                      </button>
                    ))}

                    <button
                      onClick={revertRole}
                      disabled={roleBusy !== null || !activeRole}
                      className="w-full px-3 py-2 rounded-lg border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 disabled:opacity-40 transition-colors"
                    >
                      <RotateCcw size={13} className={cn("inline mr-1.5", roleBusy === "revert" && "animate-spin")} />
                      Revert to real role
                    </button>
                  </>
                )}
              </div>
            )}

            {tab === "onboarding" && (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-foreground/80 mb-1">Reset onboarding</p>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Deletes your whole organization (every tenant, member, invite) so the next sign-in re-triggers
                    registration from scratch — exercises the real auto-onboard + approval flow, not a mock. Every
                    module connection (Entra ID, Power Platform, Purview) is cleared along with it, since it cascades
                    from the deleted tenant.
                  </p>
                  <button
                    onClick={handleResetOnboarding}
                    disabled={resetBusy}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-error-400/30 bg-error/5 text-xs font-medium text-error-400 hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    <RefreshIcon size={13} className={resetBusy ? "animate-spin" : ""} />
                    Reset my onboarding
                  </button>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <p className="text-[11px] font-semibold text-foreground/80 mb-1">Tenant approval status</p>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Flips your current tenant between <code>active</code> and <code>pending_approval</code> to test the
                    holding screen without a backoffice login.
                  </p>
                  <button
                    onClick={handleToggleTenantStatus}
                    disabled={toggleBusy}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 text-xs font-medium text-foreground hover:border-border/70 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={13} className={toggleBusy ? "animate-spin" : ""} />
                    Toggle Pending ↔ Approved
                  </button>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <p className="text-[11px] font-semibold text-foreground/80 mb-1">Module lifecycle simulation</p>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Applies a real backend scenario inside SubscriptionsService — module pages actually 403, not just a
                    UI preview. Use this to test the &quot;3-day window expired, everything locked&quot; state without
                    waiting.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartLockedScenario}
                      disabled={moduleScenarioBusy}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                        activeModuleScenario === "trial-ended"
                          ? "border-error-400/50 bg-error/10 text-error-400"
                          : "border-border/40 text-foreground hover:border-border/70",
                      )}
                    >
                      <RefreshIcon size={13} className={moduleScenarioBusy ? "animate-spin" : ""} />
                      Simulate: Fully locked
                    </button>
                    <button
                      onClick={handleClearModuleScenario}
                      disabled={moduleScenarioBusy || !activeModuleScenario}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 disabled:opacity-40 transition-colors"
                    >
                      <RotateCcw size={13} className={moduleScenarioBusy ? "animate-spin" : ""} />
                      Clear simulation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "rounded-full border shadow-lg flex items-center gap-2 px-2 py-2",
            "bg-card hover:bg-muted/40 transition-colors",
            activeRole ? "border-warning/40 text-warning-400" : "border-border/40 text-muted-foreground hover:text-foreground",
          )}
          aria-label="Open dev test panel"
        >
          <FlaskConical size={13} />
        </button>
      )}
    </div>
  );
}
