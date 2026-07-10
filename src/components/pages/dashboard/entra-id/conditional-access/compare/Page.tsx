"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import { useTenants } from "@/src/hooks/data/useTenants";
import { useCaCompare } from "@/src/hooks/data/useCaCompare";
import type { CaCompareCellStatus, CaCompareGrid } from "@/src/types/conditionalAccess";

const CELL: Record<CaCompareCellStatus, { label: string; variant: BadgeVariant }> = {
  pass: { label: "Pass", variant: "success" },
  fail: { label: "Fail", variant: "error" },
  na: { label: "N/A", variant: "neutral" },
};

export default function Page() {
  const { tenants } = useTenants();
  const { grid, compare, isLoading, error } = useCaCompare();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conditional Access — Compare Tenants"
        description="Compare Conditional Access baseline coverage across the tenants you manage. Pass / Fail per check; N/A means the tenant isn't licensed or hasn't granted consent."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Conditional Access", href: "/dashboard/entra-id/conditional-access", icon: ShieldCheck },
          { label: "Compare" },
        ]}
        action={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} asChild>
            <Link href="/dashboard/entra-id/conditional-access">Back</Link>
          </Button>
        }
      />

      <section className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
        <p className="text-sm font-medium text-foreground">Select tenants</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tenants.map((tenant) => (
            <label key={tenant.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--custom-table-border) px-3 py-1.5 text-sm text-foreground hover:bg-muted/10">
              <input type="checkbox" checked={selectedIds.includes(tenant.id)} onChange={() => toggle(tenant.id)} />
              {tenant.name}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Button size="sm" disabled={selectedIds.length === 0} loading={isLoading} onClick={() => compare(selectedIds)}>
            Compare
          </Button>
        </div>
      </section>

      {error && <p className="text-sm text-error-400">{error.message}</p>}

      {(isLoading || grid) && <ComparisonBoard grid={grid} loading={isLoading} />}
    </div>
  );
}

function ComparisonBoard({ grid, loading }: { grid: CaCompareGrid | null; loading: boolean }) {
  const columns: DtColumn<CaCompareGrid["tenants"][number]>[] = [
    { key: "name", header: "Tenant", sortable: true, render: (_, tenant) => <span className="text-xs font-medium text-foreground">{tenant.name}</span> },
    ...(grid?.checks ?? []).map((check): DtColumn<CaCompareGrid["tenants"][number]> => ({
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
    <div className="overflow-hidden rounded-2xl border border-(--custom-table-border) bg-card">
      <DataTable<CaCompareGrid["tenants"][number]>
        data={grid?.tenants ?? []}
        columns={columns}
        keyExtractor={(tenant) => tenant.tenantId}
        className="border-0 rounded-none"
        loading={loading}
        sortEnabled
        defaultSortField="name"
        defaultSortDir="asc"
        emptyState={{ icon: ShieldCheck, title: "No tenants to compare", description: "None of the selected tenants are accessible to you with Conditional Access read permission." }}
      />
    </div>
  );
}
