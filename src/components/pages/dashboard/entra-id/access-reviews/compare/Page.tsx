"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { SectionCard } from "@/src/components/ui/display/SectionCard";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import { useTenants } from "@/src/hooks/data/useTenants";
import { useArCompare } from "@/src/hooks/data/useAccessReviews";
import type { ArCompareCellStatus, ArCompareGrid } from "@/src/types/accessReviews";

const CELL: Record<ArCompareCellStatus, { label: string; variant: BadgeVariant }> = {
  pass: { label: "Pass", variant: "success" },
  fail: { label: "Fail", variant: "error" },
  na: { label: "N/A", variant: "neutral" },
};

export default function Page() {
  const { tenants } = useTenants();
  const { grid, compare, isLoading, error } = useArCompare();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Reviews — Compliance Board"
        description="Audit-readiness scorecard across the tenants you manage — completion and compliance checks per entity. N/A means the tenant isn't licensed for Entra ID P2 and is not assessed (not a clean pass)."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Access Reviews", href: "/dashboard/entra-id/access-reviews", icon: ShieldCheck },
          { label: "Compliance Board" },
        ]}
        action={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} asChild>
            <Link href="/dashboard/entra-id/access-reviews">Back</Link>
          </Button>
        }
      />

      <SectionCard title="Select tenants">
        <div className="flex flex-wrap gap-2">
          {tenants.map((tenant) => (
            <label key={tenant.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--custom-table-border) px-3 py-1.5 text-sm text-foreground hover:bg-muted/10">
              <input type="checkbox" checked={selectedIds.includes(tenant.id)} onChange={() => toggle(tenant.id)} />
              {tenant.name}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Button size="sm" disabled={selectedIds.length === 0} loading={isLoading} onClick={() => compare(selectedIds)}>
            Build Scorecard
          </Button>
        </div>
      </SectionCard>

      {error && <p className="text-sm text-error-400">{error.message}</p>}

      {(isLoading || grid) && <ComplianceBoard grid={grid} loading={isLoading} />}
    </div>
  );
}

function ComplianceBoard({ grid, loading }: { grid: ArCompareGrid | null; loading: boolean }) {
  const columns: DtColumn<ArCompareGrid["tenants"][number]>[] = [
    { key: "name", header: "Tenant", sortable: true, render: (_, tenant) => <span className="text-xs font-medium text-foreground">{tenant.name}</span> },
    {
      key: "completionPercent",
      header: "Completion",
      align: "center",
      render: (_, tenant) => (tenant.arLicensed ? <span className="text-xs text-foreground">{tenant.completionPercent}%</span> : <Badge variant="neutral">Not licensed</Badge>),
    },
    ...(grid?.checks ?? []).map((check): DtColumn<ArCompareGrid["tenants"][number]> => ({
      key: check.id,
      header: check.label,
      align: "center",
      render: (_, tenant) => {
        const status = grid?.cells[tenant.tenantId]?.[check.id] ?? "na";
        const cell = CELL[status];
        return <Badge variant={cell.variant}>{cell.label}</Badge>;
      },
    })),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg)">
      <DataTable<ArCompareGrid["tenants"][number]>
        data={grid?.tenants ?? []}
        columns={columns}
        keyExtractor={(tenant) => tenant.tenantId}
        className="border-0 rounded-none"
        loading={loading}
        sortEnabled
        defaultSortField="name"
        defaultSortDir="asc"
        emptyState={{ icon: ShieldCheck, title: "No tenants to compare", description: "None of the selected tenants are accessible to you with access-review read permission." }}
      />
    </div>
  );
}
