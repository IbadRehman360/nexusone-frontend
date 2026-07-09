"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useDataverseLogs } from "@/src/hooks/data/useDataverseLogs";
import { operationConfigFor, DATE_RANGE_OPTIONS } from "./operationConfig";
import { LogDetailSlideOver } from "./LogDetailSlideOver";
import type { DataverseLog } from "@/src/services/dataverseLogs/dataverseLogsApi";
import { History, Download, RefreshCw, EyeOff, Eye, ExternalLink, Info } from "lucide-react";

function isSystemLog(log: DataverseLog): boolean {
  return log.userName === "SYSTEM" || (log.userName?.includes("SYSTEM") ?? false);
}

export default function Page() {
  const { environments } = useEnvironments();
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [rangeDays, setRangeDays] = useState("7");
  const [hideSystemLogs, setHideSystemLogs] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<DataverseLog | null>(null);

  const filters = environmentUrl
    ? {
        environmentUrl,
        ...(rangeDays && { startDate: new Date(Date.now() - Number(rangeDays) * 24 * 60 * 60 * 1000).toISOString() }),
        endDate: new Date().toISOString(),
        top: 500,
        includeSystemAccess: !hideSystemLogs,
      }
    : null;

  const { logs, isLoading, isFetching, refetch } = useDataverseLogs(filters);

  const visibleLogs = useMemo(() => {
    let rows = hideSystemLogs ? logs.filter((l) => !(isSystemLog(l) && l.operationName?.toLowerCase() === "access")) : logs;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((l) => l.userName?.toLowerCase().includes(q) || l.objectTypeName?.toLowerCase().includes(q) || l.operationName?.toLowerCase().includes(q));
    }
    return rows;
  }, [logs, hideSystemLogs, search]);

  const handleExport = () => {
    const header = ["Time", "Operation", "Entity", "Record", "User", "User Email"];
    const lines = [header.join(",")];
    for (const l of visibleLogs) {
      lines.push([new Date(l.createdon).toLocaleString(), l.operationName, l.objectTypeName, l.objectName ?? "", l.userName, l.userEmail ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataverse-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dataverse Audit Logs"
        description="Audit logs are fetched directly from your Dataverse environment's built-in audit trail."
        breadcrumbs={[{ label: "Dataverse Audit Logs", icon: History }]}
      />

      <DataTableMainHeader
        title={`${visibleLogs.length} record${visibleLogs.length === 1 ? "" : "s"}`}
        filters={
          <>
            <Dropdown
              variant="selected"
              value={environmentUrl}
              onChange={setEnvironmentUrl}
              placeholder="Environment"
              options={environments.map((env) => ({
                value: env.environmentUrl,
                label: env.environmentDisplayName ?? env.displayName ?? env.environmentName,
              }))}
            />
            <Dropdown variant="selected" value={rangeDays} onChange={setRangeDays} options={DATE_RANGE_OPTIONS} placeholder="Date range" />
            <Button size="sm" onClick={() => refetch()} loading={isFetching} disabled={!environmentUrl}>
              Fetch Logs
            </Button>
            <button
              type="button"
              onClick={() => setHideSystemLogs((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-medium transition-colors ${
                hideSystemLogs ? "bg-info/10 border-info/20 text-info-400" : "bg-(--custom-table-bg) border-(--custom-header-input-border) text-muted-foreground"
              }`}
            >
              {hideSystemLogs ? <EyeOff size={12} /> : <Eye size={12} />}
              {hideSystemLogs ? "System Logs Hidden" : "Showing All Records"}
            </button>
            <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={handleExport} disabled={visibleLogs.length === 0}>
              Export CSV ({visibleLogs.length})
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />} onClick={() => refetch()} disabled={!environmentUrl}>
              Refresh
            </Button>
          </>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search logs…"
      >
        <DataTable<DataverseLog>
          data={visibleLogs}
          keyExtractor={(l) => l.auditid}
          loading={isLoading}
          sortEnabled
          defaultSortField="createdon"
          defaultSortDir="desc"
          onRowClick={(l) => setSelectedLog(l)}
          columns={[
            {
              key: "operationName",
              header: "Operation",
              sortable: true,
              render: (_, l) => {
                const cfg = operationConfigFor(l.operation);
                const Icon = cfg.icon;
                return (
                  <Badge variant={cfg.badgeVariant}>
                    <Icon size={11} className="mr-1 -ml-0.5 inline" />
                    {cfg.label}
                  </Badge>
                );
              },
            },
            {
              key: "objectTypeName",
              header: "Entity",
              sortable: true,
              render: (_, l) => (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{l.objectTypeName}</p>
                  {l.objectName && <p className="text-[11px] text-muted-foreground truncate">{l.objectName}</p>}
                  {l.changedAttributes && l.changedAttributes.length > 0 && (
                    <p className="text-[11px] text-info-400 mt-0.5">{l.changedAttributes.length} field{l.changedAttributes.length === 1 ? "" : "s"} changed</p>
                  )}
                </div>
              ),
            },
            {
              key: "userName",
              header: "User",
              sortable: true,
              render: (_, l) => (
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{l.userName}</p>
                  {l.userEmail && <p className="text-[11px] text-muted-foreground truncate">{l.userEmail}</p>}
                </div>
              ),
            },
            {
              key: "createdon",
              header: "Time",
              sortable: true,
              render: (_, l) => <span className="text-xs text-foreground/70 tabular-nums whitespace-nowrap">{new Date(l.createdon).toLocaleString()}</span>,
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, l) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {l.recordUrl && (
                    <a href={l.recordUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-muted-foreground/60 hover:text-foreground transition-colors p-1.5" aria-label="View record">
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <Button variant="outline" size="sm" leftIcon={<Info size={12} />} onClick={() => setSelectedLog(l)}>
                    View more info
                  </Button>
                </div>
              ),
            },
          ]}
          emptyState={{
            icon: History,
            title: environmentUrl ? "No audit logs found" : "Select an environment",
            description: environmentUrl ? "Try widening the date range or clicking Fetch Logs." : "Choose an environment above to fetch its audit trail.",
          }}
        />
      </DataTableMainHeader>

      <LogDetailSlideOver log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
