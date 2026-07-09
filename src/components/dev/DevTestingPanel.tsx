"use client";

import { useState } from "react";
import { FlaskConical, ChevronDown, ChevronUp, Palette, Bug, Clock } from "lucide-react";
import { isDev } from "@/src/lib/devHarness";
import { cn } from "@/src/lib/utils/cn";
import { ThemeCustomizer } from "@/src/components/pages/dashboard/configuration/settings/ThemeCustomizer";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { setDevTrialScenario, clearDevTrialScenario, type DevTrialScenario } from "@/src/store/slices/trialSlice";

const SCENARIOS: { id: DevTrialScenario; label: string }[] = [
  { id: "trial", label: "Trial active" },
  { id: "grace", label: "Grace period" },
  { id: "locked", label: "Locked" },
  { id: "active", label: "Active (no chip)" },
];

/**
 * Dev-only floating panel. Theme Testing plus a Trial Testing tab that
 * overlays a fake subscription status onto the real user (see useAuth) so
 * the header trial/grace/locked chip can be previewed without a tenant
 * actually being in that state — mirrors the old app's dev trial overrides.
 */
export function DevTestingPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"theme" | "trial">("theme");
  const dispatch = useAppDispatch();
  const scenario = useAppSelector((s) => s.trial.scenario);

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
                  Overlays a fake subscription status onto the real user — previews the header chip without needing a tenant actually in that state.
                </p>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => dispatch(setDevTrialScenario(s.id))}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
                      scenario === s.id ? "border-info-400 bg-info/10 text-info-400" : "border-border/40 text-foreground hover:border-border/70",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  onClick={() => dispatch(clearDevTrialScenario())}
                  disabled={!scenario}
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
            "border-border/40 text-muted-foreground hover:text-foreground",
          )}
          aria-label="Open dev test panel"
        >
          <span className="text-xs font-medium"> -</span>
        </button>
      )}
    </div>
  );
}
