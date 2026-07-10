"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Button } from "@/src/components/ui/inputs/Button";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { Building2, ShieldCheck, Activity, CheckCircle2, Clock, TimerReset, ChevronRight, ChevronDown } from "lucide-react";
import { useScanStatuses, useDataMapStats } from "@/src/hooks/data/usePurviewDataMap";
import { useGovernanceActivity } from "@/src/hooks/data/usePurviewGovernance";
import type { ScanStatusRow } from "@/src/types/purview";
import { groupByActor, ResultBadge } from "./governanceActivityShared";
import { formatActivityTime as formatActivityTs } from "@/src/lib/utils/dateFormat";
import { isSucceededStatus, isRunningStatus, isQueuedStatus, isFailedStatus } from "@/src/lib/utils/scanStatus";

const STALE_DAYS = 7;
const ACTOR_ALL = { value: "all", label: "All actors" };

const RESULT_BUCKETS: { key: string; label: string; match: (status: string) => boolean; color: string }[] = [
  { key: "succeeded", label: "Succeeded", match: isSucceededStatus, color: "bg-success-400" },
  { key: "running", label: "Running", match: isRunningStatus, color: "bg-info-400" },
  { key: "queued", label: "Queued", match: isQueuedStatus, color: "bg-warning-400" },
  { key: "failed", label: "Failed", match: isFailedStatus, color: "bg-error-400" },
];

interface CoverageRow {
  source: string;
  discovered: number;
  classified: number;
  coveragePct: number;
}

interface ActivityRow {
  key: string;
  isParent: boolean;
  actor: string;
  jobCount?: number;
  operationName?: string;
  category?: string;
  resultType?: string;
  timestamp?: string;
}

function countStaleSources(history: ScanStatusRow[]): number {
  const staleThreshold = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const latestBySource = new Map<string, string>();
  for (const row of history) {
    const current = latestBySource.get(row.dataSourceName);
    if (!current || row.timestamp > current) latestBySource.set(row.dataSourceName, row.timestamp);
  }
  return [...latestBySource.values()].filter((ts) => new Date(ts).getTime() < staleThreshold).length;
}

export default function Page() {
  const { history, isLoading: historyLoading } = useScanStatuses();
  const { purviewActivity, isLoading: activityLoading } = useGovernanceActivity();
  const stats = useDataMapStats(history);
  const staleSources = useMemo(() => countStaleSources(history), [history]);

  const resultCounts = useMemo(() => {
    return RESULT_BUCKETS.map((bucket) => ({
      ...bucket,
      count: history.filter((row) => bucket.match(row.status)).length,
    }));
  }, [history]);
  const resultMax = Math.max(1, ...resultCounts.map((c) => c.count));

  const coverageRows = useMemo<CoverageRow[]>(() => {
    const bySource = new Map<string, { discovered: number; classified: number }>();
    for (const row of history) {
      const current = bySource.get(row.dataSourceName) ?? { discovered: 0, classified: 0 };
      current.discovered += row.assetsDiscovered;
      current.classified += Math.max(0, row.assetsDiscovered - row.assetsFailed);
      bySource.set(row.dataSourceName, current);
    }
    return [...bySource.entries()]
      .map(([source, { discovered, classified }]) => ({
        source,
        discovered,
        classified,
        coveragePct: discovered > 0 ? Math.round((classified / discovered) * 100) : 0,
      }))
      .sort((a, b) => b.discovered - a.discovered);
  }, [history]);

  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("all");
  // Defaults to fully expanded the first time activity data arrives, then
  // stays under the user's control (toggle / Expand all / Collapse all) —
  // it must NOT re-derive from `groups` on every render, since `groups` is
  // recomputed on every search/filter keystroke and would otherwise silently
  // undo the user's manual collapses.
  const [expanded, setExpanded] = useState<Set<string> | null>(null);

  const actorOptions = useMemo(() => {
    const actors = new Set(purviewActivity.map((r) => r.identity).filter(Boolean));
    return [ACTOR_ALL, ...[...actors].sort().map((a) => ({ value: a, label: a }))];
  }, [purviewActivity]);

  const filteredActivity = useMemo(() => {
    let result = purviewActivity;
    if (actorFilter !== "all") result = result.filter((r) => r.identity === actorFilter);
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.identity.toLowerCase().includes(query) ||
          r.operationName.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          r.resultType.toLowerCase().includes(query),
      );
    }
    return result;
  }, [purviewActivity, actorFilter, search]);

  const groups = useMemo(() => groupByActor(filteredActivity), [filteredActivity]);
  const jobCount = groups.reduce((sum, g) => sum + g.rows.length, 0);

  // First real render with data and no explicit user choice yet → default to
  // fully expanded. Computed at render time, not via an effect, so it never
  // fights a subsequent user toggle.
  const effectiveExpanded = useMemo(() => expanded ?? new Set(groups.map((g) => g.actor)), [expanded, groups]);

  const toggle = (actor: string) => {
    setExpanded((prev) => {
      const next = new Set(prev ?? groups.map((g) => g.actor));
      if (next.has(actor)) next.delete(actor);
      else next.add(actor);
      return next;
    });
  };

  const activityRows = useMemo<ActivityRow[]>(() => {
    return groups.flatMap((group) => {
      const parent: ActivityRow = { key: `parent-${group.actor}`, isParent: true, actor: group.actor, jobCount: group.rows.length };
      if (!effectiveExpanded.has(group.actor)) return [parent];
      const children: ActivityRow[] = group.rows.map((r) => ({
        key: `${group.actor}-${r.timestamp}-${r.operationName}`,
        isParent: false,
        actor: group.actor,
        operationName: r.operationName,
        category: r.category,
        resultType: r.resultType,
        timestamp: r.timestamp,
      }));
      return [parent, ...children];
    });
  }, [groups, effectiveExpanded]);

  const activityColumns: DtColumn<ActivityRow>[] = [
    {
      key: "actor",
      header: "Actor / Job",
      render: (_, row) =>
        row.isParent ? (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" onClick={() => toggle(row.actor)} className="shrink-0" aria-label={effectiveExpanded.has(row.actor) ? "Collapse" : "Expand"}>
              {effectiveExpanded.has(row.actor) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </Button>
            <span className="text-xs font-semibold text-foreground">{row.actor}</span>
            <span className="text-[11px] text-muted-foreground">
              {row.jobCount} job{row.jobCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-5">
            <span className="w-4.5 shrink-0" />
            <span className="text-xs font-medium text-foreground/80">{row.operationName}</span>
          </div>
        ),
    },
    {
      key: "timestamp",
      header: "Time",
      hideOnMobile: true,
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.timestamp ? formatActivityTs(row.timestamp) : ""}</span>,
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      render: (_, row) => (row.category ? <span className="px-2 py-0.5 rounded-md text-[11px] bg-muted/20 text-foreground/70">{row.category}</span> : null),
    },
    {
      key: "resultType",
      header: "Stage",
      hideOnMobile: true,
      render: (_, row) => (row.resultType ? <ResultBadge result={row.resultType} /> : null),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Governance"
        description="Scan health, classification coverage, and audit trail across all registered data sources."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Data Governance", icon: Building2 },
        ]}
      />

      <StatsCarousel
        cards={[
          {
            title: "Total Scan Runs",
            value: history.length,
            subtitle: "last 30 days",
            icon: Activity,
            color: "blue",
            isLoading: historyLoading,
          },
          {
            title: "Scan Success Rate",
            value: stats.successRate != null ? `${stats.successRate}%` : "—",
            subtitle: stats.failedRuns > 0 ? `${stats.failedRuns} failed run(s)` : "No failures",
            icon: CheckCircle2,
            color: stats.failedRuns > 0 ? "orange" : "green",
            isLoading: historyLoading,
          },
          {
            title: "Stale Sources",
            value: staleSources,
            subtitle: `not scanned in ${STALE_DAYS}+ days`,
            icon: TimerReset,
            color: staleSources > 0 ? "orange" : "green",
            isLoading: historyLoading,
          },
          {
            title: "Avg Scan Duration",
            value: stats.avgDurationMin != null ? `${stats.avgDurationMin} min` : "—",
            subtitle: "across all scan runs",
            icon: Clock,
            color: "purple",
            isLoading: historyLoading,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
          <p className="text-xs font-semibold text-foreground mb-4">Scan Results Breakdown</p>
          <div className="space-y-3">
            {resultCounts.map((bucket) => (
              <div key={bucket.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground">{bucket.label}</span>
                  <span className="text-[11px] font-medium text-foreground">{bucket.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                  <div className={`h-full rounded-full ${bucket.color}`} style={{ width: `${(bucket.count / resultMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
          <p className="text-xs font-semibold text-foreground mb-4">Classification Coverage by Source</p>
          {coverageRows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No scan data available yet.</p>
          ) : (
            <div className="space-y-3">
              {coverageRows.map((row) => (
                <div key={row.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-foreground/80 truncate max-w-48">{row.source}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {row.classified}/{row.discovered} · {row.coveragePct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-info-400" style={{ width: `${row.coveragePct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DataTableMainHeader
        title="Purview Activity"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search activity…"
        headerRight={<Dropdown options={actorOptions} value={actorFilter} onChange={setActorFilter} variant="selected" />}
        filters={
          <>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set(groups.map((g) => g.actor)))}>
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
              Collapse all
            </Button>
            <span className="text-xs text-muted-foreground">
              {groups.length} actor{groups.length === 1 ? "" : "s"} · {jobCount} job{jobCount === 1 ? "" : "s"}
            </span>
          </>
        }
      >
        <DataTable<ActivityRow>
          data={activityRows}
          columns={activityColumns}
          keyExtractor={(row) => row.key}
          loading={activityLoading}
          onRowClick={(row) => (row.isParent ? toggle(row.actor) : undefined)}
          emptyState={{
            icon: Activity,
            title: "No activity",
            description: "Purview catalog and scan activity will appear here once sources have been scanned.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
