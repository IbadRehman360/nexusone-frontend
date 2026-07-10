"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { StatsCardProps, ColorVariant } from "@/src/components/ui/display/StatsCard";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { Filter, ShieldCheck, Layers, CreditCard, Landmark, HeartPulse, User, Tag } from "lucide-react";
import { useCatalogClassificationTypes } from "@/src/hooks/data/usePurviewCatalog";
import type { AtlasSit } from "@/src/types/purview";
import { prettifyClassificationId } from "@/src/lib/utils/classificationName";
import { AssetDetailPanel } from "../catalog/AssetDetailPanel";
import { ClassificationDetailPanel } from "./ClassificationDetailPanel";
import { CategoryBadge, ClassifierTypeBadge } from "./classificationBadges";

const CATEGORY_ALL = { value: "all", label: "All" };
const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "Built-in", label: "Built-in" },
  { value: "Custom", label: "Custom" },
];

const CATEGORY_META: Record<string, { icon: StatsCardProps["icon"]; color: ColorVariant }> = {
  Financial: { icon: CreditCard, color: "green" },
  Government: { icon: Landmark, color: "blue" },
  Health: { icon: HeartPulse, color: "red" },
  Personal: { icon: User, color: "purple" },
  Other: { icon: Tag, color: "neutral" },
};

const FALLBACK_COLORS: ColorVariant[] = ["blue", "purple", "green", "orange", "red"];

const classifierColumns: DtColumn<AtlasSit>[] = [
  {
    key: "name",
    header: "Classification",
    sortable: true,
    render: (_, classifier) => (
      <div>
        <p className="text-xs font-semibold text-foreground">
          {classifier.description || prettifyClassificationId(classifier.name)}
        </p>
        <p className="text-[11px] font-mono text-muted-foreground truncate max-w-72">{classifier.name}</p>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (_, classifier) => <CategoryBadge category={classifier.category} />,
  },
  {
    key: "type",
    header: "Type",
    render: (_, classifier) => <ClassifierTypeBadge type={classifier.type} />,
  },
];

export default function Page() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedClassification, setSelectedClassification] = useState<AtlasSit | null>(null);
  const [selectedAssetGuid, setSelectedAssetGuid] = useState<string | null>(null);

  const { classifiers: allClassifiers, isLoading: allLoading } = useCatalogClassificationTypes();
  const { classifiers, isLoading } = useCatalogClassificationTypes(categoryFilter);

  const categoryOptions = useMemo(() => {
    const categories = new Set(allClassifiers.map((c) => c.category).filter(Boolean));
    return [CATEGORY_ALL, ...[...categories].sort().map((c) => ({ value: c, label: c }))];
  }, [allClassifiers]);

  const visibleClassifiers = useMemo(() => {
    let rows = typeFilter === "all" ? classifiers : classifiers.filter((c) => c.type === typeFilter);
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(query) || (c.description ?? "").toLowerCase().includes(query));
    }
    return rows;
  }, [classifiers, typeFilter, search]);

  const statsCards: StatsCardProps[] = useMemo(() => {
    if (allLoading) {
      return [
        { title: "Total Categories", value: "—", icon: Layers, color: "blue", isLoading: true },
        { title: "Financial", value: "—", icon: CreditCard, color: "green", isLoading: true },
        { title: "Government", value: "—", icon: Landmark, color: "blue", isLoading: true },
        { title: "Personal", value: "—", icon: User, color: "purple", isLoading: true },
      ];
    }

    const countByCategory = new Map<string, number>();
    for (const classifier of allClassifiers) {
      if (!classifier.category) continue;
      countByCategory.set(classifier.category, (countByCategory.get(classifier.category) ?? 0) + 1);
    }

    const categoryCards: StatsCardProps[] = [...countByCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, count], index) => {
        const meta = CATEGORY_META[category] ?? { icon: Tag, color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] };
        return {
          title: category,
          value: count,
          subtitle: `classification type${count === 1 ? "" : "s"}`,
          icon: meta.icon,
          color: meta.color,
        };
      });

    return [
      {
        title: "Total Categories",
        value: countByCategory.size,
        subtitle: `${allClassifiers.length} classification types`,
        icon: Layers,
        color: "blue",
      },
      ...categoryCards,
    ];
  }, [allClassifiers, allLoading]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Classification"
        description="Purview classification types from the Atlas catalog."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Data Classification", icon: Filter },
        ]}
      />

      <StatsCarousel cards={statsCards} />

      <DataTableMainHeader
        title="Classification rules"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search classification rules…"
        filters={
          <>
            <Dropdown options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} variant="selected" />
            <Dropdown options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} variant="selected" />
          </>
        }
      >
        <DataTable<AtlasSit>
          data={visibleClassifiers}
          columns={classifierColumns}
          keyExtractor={(classifier) => classifier.name}
          loading={isLoading}
          sortEnabled
          defaultSortField="name"
          defaultSortDir="asc"
          pageSize={15}
          onRowClick={setSelectedClassification}
          emptyState={{
            icon: Filter,
            title: "No classifiers found",
            description: "No classification types are available in this Purview account.",
          }}
        />
      </DataTableMainHeader>

      <ClassificationDetailPanel
        classification={selectedClassification}
        onClose={() => setSelectedClassification(null)}
        onSelectAsset={setSelectedAssetGuid}
      />

      <AssetDetailPanel guid={selectedAssetGuid} onClose={() => setSelectedAssetGuid(null)} />
    </div>
  );
}
