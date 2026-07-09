"use client";

import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { useRestoreHistory } from "@/src/hooks/data/useBackups";
import type { RestoreRun } from "@/src/types/powerPlatform";
import { History, Calendar, Archive } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error"> = {
  SUCCEEDED: "success",
  PENDING: "warning",
  FAILED: "error",
};

const STATUS_LABEL: Record<string, string> = {
  SUCCEEDED: "Completed",
  PENDING: "In progress",
  FAILED: "Failed",
};

interface RestoreHistoryTableProps {
  environmentId: string;
}

export function RestoreHistoryTable({ environmentId }: RestoreHistoryTableProps) {
  const { restores, isLoading } = useRestoreHistory(environmentId);

  return (
    <DataTable<RestoreRun>
      data={restores}
      keyExtractor={(r) => r.id}
      loading={isLoading}
      sortEnabled
      defaultSortField="createdAt"
      defaultSortDir="desc"
      columns={[
        {
          key: "restoreType",
          header: "Source",
          sortable: true,
          render: (_, r) => (
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              {r.restoreType === "SYSTEM" ? <Calendar size={12} className="text-muted-foreground/70" /> : <Archive size={12} className="text-muted-foreground/70" />}
              {r.restoreType === "SYSTEM" ? "System" : "Backup"}
            </span>
          ),
        },
        {
          key: "restorePointDateTime",
          header: "Restore point",
          render: (_, r) => (
            <span className="text-xs text-foreground/70 tabular-nums">
              {r.restorePointDateTime ? new Date(r.restorePointDateTime).toLocaleString() : "—"}
            </span>
          ),
        },
        {
          key: "targetEnvironmentName",
          header: "Restored into",
          render: (_, r) => <span className="text-xs text-muted-foreground truncate block">{r.targetEnvironmentName || "—"}</span>,
        },
        {
          key: "triggeredBy",
          header: "By",
          hideOnMobile: true,
          render: (_, r) => <span className="text-xs text-muted-foreground truncate block">{r.triggeredBy || "—"}</span>,
        },
        {
          key: "createdAt",
          header: "Started",
          sortable: true,
          render: (_, r) => <span className="text-xs text-foreground/70 tabular-nums">{new Date(r.createdAt).toLocaleString()}</span>,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (_, r) => <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>,
        },
      ]}
      emptyState={{
        icon: History,
        title: "No restores yet",
        description: "Restores you run will appear here with their outcome.",
      }}
    />
  );
}
