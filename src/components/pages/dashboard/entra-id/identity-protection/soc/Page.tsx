"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useTenants } from "@/src/hooks/data/useTenants";
import { useIdpSoc } from "@/src/hooks/data/useIdentityProtection";
import type { IdpSocQueueItem, IdpSocTenantRollup } from "@/src/types/identityProtection";
import { HealthChips, riskStateLabel, humanizeReason, formatAge } from "../Page";

function RollupStrip({ tenants }: { tenants: IdpSocTenantRollup[] }) {
  if (tenants.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {tenants.map((tenant) => (
        <div key={tenant.tenantId} className="min-w-44 flex-1 rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">{tenant.name}</span>
            {!tenant.idpLicensed && <Badge variant="neutral">Not monitored</Badge>}
          </div>
          {tenant.idpLicensed ? (
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="text-error-400">{tenant.high} high</span>
              <span className="text-warning-400">{tenant.medium} med</span>
              <span className="text-muted-foreground">{tenant.low} low</span>
              <span className="ml-auto text-error-400">{tenant.unremediated} unrem.</span>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">Not licensed for Entra ID P2 — risk is not assessed.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ItemDrawerBody({ item }: { item: IdpSocQueueItem }) {
  return (
    <div className="p-5 space-y-4">
      <HealthChips chips={item.chips} />

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
        <DetailRow label="State" value={riskStateLabel(item.riskState)} />
        <DetailRow label="Age" value={formatAge(item.stalenessHours)} />
        <DetailRow label="Risky sign-ins" value={item.riskySignInCount} />
        <DetailRow label="Reasons" value={item.reasons.length > 0 ? item.reasons.map(humanizeReason).join(", ") : "—"} />
      </div>

      <p className="text-[11px] text-muted-foreground">Open this tenant&apos;s Identity Protection page to drill into detections and history.</p>
    </div>
  );
}

export default function Page() {
  const { tenants } = useTenants();
  const { queue, load, isLoading, error } = useIdpSoc();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerItem, setDrawerItem] = useState<IdpSocQueueItem | null>(null);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  const columns: DtColumn<IdpSocQueueItem>[] = [
    { key: "tenantName", header: "Tenant", render: (_, item) => <span className="text-xs text-muted-foreground truncate">{item.tenantName}</span> },
    {
      key: "principalName",
      header: "User",
      render: (_, p) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{p.principalName}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.principalUpn ?? p.kind}</p>
        </div>
      ),
    },
    { key: "healthStatus", header: "Risk", render: (_, p) => <HealthChips chips={p.chips} /> },
    {
      key: "reasons",
      header: "Risk Reason",
      hideOnMobile: true,
      render: (_, p) => (p.reasons.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : <span className="text-xs text-muted-foreground truncate">{p.reasons.map(humanizeReason).join(", ")}</span>),
    },
    { key: "riskState", header: "State", render: (_, p) => <span className="text-xs text-foreground">{riskStateLabel(p.riskState)}</span> },
    { key: "stalenessHours", header: "Age", render: (_, p) => <span className="text-xs text-muted-foreground">{formatAge(p.stalenessHours)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Protection — SOC Queue (All Tenants)"
        description="One unified, severity-ranked risk queue across the tenants you manage — worst first. N/A tenants aren't licensed for Entra ID P2 and are shown as not monitored."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldAlert },
          { label: "Identity Protection", href: "/dashboard/entra-id/identity-protection", icon: ShieldAlert },
          { label: "SOC Queue" },
        ]}
        action={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} asChild>
            <Link href="/dashboard/entra-id/identity-protection">Back</Link>
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
          <Button size="sm" disabled={selectedIds.length === 0} loading={isLoading} onClick={() => load(selectedIds)}>
            Load Queue
          </Button>
        </div>
      </section>

      {error && <p className="text-sm text-error-400">{error.message}</p>}

      {(isLoading || queue) && (
        <div className="space-y-4">
          {queue && <RollupStrip tenants={queue.tenants} />}
          <div className="overflow-hidden rounded-2xl border border-(--custom-table-border) bg-card">
            <DataTable<IdpSocQueueItem>
              data={queue?.items ?? []}
              columns={columns}
              keyExtractor={(item) => `${item.tenantId}-${item.id}`}
              className="border-0 rounded-none"
              pageSize={25}
              loading={isLoading}
              onRowClick={setDrawerItem}
              emptyState={{ icon: ShieldCheck, title: "No risk across the selected tenants", description: "None of the monitored tenants have risky users or sign-ins right now." }}
            />
          </div>
        </div>
      )}

      <SlideOver
        isOpen={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title={drawerItem?.principalName ?? "Risky Item Detail"}
        subtitle={drawerItem ? `${drawerItem.tenantName}${drawerItem.principalUpn ? ` · ${drawerItem.principalUpn}` : ""} · read-only` : undefined}
        icon={<ShieldAlert size={16} />}
        width="md"
      >
        {drawerItem && <ItemDrawerBody item={drawerItem} />}
      </SlideOver>
    </div>
  );
}
