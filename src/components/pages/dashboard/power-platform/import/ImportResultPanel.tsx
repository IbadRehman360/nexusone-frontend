"use client";

import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { RotateCcw } from "lucide-react";
import type { ImportJob } from "@/src/types/powerPlatform";

interface ImportResultPanelProps {
  job: ImportJob;
  onStartAnother: () => void;
}

function statusVariant(status: ImportJob["status"]): "success" | "warning" | "error" | "info" {
  if (status === "COMPLETED") return "success";
  if (status === "COMPLETED_WITH_ERRORS") return "warning";
  if (status === "FAILED") return "error";
  return "info";
}

function statusLabel(status: ImportJob["status"]): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function ImportResultPanel({ job, onStartAnother }: ImportResultPanelProps) {
  const errors = job.errorReport ?? [];

  return (
    <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <Badge variant={statusVariant(job.status)}>{statusLabel(job.status)}</Badge>
        <span className="text-sm text-muted-foreground">{job.fileName}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="px-4 py-3 rounded-lg bg-muted/10 border border-border/30 text-center">
          <p className="text-2xl font-bold text-foreground tabular-nums">{job.totalRows}</p>
          <p className="text-xs text-muted-foreground">Total rows</p>
        </div>
        <div className="px-4 py-3 rounded-lg bg-muted/10 border border-border/30 text-center">
          <p className="text-2xl font-bold text-success-400 tabular-nums">{job.successRows}</p>
          <p className="text-xs text-muted-foreground">Imported</p>
        </div>
        <div className="px-4 py-3 rounded-lg bg-muted/10 border border-border/30 text-center">
          <p className="text-2xl font-bold text-error-400 tabular-nums">{job.failedRows}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Errors ({errors.length})</p>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/10 border border-border/30 text-xs">
                <span className="font-medium text-foreground shrink-0">Row {e.row}</span>
                <span className="text-muted-foreground">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" leftIcon={<RotateCcw size={13} />} onClick={onStartAnother}>
        Start another import
      </Button>
    </div>
  );
}
