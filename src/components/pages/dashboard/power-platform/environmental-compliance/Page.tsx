"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { runComplianceCheck } from "@/src/services/power-platform/complianceApi";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_COMPLIANCE_OVERVIEW } from "@/src/lib/sampleData/powerPlatform";
import { showApiError } from "@/src/lib/errors/showApiError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { ComplianceOverviewItem } from "@/src/types/powerPlatform";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Cloud, ClipboardList, History, Zap } from "lucide-react";
import { ShieldCheck } from "@phosphor-icons/react";

function statusVariant(status: ComplianceOverviewItem["status"]): "success" | "warning" | "error" | "neutral" {
  if (status === "compliant") return "success";
  if (status === "at_risk") return "warning";
  if (status === "non_compliant") return "error";
  return "neutral";
}

export default function Page() {
  const router = useRouter();
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { overview: realOverview, isLoading: realIsLoading, error: realError, refetch } = useComplianceOverview();
  const overview = locked ? SAMPLE_PP_COMPLIANCE_OVERVIEW : realOverview;
  const isLoading = locked ? false : realIsLoading;
  const error = locked ? undefined : realError;
  const summary = overview?.summary;
  const items = overview?.items ?? [];
  const [runningId, setRunningId] = useState<string | null>(null);

  const goToDetail = (environmentId: string, tab?: "history") => {
    const suffix = tab === "history" ? "/history" : "";
    router.push(`/dashboard/power-platform/environmental-compliance/${environmentId}${suffix}`);
  };

  const handleRunCheck = async (environmentId: string) => {
    if (locked) return;
    setRunningId(environmentId);
    try {
      const r = await runComplianceCheck(environmentId);
      toast.success("Compliance check complete", { description: `Score: ${r.score}%` });
      await refetch();
    } catch (err) {
      showApiError(err, { title: "Failed to run compliance check" });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        description="Environmental compliance posture across your environments."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Compliance", icon: ShieldCheck },
        ]}
      />

      <ModuleConnectBanner module="pp" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Compliant" value={summary?.compliant ?? 0} icon={CheckCircle2} color="green" isLoading={isLoading} />
        <StatsCard title="At Risk" value={summary?.at_risk ?? 0} icon={AlertTriangle} color="orange" isLoading={isLoading} />
        <StatsCard title="Non-Compliant" value={summary?.non_compliant ?? 0} icon={XCircle} color="red" isLoading={isLoading} />
        <StatsCard title="No Report" value={summary?.no_report ?? 0} icon={HelpCircle} color="neutral" isLoading={isLoading} />
      </div>

      <DataTableMainHeader title={`Environments (${items.length})`}>
        <DataTable<ComplianceOverviewItem>
          data={items}
          keyExtractor={(item) => item.environmentId}
          loading={isLoading}
          error={error ? presentError(error) : undefined}
          locked={locked}
          lockedTooltip={lockedTooltip}
          sortEnabled
          defaultSortField="score"
          defaultSortDir="desc"
          onRowClick={(item) => goToDetail(item.environmentId)}
          columns={[
            {
              key: "environmentName",
              header: "Environment",
              sortable: true,
              render: (_, item) => <span className="text-xs font-semibold text-foreground">{item.environmentName}</span>,
            },
            {
              key: "score",
              header: "Score",
              sortable: true,
              align: "center",
              render: (_, item) => (
                <span className="text-xs font-medium text-foreground/80 tabular-nums">
                  {item.score != null ? `${item.score}%` : "—"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (_, item) =>
                item.status ? (
                  <Badge variant={statusVariant(item.status)}>{item.status.replace("_", " ")}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No report</span>
                ),
            },
            {
              key: "checkedAt",
              header: "Checked",
              hideOnMobile: true,
              render: (_, item) => (
                <span className="text-xs text-foreground/70 tabular-nums">
                  {item.checkedAt ? new Date(item.checkedAt).toLocaleDateString() : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, item) => (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {item.status && (
                    <>
                      <Button variant="outline" size="sm" leftIcon={<ClipboardList size={13} />} onClick={() => goToDetail(item.environmentId)}>
                        Report
                      </Button>
                      <Button variant="outline" size="sm" leftIcon={<History size={13} />} onClick={() => goToDetail(item.environmentId, "history")}>
                        History
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    leftIcon={<Zap size={13} />}
                    onClick={() => handleRunCheck(item.environmentId)}
                    loading={runningId === item.environmentId}
                  >
                    Run Check
                  </Button>
                </div>
              ),
            },
          ]}
          emptyState={{
            icon: ShieldCheck,
            title: "No compliance reports yet",
            description: "Compliance checks for your environments will appear here.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
