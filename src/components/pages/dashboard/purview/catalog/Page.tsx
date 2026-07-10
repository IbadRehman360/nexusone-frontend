"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { Badge } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { BookOpen, ShieldAlert, Award, UserX, Tag, Table as TableIcon, ShieldCheck } from "lucide-react";
import { useCatalogStats } from "@/src/hooks/data/usePurviewDataMap";
import { useCatalogAssets } from "@/src/hooks/data/usePurviewCatalog";
import type { AtlasAsset } from "@/src/types/purview";
import { AssetDetailPanel } from "./AssetDetailPanel";

const TYPE_ALL = { value: "all", label: "All Types" };
const SOURCE_ALL = { value: "all", label: "All Sources" };

function CertBadge({ certification }: { certification: AtlasAsset["certification"] }) {
  if (certification === "Certified") {
    return (
      <Badge variant="success">
        <Award size={10} className="mr-1" />
        Certified
      </Badge>
    );
  }
  if (certification === "Deprecated") {
    return <Badge variant="neutral">Deprecated</Badge>;
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

const catalogAssetColumns: DtColumn<AtlasAsset>[] = [
  {
    key: "name",
    header: "Asset Name",
    sortable: true,
    render: (_, asset) => (
      <div>
        <p className="text-xs font-semibold text-foreground">{asset.name}</p>
        {asset.qualifiedName && (
          <p className="text-[11px] font-mono text-muted-foreground truncate max-w-64">{asset.qualifiedName}</p>
        )}
      </div>
    ),
  },
  {
    key: "typeName",
    header: "Type",
    render: (_, asset) => <Badge variant="neutral"><span className="font-mono">{asset.typeName}</span></Badge>,
  },
  {
    key: "sourceName",
    header: "Source",
    render: (_, asset) => <span className="text-xs text-muted-foreground">{asset.sourceName ?? "—"}</span>,
  },
  {
    key: "owner",
    header: "Owner",
    render: (_, asset) =>
      asset.owner ? (
        <span className="text-xs text-muted-foreground">{asset.owner}</span>
      ) : (
        <span className="text-xs text-warning-400">No owner</span>
      ),
  },
  {
    key: "certification",
    header: "Certification",
    render: (_, asset) => <CertBadge certification={asset.certification} />,
  },
  {
    key: "classificationCount",
    header: "Classifications",
    align: "right",
    render: (_, asset) => (
      <span className="text-xs text-muted-foreground">{asset.classificationCount > 0 ? asset.classificationCount : "—"}</span>
    ),
  },
];

export default function Page() {
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const { catalogStats, isLoading: statsLoading } = useCatalogStats();
  const { assets: allAssets } = useCatalogAssets();
  const { assets, isLoading: assetsLoading } = useCatalogAssets({ type: typeFilter, source: sourceFilter });

  const typeOptions = useMemo(() => {
    const types = new Set(allAssets.map((a) => a.typeName).filter(Boolean));
    return [TYPE_ALL, ...[...types].sort().map((t) => ({ value: t, label: t }))];
  }, [allAssets]);

  const sourceOptions = useMemo(() => {
    const sources = new Set(allAssets.map((a) => a.sourceName).filter((s): s is string => !!s));
    return [SOURCE_ALL, ...[...sources].sort().map((s) => ({ value: s, label: s }))];
  }, [allAssets]);

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets;
    const query = search.trim().toLowerCase();
    return assets.filter((a: AtlasAsset) => a.name.toLowerCase().includes(query) || a.qualifiedName?.toLowerCase().includes(query));
  }, [assets, search]);

  const certifiedPct = catalogStats && catalogStats.totalAssets > 0
    ? Math.round((catalogStats.certifiedAssets / catalogStats.totalAssets) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Catalog"
        description="Browse all data assets registered in Microsoft Purview — certified, classified, and owner-tracked."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Data Catalog", icon: TableIcon },
        ]}
      />

      <StatsCarousel
        cards={[
          {
            title: "Total Assets",
            value: catalogStats?.totalAssets ?? 0,
            subtitle: "registered in Purview",
            icon: BookOpen,
            color: "blue",
            isLoading: statsLoading,
          },
          {
            title: "Sensitive Columns",
            value: catalogStats?.sensitiveColumns ?? 0,
            subtitle: "columns with classifications",
            icon: ShieldAlert,
            color: "orange",
            isLoading: statsLoading,
          },
          {
            title: "Certified",
            value: catalogStats?.certifiedAssets ?? 0,
            subtitle: `${certifiedPct}% of total`,
            icon: Award,
            color: "green",
            isLoading: statsLoading,
          },
          {
            title: "No Owner",
            value: catalogStats?.noOwnerAssets ?? 0,
            subtitle: "need an assigned owner",
            icon: UserX,
            color: "orange",
            isLoading: statsLoading,
          },
          {
            title: "Classified",
            value: catalogStats?.classifiedAssets ?? 0,
            subtitle: "have sensitivity labels",
            icon: Tag,
            color: "purple",
            isLoading: statsLoading,
          },
        ]}
      />

      <DataTableMainHeader
        title="Assets"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets…"
        filters={
          <>
            <Dropdown options={typeOptions} value={typeFilter} onChange={setTypeFilter} variant="selected" />
            <Dropdown options={sourceOptions} value={sourceFilter} onChange={setSourceFilter} variant="selected" />
          </>
        }
      >
        <DataTable<AtlasAsset>
          data={filteredAssets}
          columns={catalogAssetColumns}
          keyExtractor={(asset) => asset.guid}
          loading={assetsLoading}
          sortEnabled
          defaultSortField="name"
          defaultSortDir="asc"
          pageSize={15}
          onRowClick={(asset) => setSelectedGuid(asset.guid)}
          emptyState={{
            icon: BookOpen,
            title: "No assets found",
            description: "No data assets are registered in Purview yet.",
          }}
        />
      </DataTableMainHeader>

      <AssetDetailPanel guid={selectedGuid} onClose={() => setSelectedGuid(null)} />
    </div>
  );
}
