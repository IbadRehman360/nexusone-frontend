"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  ChevronDown,
  Palette,
  Clock,
  RotateCcw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  UserCog,
  RefreshCcw as RefreshIcon,
} from "lucide-react";
import { isDev } from "@/src/lib/devHarness";
import { cn } from "@/src/lib/utils/cn";
import { useAuth } from "@/src/hooks/useAuth";
import { ThemeCustomizer } from "@/src/components/pages/dashboard/configuration/settings/ThemeCustomizer";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { setDevTrialScenario, clearDevTrialScenario } from "@/src/store/slices/trialSlice";
import {
  getImpersonationStatus,
  startModuleScenario,
  stopModuleScenario,
  startImpersonation,
  stopImpersonation,
  resetOwnOnboarding,
  toggleTenantStatus,
  type ModuleScenario,
} from "@/src/services/dev/impersonationApi";

type PanelScenario = "current" | "trial" | ModuleScenario;
type PanelTab = "theme" | "trial" | "role" | "onboarding";

const SERVER_SCENARIOS: { id: ModuleScenario; label: string; hint: string; icon: typeof Clock }[] = [
  { id: "grace-period", label: "Grace period", hint: "Real backend: GRACE status, no modules purchased", icon: AlertTriangle },
  { id: "trial-ended", label: "Locked", hint: "Real backend: LOCKED — every module page 403s", icon: Lock },
  { id: "all-unlocked", label: "Active (no chip)", hint: "Real backend: all modules purchased and accessible", icon: CheckCircle2 },
];

const TABS: { id: PanelTab; label: string; icon: typeof Palette }[] = [
  { id: "theme", label: "Theme Testing", icon: Palette },
  { id: "trial", label: "Trial Testing", icon: Clock },
  { id: "role", label: "Role Testing", icon: UserCog },
  { id: "onboarding", label: "Onboarding", icon: RefreshIcon },
];

/**
 * Dev-only floating panel: Theme Testing, Trial Testing (module/subscription
 * scenarios), Role Testing (tenant-role capability impersonation), and
 * Onboarding (reset registration state / toggle tenant approval status) —
 * all hitting real backend endpoints, not client-side fakes, except the
 * Theme tab and the Trial tab's "Trial active" preview.
 */
export function DevTestingPanel() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("theme");
  const [switching, setSwitching] = useState<PanelScenario | "revert" | null>(null);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(false);
  const dispatch = useAppDispatch();
  const clientScenario = useAppSelector((s) => s.trial.scenario);
  const queryClient = useQueryClient();

  const { data: impersonationStatus } = useQuery({
    queryKey: ["dev", "impersonation-status"],
    queryFn: getImpersonationStatus,
    enabled: isDev && isAuthenticated,
    staleTime: 10_000,
  });

  const activeServerScenario = impersonationStatus?.activeModuleScenario ?? null;
  const activeScenario: PanelScenario = activeServerScenario ?? clientScenario ?? "current";
  const activeRole = impersonationStatus?.active ?? null;

  const refreshEverything = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    await queryClient.invalidateQueries({ queryKey: ["billing"] });
    await queryClient.invalidateQueries({ queryKey: ["tenants"] });
    await queryClient.refetchQueries({ queryKey: ["dev", "impersonation-status"] });
  };

  const applyClientTrial = async () => {
    setSwitching("trial");
    try {
      // A leftover real scenario would keep the backend reporting GRACE/LOCKED
      // while Redux layers a fake TRIAL preview on top — clear it first so
      // the UI and real access agree.
      if (activeServerScenario) await stopModuleScenario();
      dispatch(setDevTrialScenario("trial"));
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't switch scenario", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSwitching(null);
    }
  };

  const applyServerScenario = async (scenario: ModuleScenario) => {
    setSwitching(scenario);
    try {
      dispatch(clearDevTrialScenario());
      await startModuleScenario(scenario);
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't switch scenario", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSwitching(null);
    }
  };

  const revertToCurrent = async () => {
    setSwitching("revert");
    try {
      dispatch(clearDevTrialScenario());
      if (activeServerScenario) await stopModuleScenario();
      await refreshEverything();
    } catch (err) {
      toast.error("Couldn't revert", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSwitching(null);
    }
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

  // Every tab except Theme Testing needs a real session (Trial/Role/Onboarding
  // all hit @AuthenticatedOnly() endpoints) — hide the whole panel rather than
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

            {tab === "trial" && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground mb-2">
                  <strong className="text-foreground/80">Trial active</strong> is a client-side preview only (mid-trial is
                  already the real default state). The rest hit the real backend — module pages, Billing, and the invite
                  picker are genuinely gated accordingly, not just the header chip.
                </p>

                <button
                  onClick={revertToCurrent}
                  disabled={switching !== null}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                    activeScenario === "current" ? "border-info-400 bg-info/10 text-info-400" : "border-border/40 text-foreground hover:border-border/70",
                  )}
                >
                  <RotateCcw size={13} className={switching === "revert" ? "animate-spin" : ""} />
                  Current
                </button>

                <button
                  onClick={applyClientTrial}
                  disabled={switching !== null}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                    activeScenario === "trial" ? "border-info-400 bg-info/10 text-info-400" : "border-border/40 text-foreground hover:border-border/70",
                  )}
                >
                  <Clock size={13} className={switching === "trial" ? "animate-pulse" : ""} />
                  Trial active
                </button>

                {SERVER_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => applyServerScenario(s.id)}
                    disabled={switching !== null}
                    title={s.hint}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                      activeScenario === s.id ? "border-info-400 bg-info/10 text-info-400" : "border-border/40 text-foreground hover:border-border/70",
                    )}
                  >
                    <s.icon size={13} className={switching === s.id ? "animate-pulse" : ""} />
                    {s.label}
                  </button>
                ))}

                <button
                  onClick={revertToCurrent}
                  disabled={switching !== null || activeScenario === "current"}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 disabled:opacity-40 transition-colors"
                >
                  Clear override (use real status)
                </button>
              </div>
            )}

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
                    registration from scratch — exercises the real auto-onboard + approval flow, not a mock.
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
            activeScenario !== "current" ? "border-warning/40 text-warning-400" : "border-border/40 text-muted-foreground hover:text-foreground",
          )}
          aria-label="Open dev test panel"
        >
          <FlaskConical size={13} />
        </button>
      )}
    </div>
  );
}
