"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, ChevronDown, Palette, Clock, RotateCcw, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
import { isDev } from "@/src/lib/devHarness";
import { cn } from "@/src/lib/utils/cn";
import { ThemeCustomizer } from "@/src/components/pages/dashboard/configuration/settings/ThemeCustomizer";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { setDevTrialScenario, clearDevTrialScenario } from "@/src/store/slices/trialSlice";
import { getImpersonationStatus, startModuleScenario, stopModuleScenario, type ModuleScenario } from "@/src/services/dev/impersonationApi";

type PanelScenario = "current" | "trial" | ModuleScenario;

const SERVER_SCENARIOS: { id: ModuleScenario; label: string; hint: string; icon: typeof Clock }[] = [
  { id: "grace-period", label: "Grace period", hint: "Real backend: GRACE status, no modules purchased", icon: AlertTriangle },
  { id: "trial-ended", label: "Locked", hint: "Real backend: LOCKED — every module page 403s", icon: Lock },
  { id: "all-unlocked", label: "Active (no chip)", hint: "Real backend: all modules purchased and accessible", icon: CheckCircle2 },
];

/**
 * Dev-only floating panel. Theme Testing plus a Trial Testing tab.
 *
 * "Trial active" stays a pure client-side Redux preview — mid-trial is the
 * real default state for a fresh tenant, so there's nothing to switch on the
 * backend for it (matches the reference app). The other three scenarios hit
 * the real `/dev/impersonate/module-scenario` endpoint: the backend actually
 * reports GRACE/LOCKED/ACTIVE on every subsequent request, so module pages,
 * the Billing page, and the invite picker are genuinely gated accordingly —
 * not just a header-chip skin.
 */
export function DevTestingPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"theme" | "trial">("theme");
  const [switching, setSwitching] = useState<PanelScenario | "revert" | null>(null);
  const dispatch = useAppDispatch();
  const clientScenario = useAppSelector((s) => s.trial.scenario);
  const queryClient = useQueryClient();

  const { data: impersonationStatus } = useQuery({
    queryKey: ["dev", "impersonation-status"],
    queryFn: getImpersonationStatus,
    enabled: isDev,
    staleTime: 10_000,
  });

  const activeServerScenario = impersonationStatus?.activeModuleScenario ?? null;
  const activeScenario: PanelScenario = activeServerScenario ?? clientScenario ?? "current";

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

  if (!isDev) return null;

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
            <button
              onClick={() => setTab("theme")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium relative",
                tab === "theme" ? "text-warning-400" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Palette size={11} />
              Theme Testing
              {tab === "theme" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-warning-400 rounded-t-full" />}
            </button>
            <button
              onClick={() => setTab("trial")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium relative",
                tab === "trial" ? "text-warning-400" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Clock size={11} />
              Trial Testing
              {tab === "trial" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-warning-400 rounded-t-full" />}
            </button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-3">
            {tab === "theme" ? (
              <ThemeCustomizer />
            ) : (
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
