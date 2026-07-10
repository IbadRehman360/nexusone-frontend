"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Button } from "@/src/components/ui/inputs/Button";
import { useActivityLog } from "@/src/hooks/data/useActivityLog";
import { toCsv, downloadTextFile } from "@/src/lib/utils/csvExport";
import { CATEGORY_CONFIG, CATEGORY_OPTIONS, STATUS_OPTIONS, DATE_RANGE_OPTIONS } from "./categoryConfig";
import type { ActivityLog, ActivityCategory, ActivityStatus } from "@/src/services/auditLogs/auditLogApi";
import { Activity, Download, RefreshCw, ExternalLink } from "lucide-react";

const CARD_COLOR: Record<ActivityCategory, "blue" | "purple" | "green" | "orange"> = {
  auth: "blue",
  power_platform: "purple",
  entra: "green",
  platform: "orange",
};

function subtractDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function exportToCsv(rows: ActivityLog[]) {
  const csv = toCsv(
    ["Timestamp", "User", "Action", "Category", "Status", "Resource", "Environment"],
    rows.map((r) => [
      new Date(r.timestamp).toLocaleString(),
      r.user,
      r.action,
      CATEGORY_CONFIG[r.category].label,
      r.status,
      r.resource,
      r.environment,
    ]),
  );
  downloadTextFile(csv, `activity-log-${new Date().toISOString().slice(0, 10)}.csv`);
}

export default function Page() {
  const [rangeDays, setRangeDays] = useState("7");
  const startDate = rangeDays ? subtractDays(Number(rangeDays)) : undefined;
  const { activities, isLoading, isFetching, refetch } = useActivityLog(startDate);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const categoryCounts = useMemo(() => {
    const counts: Record<ActivityCategory, number> = { auth: 0, power_platform: 0, entra: 0, platform: 0 };
    for (const a of activities) counts[a.category]++;
    return counts;
  }, [activities]);

  const filtered = activities.filter((a) => {
    if (category && a.category !== category) return false;
    if (status && a.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.action.toLowerCase().includes(q) && !a.resource.toLowerCase().includes(q) && !a.user.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Track all user actions across Platform."
        breadcrumbs={[{ label: "Activity Log", icon: Activity }]}
      />

      <StatsCarousel
        cards={(Object.keys(CATEGORY_CONFIG) as ActivityCategory[]).map((key) => {
          const cfg = CATEGORY_CONFIG[key];
          return {
            title: cfg.label,
            value: isLoading ? "—" : categoryCounts[key],
            subtitle: cfg.label === "Auth" ? "Authentication events" : cfg.label === "Platform" ? "Platform management" : `${cfg.label} operations`,
            icon: cfg.icon,
            color: CARD_COLOR[key],
            isLoading,
          };
        })}
      />

      <DataTableMainHeader
        filters={
          <>
            <Dropdown variant="selected" value={category} onChange={setCategory} options={[{ value: "", label: "Category" }, ...CATEGORY_OPTIONS]} placeholder="Category" />
            <Dropdown variant="selected" value={status} onChange={setStatus} options={[{ value: "", label: "Status" }, ...STATUS_OPTIONS]} placeholder="Status" />
            <Dropdown variant="selected" value={rangeDays} onChange={setRangeDays} options={DATE_RANGE_OPTIONS} placeholder="Date range" />
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => exportToCsv(filtered)} disabled={filtered.length === 0}>
              Export CSV ({filtered.length})
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />} onClick={() => refetch()}>
              Refresh
            </Button>
          </>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search…"
      >
        <DataTable<ActivityLog>
          data={filtered}
          keyExtractor={(a) => a.id}
          loading={isLoading}
          sortEnabled
          defaultSortField="timestamp"
          defaultSortDir="desc"
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          columns={[
            {
              key: "action",
              header: "Activity",
              sortable: true,
              render: (_, a) => {
                const cfg = CATEGORY_CONFIG[a.category];
                const Icon = cfg.icon;
                return (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bgClass}`}>
                      <Icon size={13} className={cfg.colorClass} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{a.action}</p>
                      {a.category === "power_platform" && a.environmentUrl && (
                        <Link
                          href={`/dashboard/dataverse-logs?environmentUrl=${encodeURIComponent(a.environmentUrl)}`}
                          className="flex items-center gap-1 text-[11px] text-info-400 hover:underline"
                        >
                          Dataverse Logs <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "category",
              header: "Category",
              render: (_, a) => <span className={`text-xs font-medium ${CATEGORY_CONFIG[a.category].colorClass}`}>{CATEGORY_CONFIG[a.category].label}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (_, a) => <span className={`text-xs font-medium ${a.status === "success" ? "text-success-400" : "text-error-400"}`}>{a.status === "success" ? "Success" : "Failed"}</span>,
            },
            { key: "user", header: "User", render: (_, a) => <span className="text-xs text-info-400">{a.user}</span> },
            { key: "environment", header: "Environment", render: (_, a) => <span className="text-xs text-muted-foreground">{a.environment}</span> },
            {
              key: "timestamp",
              header: "Time",
              sortable: true,
              render: (_, a) => <span className="text-xs text-foreground/70 tabular-nums whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</span>,
            },
          ]}
          emptyState={{
            icon: Activity,
            title: "No activity found",
            description: "Actions taken across the platform will appear here.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
