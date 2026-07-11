"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/display/Badge";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { getLatestComplianceReport, runComplianceCheck } from "@/src/services/power-platform/complianceApi";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_ENVIRONMENTS, SAMPLE_PP_COMPLIANCE_REPORT } from "@/src/lib/sampleData/powerPlatform";
import { ComplianceDetailHeader } from "./ComplianceDetailHeader";
import type { ComplianceCheck, ComplianceReport } from "@/src/types/powerPlatform";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, ClipboardList } from "lucide-react";

function statusVariant(status: ComplianceReport["status"]): "success" | "warning" | "error" {
  if (status === "compliant") return "success";
  if (status === "at_risk") return "warning";
  return "error";
}

const CHECK_ICON: Record<ComplianceCheck["status"], { icon: typeof CheckCircle2; className: string }> = {
  pass: { icon: CheckCircle2, className: "text-success-400" },
  fail: { icon: XCircle, className: "text-error-400" },
  warning: { icon: AlertTriangle, className: "text-warning-400" },
  skipped: { icon: MinusCircle, className: "text-muted-foreground" },
};

export default function Page() {
  const params = useParams<{ environmentId: string }>();
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { environments: realEnvironments } = useEnvironments();
  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const environment = environments.find((e) => e.environmentId === params.environmentId);

  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [reportLoading, setReportLoading] = useState(!locked);
  const [reportError, setReportError] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (locked) return;
    setReportLoading(true);
    setReportError(false);
    getLatestComplianceReport(params.environmentId)
      .then(setReport)
      .catch(() => setReportError(true))
      .finally(() => setReportLoading(false));
  }, [params.environmentId, locked]);

  // Sample data is a static constant, so it's derived at render time rather
  // than pushed into state via an effect (avoids a redundant extra render).
  const activeReport = locked ? SAMPLE_PP_COMPLIANCE_REPORT : report;
  const activeReportLoading = locked ? false : reportLoading;
  const activeReportError = locked ? false : reportError;

  const handleRunCheck = async () => {
    if (locked) return;
    setRunning(true);
    try {
      const r = await runComplianceCheck(params.environmentId);
      toast.success("Compliance check complete", { description: `Score: ${r.score}%` });
      setReport(r);
      setReportError(false);
    } catch (err) {
      toast.error("Failed to run compliance check", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setRunning(false);
    }
  };

  const name = environment?.environmentDisplayName ?? environment?.displayName ?? environment?.environmentName ?? "Environment";

  return (
    <div className="space-y-6">
      <ComplianceDetailHeader name={name} onRunCheck={handleRunCheck} running={running} locked={locked} lockedTooltip={lockedTooltip} />

      <ModuleConnectBanner module="pp" />

      <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5">
        {activeReportLoading ? (
          <p className="text-xs text-muted-foreground">Loading report…</p>
        ) : activeReportError || !activeReport ? (
          <div className="py-10 text-center">
            <ClipboardList size={22} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">No compliance report yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Run a check to generate the first report for this environment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground tabular-nums">{activeReport.score}%</span>
              <Badge variant={statusVariant(activeReport.status)}>{activeReport.status.replace("_", " ")}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">Checked {new Date(activeReport.checkedAt).toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              {activeReport.checks.map((check) => {
                const { icon: Icon, className } = CHECK_ICON[check.status];
                return (
                  <div key={check.checkId} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-muted/10 border border-border/30">
                    <Icon size={16} className={`shrink-0 mt-0.5 ${className}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{check.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{check.details || check.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
