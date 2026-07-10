"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { StatsCardProps } from "@/src/components/ui/display/StatsCard";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import {
  Receipt,
  ShieldCheck,
  Database,
  ChartBar,
  Cpu,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useCostSummary, usePurviewMetrics, useVCoreUsage, useCostScanHistory } from "@/src/hooks/data/usePurviewCost";
import type { ScanStatusRow } from "@/src/types/purview";
import { formatCurrency, formatBytes, shortError, trendLabel, trendIcon } from "./costFormat";
import { formatDate as formatDateOnly } from "@/src/lib/utils/dateFormat";
import { isSucceededStatus, isFailedStatus, scanStatusTextColor } from "@/src/lib/utils/scanStatus";
import { formatDuration } from "@/src/lib/utils/duration";

const STATUS_ALL = { value: "all", label: "All Statuses" };
const SOURCE_ALL = { value: "all", label: "All Data Sources" };

export default function Page() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataSourceFilter, setDataSourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { summary, isLoading: summaryLoading } = useCostSummary();
  const { metrics, isLoading: metricsLoading } = usePurviewMetrics();
  const { vCoreUsage, isLoading: vCoreLoading } = useVCoreUsage();
  const { scanHistory: allScanHistory } = useCostScanHistory();
  const { scanHistory, isLoading: historyLoading } = useCostScanHistory({ status: statusFilter, dataSource: dataSourceFilter });

  const loading = summaryLoading || metricsLoading || vCoreLoading || historyLoading;

  const { successRate, failureRate, succeeded, failed, totalScans } = useMemo(() => {
    const total = allScanHistory.length;
    const succeededCount = allScanHistory.filter((s) => isSucceededStatus(s.status)).length;
    const failedCount = allScanHistory.filter((s) => isFailedStatus(s.status)).length;
    return {
      totalScans: total,
      succeeded: succeededCount,
      failed: failedCount,
      successRate: total > 0 ? Math.round((succeededCount / total) * 100) : null,
      failureRate: total > 0 ? Math.round((failedCount / total) * 100) : null,
    };
  }, [allScanHistory]);

  const currency = summary?.currency ?? "USD";

  const summaryCards: StatsCardProps[] = [
    {
      title: "This Month",
      value: summary ? formatCurrency(summary.currentMonthCost, currency) : "—",
      subtitle: trendLabel(summary),
      icon: trendIcon(summary),
      color: "blue",
      isLoading: loading,
    },
    {
      title: "Last Month",
      value: summary ? formatCurrency(summary.lastMonthCost, currency) : "—",
      subtitle: "Actual billed — Microsoft Purview",
      icon: Receipt,
      color: "purple",
      isLoading: loading,
    },
    {
      title: "Data Map Storage",
      value: metrics ? formatBytes(metrics.dataMapStorageSizeBytes) : "—",
      subtitle: "Current catalog storage size",
      icon: Database,
      color: "orange",
      isLoading: loading,
    },
    {
      title: "Capacity Units",
      value: metrics ? metrics.dataMapCapacityUnits : "—",
      subtitle: "Data map capacity units in use",
      icon: ChartBar,
      color: "green",
      isLoading: loading,
    },
    {
      title: "Scans (metered)",
      value: metrics ? metrics.scanCompleted + metrics.scanFailed + metrics.scanCancelled : "—",
      subtitle: metrics
        ? `${metrics.scanCompleted} completed · ${metrics.scanFailed} failed · ${metrics.scanCancelled} cancelled`
        : "Azure Monitor scan counters",
      icon: ChartBar,
      color: "purple",
      isLoading: loading,
    },
    {
      title: "vCore-Hours Consumed",
      value: vCoreUsage ? `${vCoreUsage.vCoreHours.toFixed(2)} h` : "—",
      subtitle: "Billed scan compute this month",
      icon: Cpu,
      color: "blue",
      isLoading: loading,
    },
    {
      title: "Scan Success Rate",
      value: successRate != null ? `${successRate}%` : "—",
      subtitle: totalScans > 0 ? `${succeeded} of ${totalScans} scans succeeded` : "No scan runs",
      icon: CheckCircle2,
      color: "green",
      isLoading: loading,
    },
    {
      title: "Scan Failure Rate",
      value: failureRate != null ? `${failureRate}%` : "—",
      subtitle: totalScans > 0 ? `${failed} of ${totalScans} scans failed` : "No scan runs",
      icon: XCircle,
      color: "red",
      isLoading: loading,
    },
  ];

  const statusOptions = useMemo(() => {
    const statuses = new Set(allScanHistory.map((r) => r.status).filter(Boolean));
    return [STATUS_ALL, ...[...statuses].sort().map((s) => ({ value: s, label: s }))];
  }, [allScanHistory]);

  const dataSourceOptions = useMemo(() => {
    const sources = new Set(allScanHistory.map((r) => r.dataSourceName).filter(Boolean));
    return [SOURCE_ALL, ...[...sources].sort().map((s) => ({ value: s, label: s }))];
  }, [allScanHistory]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return scanHistory;
    const query = search.trim().toLowerCase();
    return scanHistory.filter((r) => r.dataSourceName.toLowerCase().includes(query) || r.scanName.toLowerCase().includes(query));
  }, [scanHistory, search]);

  const columns: DtColumn<ScanStatusRow>[] = [
    {
      key: "timestamp",
      header: "Date",
      sortable: true,
      render: (_, row) => <span className="text-xs text-muted-foreground">{formatDateOnly(row.timestamp)}</span>,
    },
    {
      key: "dataSourceName",
      header: "Data Source",
      render: (_, row) => <span className="text-xs text-foreground/80">{row.dataSourceName || "—"}</span>,
    },
    {
      key: "scanName",
      header: "Scan Name",
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.scanName || "—"}</span>,
    },
    {
      key: "scanType",
      header: "Type",
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.scanType || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <span className={`text-xs font-medium ${scanStatusTextColor(row.status)}`}>{row.status || "—"}</span>,
    },
    {
      key: "scanDurationMs",
      header: "Duration",
      align: "right",
      render: (_, row) => <span className="text-xs text-muted-foreground">{formatDuration(row.scanDurationMs)}</span>,
    },
    {
      key: "assetsDiscovered",
      header: "Assets",
      align: "right",
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.assetsDiscovered.toLocaleString()}</span>,
    },
    {
      key: "errorMessage",
      header: "Error",
      render: (_, row) => (
        <span className="text-xs text-muted-foreground" title={row.errorMessage || undefined}>
          {shortError(row.errorMessage)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost & Billing"
        description="Actual Purview costs from Azure Cost Management and real-time metrics from Azure Monitor."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Cost & Billing", icon: Receipt },
        ]}
      />

      <StatsCarousel cards={summaryCards} />

      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">
          Scan runs consume Purview compute (vCore-hours) — this is the activity that drives your scanning spend.
        </p>
        <DataTableMainHeader
          title="Scan Usage History"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search scan runs…"
          filters={
            <>
              <Dropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} variant="selected" />
              <Dropdown options={dataSourceOptions} value={dataSourceFilter} onChange={setDataSourceFilter} variant="selected" />
            </>
          }
        >
          <DataTable<ScanStatusRow>
            data={filteredRows}
            columns={columns}
            keyExtractor={(row) => `${row.dataSourceName}-${row.scanName}-${row.timestamp}`}
            loading={historyLoading}
            sortEnabled
            defaultSortField="timestamp"
            defaultSortDir="desc"
            pageSize={20}
            emptyState={{
              icon: Receipt,
              title: "No scan runs found",
              description: "No Purview scan runs were found. Register a data source and run a scan to see history here.",
            }}
          />
        </DataTableMainHeader>
      </div>
    </div>
  );
}
