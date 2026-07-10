import { useMemo } from "react";
import type { DlpAlert } from "@/src/types/purview";
import { DLP_SEVERITY_LABELS, DLP_SEVERITY_BAR, DLP_SEVERITY_ORDER } from "../dlp/dlpConstants";
import { cleanWorkload, resolvePolicyName } from "../dlp/dlpShared";

function BarRow({ label, count, max, colorClass }: { label: string; count: number; max: number; colorClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-medium text-foreground">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${(count / max) * 100}%` }} />
      </div>
    </div>
  );
}

export function DlpOverviewPanel({ alerts }: { alerts: DlpAlert[] }) {
  const bySeverity = useMemo(() => {
    return DLP_SEVERITY_ORDER
      .map((severity) => ({ severity, count: alerts.filter((a) => a.severity === severity).length }))
      .filter((row) => row.count > 0);
  }, [alerts]);

  const byWorkload = useMemo(() => {
    const counts = new Map<string, number>();
    for (const alert of alerts) {
      const workload = cleanWorkload(alert.location);
      counts.set(workload, (counts.get(workload) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [alerts]);

  const topPolicies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const alert of alerts) {
      const name = resolvePolicyName(alert) !== "—" ? resolvePolicyName(alert) : alert.displayName;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [alerts]);

  if (alerts.length === 0) {
    return <p className="text-xs text-muted-foreground">No DLP incidents found.</p>;
  }

  const severityMax = Math.max(1, ...bySeverity.map((r) => r.count));
  const workloadMax = Math.max(1, ...byWorkload.map(([, count]) => count));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-foreground/80">By severity</p>
        {bySeverity.map((row) => (
          <BarRow key={row.severity} label={DLP_SEVERITY_LABELS[row.severity]} count={row.count} max={severityMax} colorClass={DLP_SEVERITY_BAR[row.severity]} />
        ))}

        <p className="text-[11px] font-semibold text-foreground/80 pt-2">Top triggered policies</p>
        <div className="space-y-1.5">
          {topPolicies.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground truncate max-w-40">{name}</span>
              <span className="text-[11px] font-medium text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-foreground/80">By workload</p>
        {byWorkload.map(([workload, count]) => (
          <BarRow key={workload} label={workload} count={count} max={workloadMax} colorClass="bg-info-400" />
        ))}
      </div>
    </div>
  );
}
