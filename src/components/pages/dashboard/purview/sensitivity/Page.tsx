"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { ShieldCheck, Tag, CheckCircle2, Layers, ChevronRight, ChevronDown } from "lucide-react";
import { useSensitivityLabels } from "@/src/hooks/data/usePurviewSensitivity";
import type { SensitivityLabel } from "@/src/types/purview";
import { SensitivityLabelDetailPanel } from "./SensitivityLabelDetailPanel";
import { flattenLabels, formatAppliesTo, labelColor } from "./sensitivityShared";

interface LabelRow {
  label: SensitivityLabel;
  isChild: boolean;
}

export default function Page() {
  const [selected, setSelected] = useState<SensitivityLabel | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { labels, isLoading } = useSensitivityLabels();

  const allLabels = flattenLabels(labels);
  const activeCount = allLabels.filter((l) => l.isActive).length;
  const inactiveCount = allLabels.length - activeCount;
  const parentCount = labels.filter((l) => l.subLabels.length > 0).length;
  const subLabelCount = labels.reduce((sum, l) => sum + l.subLabels.length, 0);

  const appliesToSet = new Set(allLabels.flatMap((l) => l.appliesTo));
  const appliesToPreview = [...appliesToSet].slice(0, 2).map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(", ");
  const activePct = allLabels.length > 0 ? Math.round((activeCount / allLabels.length) * 100) : 0;

  const rows = useMemo<LabelRow[]>(() => {
    const result: LabelRow[] = [];
    for (const label of labels) {
      result.push({ label, isChild: false });
      if (label.subLabels.length > 0 && expanded.has(label.id)) {
        for (const sub of label.subLabels) result.push({ label: sub, isChild: true });
      }
    }
    return result;
  }, [labels, expanded]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: DtColumn<LabelRow>[] = [
    {
      key: "name",
      header: "Label",
      sortable: true,
      accessor: (row) => row.label.name,
      render: (_, row) => {
        const hasChildren = !row.isChild && row.label.subLabels.length > 0;
        return (
          <div className={`flex items-center gap-2 ${row.isChild ? "pl-7" : ""}`}>
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(row.label.id);
                }}
                aria-label={expanded.has(row.label.id) ? "Collapse" : "Expand"}
              >
                {expanded.has(row.label.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </Button>
            )}
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: labelColor(row.label.color) }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{row.label.name}</p>
              {(row.label.tooltip || row.label.description) && (
                <p className="text-[11px] text-muted-foreground truncate max-w-72">{row.label.tooltip || row.label.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "priority",
      header: "Priority",
      align: "right",
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.label.priority}</span>,
    },
    {
      key: "appliesTo",
      header: "Applies To",
      render: (_, row) => <span className="text-xs text-muted-foreground">{formatAppliesTo(row.label.appliesTo)}</span>,
    },
    {
      key: "subLabels",
      header: "Sub-labels",
      align: "right",
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.isChild ? "—" : row.label.subLabels.length}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <Badge variant={row.label.isActive ? "success" : "neutral"}>{row.label.isActive ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sensitivity Labels"
        description="Microsoft Information Protection sensitivity labels, hierarchy, and scope configuration."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Sensitivity Labels", icon: Tag },
        ]}
      />

      <StatsCarousel
        cards={[
          {
            title: "Total Labels",
            value: allLabels.length,
            subtitle: `${activeCount} active · ${inactiveCount} inactive`,
            icon: Tag,
            color: "blue",
            isLoading,
          },
          {
            title: "Active Labels",
            value: activeCount,
            subtitle: `${activePct}% of all labels`,
            icon: CheckCircle2,
            color: activeCount > 0 ? "green" : "orange",
            isLoading,
          },
          {
            title: "Label Hierarchy",
            value: parentCount,
            subtitle: `${parentCount} parent(s) · ${subLabelCount} sub-label(s)`,
            icon: Layers,
            color: "purple",
            isLoading,
          },
          {
            title: "Applies To",
            value: appliesToSet.size,
            subtitle: appliesToPreview || "Scope not reported by the label policy",
            icon: ShieldCheck,
            color: "orange",
            isLoading,
          },
        ]}
      />

      <DataTableMainHeader title={`Sensitivity Labels (${labels.length})`}>
        <DataTable<LabelRow>
          data={rows}
          columns={columns}
          keyExtractor={(row) => `${row.isChild ? "child" : "parent"}-${row.label.id}`}
          loading={isLoading}
          onRowClick={(row) => setSelected(row.label)}
          emptyState={{
            icon: Tag,
            title: "No sensitivity labels",
            description: "No sensitivity labels are configured. Requires Microsoft Information Protection.",
          }}
        />
      </DataTableMainHeader>

      <SensitivityLabelDetailPanel label={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
