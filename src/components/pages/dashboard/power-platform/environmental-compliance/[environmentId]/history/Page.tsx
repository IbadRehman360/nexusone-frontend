"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { getComplianceHistory, runComplianceCheck } from "@/src/services/power-platform/complianceApi";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_ENVIRONMENTS, SAMPLE_PP_COMPLIANCE_HISTORY } from "@/src/lib/sampleData/powerPlatform";
import { ComplianceDetailHeader } from "../ComplianceDetailHeader";
import type { ComplianceReport } from "@/src/types/powerPlatform";
import { History } from "lucide-react";

function statusVariant(status: ComplianceReport["status"]): "success" | "warning" | "error" {
  if (status === "compliant") return "success";
  if (status === "at_risk") return "warning";
  return "error";
}

export default function Page() {
  const params = useParams<{ environmentId: string }>();
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { environments: realEnvironments } = useEnvironments();
  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const environment = environments.find((e) => e.environmentId === params.environmentId);

  const [history, setHistory] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(!locked);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (locked) return;
    setLoading(true);
    getComplianceHistory(params.environmentId)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [params.environmentId, locked]);

  // Sample data is a static constant, so it's derived at render time rather
  // than pushed into state via an effect (avoids a redundant extra render).
  const activeHistory = locked ? SAMPLE_PP_COMPLIANCE_HISTORY : history;
  const activeLoading = locked ? false : loading;

  const handleRunCheck = async () => {
    if (locked) return;
    setRunning(true);
    try {
      const r = await runComplianceCheck(params.environmentId);
      toast.success("Compliance check complete", { description: `Score: ${r.score}%` });
      setHistory((prev) => [r, ...prev]);
    } catch (err) {
      toast.error("Failed to run compliance check", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setRunning(false);
    }
  };

  const name = environment?.environmentDisplayName ?? environment?.displayName ?? environment?.environmentName ?? "Environment";

  return (
    <div className="space-y-6">
      <ComplianceDetailHeader name={name} isHistory onRunCheck={handleRunCheck} running={running} locked={locked} lockedTooltip={lockedTooltip} />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader title={`History (${activeHistory.length})`}>
        <DataTable<ComplianceReport>
          data={activeHistory}
          keyExtractor={(r) => r.id}
          loading={activeLoading}
          locked={locked}
          lockedTooltip={lockedTooltip}
          columns={[
            {
              key: "checkedAt",
              header: "Date",
              render: (_, r) => <span className="text-xs text-foreground/80 tabular-nums">{new Date(r.checkedAt).toLocaleString()}</span>,
            },
            {
              key: "score",
              header: "Score",
              render: (_, r) => <span className="text-xs font-semibold text-foreground tabular-nums">{r.score}/100</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (_, r) => <Badge variant={statusVariant(r.status)}>{r.status.replace("_", " ")}</Badge>,
            },
            {
              key: "passedFailed",
              header: "Passed / Failed",
              render: (_, r) => {
                const passed = r.checks.filter((c) => c.status === "pass").length;
                const failed = r.checks.filter((c) => c.status === "fail").length;
                return (
                  <span className="text-xs tabular-nums">
                    <span className="text-success-400 font-medium">{passed} passed</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-error-400 font-medium">{failed} failed</span>
                  </span>
                );
              },
            },
          ]}
          emptyState={{
            icon: History,
            title: "No history yet",
            description: "Past compliance reports for this environment will appear here.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
