"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { useImportJobs } from "@/src/hooks/data/useImportJobs";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_IMPORT_JOBS, SAMPLE_PP_ENVIRONMENTS } from "@/src/lib/sampleData/powerPlatform";
import { ImportWizard } from "./ImportWizard";
import { ImportResultPanel } from "./ImportResultPanel";
import type { ImportJob } from "@/src/types/powerPlatform";
import { UploadSimple } from "@phosphor-icons/react";
import { Cloud, Plus, X } from "lucide-react";

function statusVariant(status: ImportJob["status"]): "success" | "warning" | "error" | "info" {
  if (status === "COMPLETED") return "success";
  if (status === "COMPLETED_WITH_ERRORS") return "warning";
  if (status === "FAILED") return "error";
  return "info";
}

function statusLabel(status: ImportJob["status"]): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { jobs: realJobs, isLoading, error, refetch } = useImportJobs();
  const { environments: realEnvironments } = useEnvironments();
  const jobs = locked ? SAMPLE_PP_IMPORT_JOBS : realJobs;
  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [result, setResult] = useState<ImportJob | null>(null);

  const environmentName = environments.find((e) => e.environmentUrl === environmentUrl)?.environmentDisplayName;

  const startImport = () => {
    setResult(null);
    setShowWizard(true);
  };

  const handleComplete = (job: ImportJob) => {
    setResult(job);
    setShowWizard(false);
    refetch();
  };

  const handleStartAnother = () => {
    setResult(null);
    setShowWizard(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Import"
        description="Bulk-import CSV rows into a Dataverse table — pick a table, upload a file, map the columns, and run."
        envBadge={environmentName}
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Data Import", icon: UploadSimple },
        ]}
        action={
          showWizard ? (
            <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => setShowWizard(false)}>
              Cancel
            </Button>
          ) : (
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={startImport}>
              New Import
            </Button>
          )
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      {showWizard && (
        <ImportWizard
          environmentUrl={environmentUrl}
          onEnvironmentChange={setEnvironmentUrl}
          onComplete={handleComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {result && !showWizard && <ImportResultPanel job={result} onStartAnother={handleStartAnother} />}

      <DataTableMainHeader title={`Recent Imports (${jobs.length})`}>
          <DataTable<ImportJob>
            data={jobs}
            keyExtractor={(job) => job.id}
            loading={!locked && isLoading}
            error={locked ? undefined : error?.message}
            locked={locked}
            lockedTooltip={lockedTooltip}
            sortEnabled
            defaultSortField="createdAt"
            defaultSortDir="desc"
            columns={[
              {
                key: "fileName",
                header: "File",
                sortable: true,
                render: (_, job) => <span className="text-xs font-semibold text-foreground">{job.fileName}</span>,
              },
              {
                key: "targetTable",
                header: "Table",
                render: (_, job) => <span className="text-xs text-muted-foreground font-mono">{job.targetTable}</span>,
              },
              {
                key: "rows",
                header: "Rows",
                render: (_, job) => (
                  <span className="text-xs text-foreground/80 tabular-nums">
                    {job.successRows}/{job.totalRows}
                    {job.failedRows > 0 && <span className="text-error-400"> ({job.failedRows} failed)</span>}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (_, job) => <Badge variant={statusVariant(job.status)}>{statusLabel(job.status)}</Badge>,
              },
              {
                key: "userEmail",
                header: "By",
                hideOnMobile: true,
                render: (_, job) => <span className="text-xs text-muted-foreground">{job.userEmail}</span>,
              },
              {
                key: "createdAt",
                header: "When",
                sortable: true,
                hideOnMobile: true,
                render: (_, job) => (
                  <span className="text-xs text-foreground/70 tabular-nums">
                    {new Date(job.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })},{" "}
                    {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                ),
              },
            ]}
            emptyState={{
              icon: UploadSimple,
              title: "No imports yet",
              description: "CSV import jobs will appear here once run.",
            }}
          />
      </DataTableMainHeader>
    </div>
  );
}
