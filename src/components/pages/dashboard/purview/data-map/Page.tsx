"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import StatsCard from "@/src/components/ui/display/StatsCard";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { cn } from "@/src/lib/utils/cn";
import { Database, CheckCircle2, XCircle, Clock, Map as MapIcon, Table as TableIcon, ShieldCheck, Waypoints } from "lucide-react";
import { Loader } from "@/src/components/ui/feedback/Loader";
import {
  useCatalogConnectors,
  useCatalogStats,
  useDataMapCollections,
  useScanStatuses,
  useDataMapStats,
} from "@/src/hooks/data/usePurviewDataMap";
import type { AtlasConnector, DataMapCollection, ScanStatusRow } from "@/src/types/purview";
import { DataSourceDetailPanel } from "./DataSourceDetailPanel";
import { formatDateTime as formatShortDateTime } from "@/src/lib/utils/dateFormat";
import { isSucceededStatus } from "@/src/lib/utils/scanStatus";
import { formatDuration } from "@/src/lib/utils/duration";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const SOURCE_TYPE_ALL = { value: "all", label: "All Source Types" };
const DEFAULT_ROOT_LABEL = "Cloudifi";
const UNGROUPED_KEY = "__ungrouped__";

interface CollectionGroup {
  key: string;
  label: string;
  assetCount: number | null;
  sources: AtlasConnector[];
}

/** Groups connectors by their collectionId, matched against known collections by name. Unmatched sources bucket last under "Ungrouped sources". */
function groupSourcesByCollection(sources: AtlasConnector[], collections: DataMapCollection[]): CollectionGroup[] {
  const collectionByName = new Map(collections.map((c) => [c.name, c]));
  const groups = new Map<string, CollectionGroup>();

  for (const source of sources) {
    const collection = collectionByName.get(source.collectionId);
    const key = collection ? collection.name : UNGROUPED_KEY;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: collection ? collection.friendlyName : "Ungrouped sources",
        assetCount: collection ? collection.assetCount : null,
        sources: [],
      });
    }
    groups.get(key)!.sources.push(source);
  }

  const ordered = [...groups.values()].filter((g) => g.key !== UNGROUPED_KEY);
  const ungrouped = groups.get(UNGROUPED_KEY);
  return ungrouped ? [...ordered, ungrouped] : ordered;
}

function SourceCard({ source, selected, onClick }: { source: AtlasConnector; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-52 shrink-0 text-left rounded-xl border p-3 transition-colors",
        selected ? "border-info-400 bg-info-400/10" : "border-(--custom-table-border) bg-(--custom-table-bg) hover:bg-muted/20",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Database size={14} className="text-info-400 shrink-0" />
        <p className="text-xs font-semibold text-foreground truncate">{source.name}</p>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground truncate">{source.sourceType}</p>
      <p className="mt-1.5 text-[10px] text-muted-foreground/80">Last scan: {formatShortDateTime(source.lastScanAt)}</p>
      {selected && <p className="mt-1.5 text-[10px] font-medium text-info-400">View details →</p>}
    </button>
  );
}

function CollectionGroupBox({
  group,
  selectedSource,
  onSelectSource,
}: {
  group: CollectionGroup;
  selectedSource: string | null;
  onSelectSource: (name: string | null) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-(--custom-table-border) p-3 bg-muted/5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-semibold text-foreground">{group.label}</p>
        <p className="text-[10px] text-muted-foreground">
          {group.sources.length} source{group.sources.length === 1 ? "" : "s"}
          {group.assetCount != null && ` · ${group.assetCount} assets`}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {group.sources.map((source) => (
          <SourceCard
            key={source.sourceName}
            source={source}
            selected={selectedSource === source.sourceName}
            onClick={() => onSelectSource(selectedSource === source.sourceName ? null : source.sourceName)}
          />
        ))}
      </div>
    </div>
  );
}

function MapView({
  sources,
  collections,
  loading,
  selectedSource,
  onSelectSource,
}: {
  sources: AtlasConnector[];
  collections: DataMapCollection[];
  loading: boolean;
  selectedSource: string | null;
  onSelectSource: (name: string | null) => void;
}) {
  const groups = useMemo(() => groupSourcesByCollection(sources, collections), [sources, collections]);
  const rootLabel = collections.find((c) => c.parentCollectionName === null)?.friendlyName ?? DEFAULT_ROOT_LABEL;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="sm" text="Loading data map…" />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
        <Waypoints size={28} className="text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No data sources registered in Purview.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="px-4 py-2 rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg)">
        <p className="text-xs font-semibold text-foreground">{rootLabel}</p>
      </div>
      <div className="h-6 w-px bg-(--custom-table-border)" />
      <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <CollectionGroupBox key={group.key} group={group} selectedSource={selectedSource} onSelectSource={onSelectSource} />
        ))}
      </div>
    </div>
  );
}

const sourceColumns: DtColumn<AtlasConnector>[] = [
  {
    key: "name",
    header: "Data Source",
    sortable: true,
    render: (_, source) => (
      <div>
        <p className="text-xs font-semibold text-foreground">{source.name}</p>
        <p className="text-[11px] text-muted-foreground">{source.sourceType}</p>
      </div>
    ),
  },
  {
    key: "sourceType",
    header: "Data Source Type",
    render: (_, source) => <span className="text-xs text-muted-foreground">{source.sourceType}</span>,
  },
  {
    key: "collectionId",
    header: "Collection",
    render: (_, source) => <span className="text-xs text-muted-foreground">{source.collectionId}</span>,
  },
  {
    key: "environment",
    header: "Environment",
    render: (_, source) => <span className="text-xs text-muted-foreground">{source.environment ?? "—"}</span>,
  },
  {
    key: "lastScanAt",
    header: "Last Scan",
    sortable: true,
    render: (_, source) => <span className="text-xs text-muted-foreground">{formatShortDateTime(source.lastScanAt)}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (_, source) => <span className="text-xs font-medium text-success-400">{source.status}</span>,
  },
];

const historyColumns: DtColumn<ScanStatusRow>[] = [
  {
    key: "dataSourceName",
    header: "Data Source",
    sortable: true,
    render: (_, row) => <span className="text-xs font-semibold text-foreground">{row.dataSourceName}</span>,
  },
  {
    key: "scanName",
    header: "Scan",
    render: (_, row) => <span className="text-xs text-muted-foreground">{row.scanName}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (_, row) => {
      return <span className={`text-xs font-medium ${isSucceededStatus(row.status) ? "text-success-400" : "text-error-400"}`}>{row.status}</span>;
    },
  },
  {
    key: "assetsDiscovered",
    header: "Assets Found",
    align: "right",
    render: (_, row) => <span className="text-xs text-muted-foreground">{row.assetsDiscovered}</span>,
  },
  {
    key: "scanDurationMs",
    header: "Duration",
    align: "right",
    render: (_, row) => <span className="text-xs text-muted-foreground">{formatDuration(row.scanDurationMs)}</span>,
  },
  {
    key: "timestamp",
    header: "Time",
    sortable: true,
    render: (_, row) => <span className="text-xs text-muted-foreground">{formatShortDateTime(row.timestamp)}</span>,
  },
];

export default function Page() {
  const [view, setView] = useState<"map" | "table">("map");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sourceSearch, setSourceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");

  const { connectors: allSources } = useCatalogConnectors();
  const { connectors: sources, isLoading: sourcesLoading } = useCatalogConnectors({
    status: statusFilter,
    sourceType: sourceTypeFilter,
  });
  const { history, isLoading: historyLoading } = useScanStatuses();
  const { catalogStats } = useCatalogStats();
  const { collections } = useDataMapCollections();
  const stats = useDataMapStats(history);

  const sourceTypeOptions = useMemo(() => {
    const types = new Set(allSources.map((s) => s.sourceType).filter(Boolean));
    return [SOURCE_TYPE_ALL, ...[...types].map((t) => ({ value: t, label: t }))];
  }, [allSources]);

  const filteredTableSources = useMemo(() => {
    if (!sourceSearch.trim()) return sources;
    const query = sourceSearch.trim().toLowerCase();
    return sources.filter((s: AtlasConnector) => s.name.toLowerCase().includes(query) || s.sourceType.toLowerCase().includes(query));
  }, [sources, sourceSearch]);

  const sortedHistory = useMemo(
    () => [...history].sort((a: ScanStatusRow, b: ScanStatusRow) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [history],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Map & Scanning"
        description="Registered Purview data sources and recent scan history. Click a source to view its scan details."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Data Map & Scanning", icon: MapIcon },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered Sources"
          value={allSources.length}
          subtitle="data sources connected"
          icon={Database}
          color="blue"
          isLoading={sourcesLoading}
        />
        <StatsCard
          title="Assets Discovered"
          value={catalogStats?.totalAssets ?? 0}
          subtitle={`${catalogStats?.classifiedAssets ?? 0} classified`}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Failed Scans"
          value={stats.failedRuns}
          subtitle={stats.failedRuns > 0 ? `${stats.failedSources} source(s) affected` : "No failures"}
          icon={XCircle}
          color={stats.failedRuns > 0 ? "red" : "green"}
          isLoading={historyLoading}
        />
        <StatsCard
          title="Scan Success Rate"
          value={stats.successRate != null ? `${stats.successRate}%` : "—"}
          subtitle={stats.avgDurationMin != null ? `${stats.avgDurationMin} min avg duration` : `${history.length} total scan runs`}
          icon={Clock}
          color="purple"
          utilisation={stats.successRate ?? undefined}
          isLoading={historyLoading}
        />
      </div>

      <Tabs
        variant="pill"
        tabs={[
          { id: "map", label: "Map view", icon: MapIcon },
          { id: "table", label: "Table view", icon: TableIcon },
        ]}
        activeTab={view}
        onChange={setView}
      />

      {view === "map" ? (
        <div className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) min-h-80">
          <MapView
            sources={sources}
            collections={collections}
            loading={sourcesLoading}
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <DataTableMainHeader
            title="Registered Data Sources"
            searchValue={sourceSearch}
            onSearchChange={setSourceSearch}
            searchPlaceholder="Search data sources…"
            filters={
              <>
                <Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} variant="selected" />
                <Dropdown options={sourceTypeOptions} value={sourceTypeFilter} onChange={setSourceTypeFilter} variant="selected" />
              </>
            }
          >
            <DataTable<AtlasConnector>
              data={filteredTableSources}
              columns={sourceColumns}
              keyExtractor={(source) => source.sourceName}
              loading={sourcesLoading}
              onRowClick={(source) => setSelectedSource(source.sourceName)}
              emptyState={{
                icon: Database,
                title: "No data sources found",
                description: "No Purview data sources are available.",
              }}
            />
          </DataTableMainHeader>

          <DataTableMainHeader title="Recent Scan History">
            <DataTable<ScanStatusRow>
              data={sortedHistory}
              columns={historyColumns}
              keyExtractor={(row) => `${row.dataSourceName}-${row.scanName}-${row.timestamp}`}
              loading={historyLoading}
              emptyState={{
                icon: Clock,
                title: "No scan history",
                description: "Scan runs will appear here once sources have been scanned.",
              }}
            />
          </DataTableMainHeader>
        </div>
      )}

      <DataSourceDetailPanel sourceName={selectedSource} onClose={() => setSelectedSource(null)} />
    </div>
  );
}
