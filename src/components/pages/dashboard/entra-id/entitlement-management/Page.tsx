"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, ShieldCheck, Users, CalendarClock, AlertTriangle, LayoutGrid, ExternalLink } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Loader } from "@/src/components/ui/feedback/Loader";
import { LicenseGateState } from "@/src/components/ui/display/LicenseGateState";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useEntitlementManagement, useEmPackage } from "@/src/hooks/data/useEntitlementManagement";
import type { EmExpiryFilter, EmInsight, EmItem, EmKindFilter, HealthChip, InsightSeverity } from "@/src/types/emPackages";
import { formatDate } from "@/src/lib/utils/dateFormat";

const POSTURE_SCORE_GOOD = 80;
const POSTURE_SCORE_FAIR = 50;

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

function emChipLabel(chip: HealthChip): string {
  const label = (() => {
    switch (chip.key) {
      case "never_expires":
        return "Never expires";
      case "stale_guest":
        return "Stale guest";
      case "workflow_failing":
        return "Workflow failing";
      case "expiring_soon":
        return "Expiring soon";
      case "healthy":
        return "Healthy";
      default:
        return chip.key;
    }
  })();
  return chip.count ? `${label} (${chip.count})` : label;
}

export function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {emChipLabel(chip)}
        </Badge>
      ))}
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= POSTURE_SCORE_GOOD) return "text-success-700 dark:text-success-400";
  if (score >= POSTURE_SCORE_FAIR) return "text-warning-700 dark:text-warning-400";
  return "text-error-700 dark:text-error-400";
}

const INSIGHT_SEVERITY_VARIANT: Record<InsightSeverity, BadgeVariant> = { danger: "error", warning: "warning", info: "info" };
const INSIGHT_SEVERITY_LABEL: Record<InsightSeverity, string> = { danger: "Critical", warning: "Warning", info: "Info" };

function InsightCard({ insight }: { insight: EmInsight }) {
  const affectedCount = insight.affectedItems?.length ?? 0;
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={INSIGHT_SEVERITY_VARIANT[insight.severity]}>{INSIGHT_SEVERITY_LABEL[insight.severity]}</Badge>
          <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
        </div>
        {affectedCount > 0 && <span className="shrink-0 text-[11px] text-muted-foreground">{affectedCount} affected</span>}
      </div>
      <p className="text-xs text-muted-foreground">{insight.description}</p>
      <ol className="list-decimal pl-5 space-y-0.5 text-xs text-muted-foreground">
        {insight.recommendedSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {insight.learnMoreUrl && (
        <a href={insight.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-info-400 hover:underline">
          Learn more
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

const LICENSE_GATE_STEPS = [
  { title: "Purchase the license", description: "Add the required license to your tenant via the Microsoft 365 admin center or your reseller." },
  { title: "Wait for propagation", description: "Licensing changes can take up to a few hours to fully apply across Microsoft Entra ID." },
  { title: "Refresh this page", description: "Once the license is active, this page will unlock automatically — no further setup needed." },
];

function EmLicenseRequired() {
  return (
    <LicenseGateState
      title="Requires Entra ID Governance"
      description="Entitlement Management requires the Microsoft Entra ID Governance license (an add-on beyond P2). Surface never-expiring packages, stale guest access, and silently failing offboarding workflows — across every entity."
      steps={LICENSE_GATE_STEPS}
    />
  );
}

const KIND_FILTER_OPTIONS: { value: EmKindFilter; label: string }[] = [
  { value: "all", label: "All items" },
  { value: "package", label: "Access packages" },
  { value: "workflow", label: "Lifecycle workflows" },
];

const EXPIRY_FILTER_OPTIONS: { value: EmExpiryFilter; label: string }[] = [
  { value: "all", label: "Any expiry" },
  { value: "never", label: "Never-expires" },
  { value: "expiring", label: "Expiring soon" },
];

function matchesExpiry(item: EmItem, filter: EmExpiryFilter): boolean {
  if (filter === "never") return item.neverExpires;
  if (filter === "expiring") return item.expiringSoonCount > 0;
  return true;
}

function assignmentsCell(item: EmItem): string {
  if (item.kind === "workflow") {
    return item.workflowRuns ? `${item.workflowRuns.failed} failed / ${item.workflowRuns.total} runs` : "—";
  }
  return String(item.assignmentCount);
}

function PackageDrawerBody({ id }: { id: string }) {
  const { detail, isLoading, error } = useEmPackage(id);

  if (isLoading) return <Loader size="md" text="Loading package…" className="py-16" />;
  if (error) return <p className="py-12 text-center text-xs text-error-400">{error.message}</p>;
  if (!detail) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">{detail.displayName}</h2>
        <p className="text-xs text-muted-foreground">{detail.catalog ?? "Uncatalogued"} · read-only</p>
      </div>

      {!detail.emLicensed && <p className="rounded-lg border border-warning-400/30 bg-warning-400/10 px-3 py-2 text-xs text-warning-700 dark:text-warning-400">Requires Entra ID Governance — entitlement data is unavailable for this tenant.</p>}

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Assignments</p>
        {detail.assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active assignments.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.assignments.map((assignment, index) => (
              <div key={`${assignment.principalName}-${index}`} className="flex items-start justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">
                    {assignment.principalName}
                    {assignment.isGuest && (
                      <Badge variant="warning" className="ml-2">
                        Guest
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">Granted {formatDate(assignment.granted)}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{assignment.expiry ? `Expires ${formatDate(assignment.expiry)}` : "No expiry"}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Assignment policies</p>
        {detail.policies.length === 0 ? (
          <p className="text-xs text-muted-foreground">No policies.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.policies.map((policy, index) => (
              <div key={`${policy.displayName}-${index}`} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                <span className="truncate text-foreground">{policy.displayName}</span>
                <span className="shrink-0 text-muted-foreground">
                  {policy.requiresApproval ? "Approval" : "No approval"} · {policy.expiryLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Catalog resources</p>
        {detail.resources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No bundled resources.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {detail.resources.map((resource, index) => (
              <Badge key={`${resource.name}-${index}`} variant="neutral">
                {resource.name}
                {resource.type !== "—" ? ` · ${resource.type}` : ""}
              </Badge>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  const { items, stats, insights, emLicensed, isLoading, error } = useEntitlementManagement();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<EmKindFilter>("all");
  const [expiryFilter, setExpiryFilter] = useState<EmExpiryFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false;
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (!matchesExpiry(item, expiryFilter)) return false;
      return true;
    });
  }, [items, search, kindFilter, expiryFilter]);

  const showLicenseGate = !isLoading && !emLicensed;

  function openRow(item: EmItem) {
    if (item.kind === "package") setDrawerId(item.id);
  }

  const columns: DtColumn<EmItem>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (_, i) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{i.name}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{i.kind === "workflow" ? i.trigger : i.catalog ?? "—"}</p>
        </div>
      ),
    },
    { key: "kind", header: "Type", render: (_, i) => <Badge variant={i.kind === "workflow" ? "info" : "neutral"}>{i.kind === "workflow" ? "Workflow" : "Package"}</Badge> },
    { key: "assignmentCount", header: "Assignments / Runs", hideOnMobile: true, render: (_, i) => <span className="text-xs text-muted-foreground">{assignmentsCell(i)}</span> },
    { key: "requiresApproval", header: "Approval", hideOnMobile: true, render: (_, i) => <span className="text-xs text-muted-foreground">{i.kind === "workflow" ? "—" : i.requiresApproval ? "Required" : "None"}</span> },
    { key: "expiryLabel", header: "Expiry", render: (_, i) => <span className="text-xs text-muted-foreground">{i.expiryLabel}</span> },
    { key: "healthStatus", header: "Health", render: (_, i) => <HealthChips chips={i.chips} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entitlement Management"
        description="Where access is accumulating, which guests should be gone, and where offboarding is silently failing — never-expiring packages, stale guest access, and failing lifecycle workflows, surfaced read-only."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Entitlement Management", icon: Package }]}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/entra-id/entitlement-management/compare">
              <LayoutGrid size={14} />
              Governance Board
            </Link>
          </Button>
        }
      />

      {showLicenseGate ? (
        <EmLicenseRequired />
      ) : (
        <>
          <StatsCarousel
            cards={[
              { title: "Active Packages", value: stats?.activePackages ?? 0, icon: Package, color: "blue", isLoading },
              { title: "Total Assignments", value: stats?.totalAssignments ?? 0, icon: Users, color: "green", isLoading },
              { title: "Expiring Soon", value: stats?.expiringSoon ?? 0, icon: CalendarClock, color: "orange", isLoading },
              { title: "Workflow Failures", value: stats?.workflowFailures ?? 0, icon: AlertTriangle, color: "red", isLoading },
            ]}
          />

          {!isLoading && insights && (
            <section className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {insights.insights.length === 0 ? <ShieldCheck className="h-5 w-5 text-success-400" /> : <AlertTriangle className="h-5 w-5 text-warning-400" />}
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Governance posture</h2>
                    <p className="text-xs text-muted-foreground">
                      {insights.passedChecks} of {insights.totalChecks} baseline checks passing
                    </p>
                  </div>
                </div>
                <span className={`text-2xl font-semibold ${scoreColor(insights.completionScore)}`}>{insights.completionScore}%</span>
              </div>

              {insights.insights.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">All entitlement-management governance checks are passing.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {insights.insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )}
            </section>
          )}

          <DataTableMainHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search packages & workflows…"
            filters={
              <>
                <Dropdown options={KIND_FILTER_OPTIONS} value={kindFilter} onChange={(v) => setKindFilter(v as EmKindFilter)} variant="selected" />
                <Dropdown options={EXPIRY_FILTER_OPTIONS} value={expiryFilter} onChange={(v) => setExpiryFilter(v as EmExpiryFilter)} variant="selected" />
              </>
            }
          >
            <DataTable<EmItem>
              data={visible}
              columns={columns}
              keyExtractor={(i) => i.id}
              className="border-0 rounded-none"
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              loading={isLoading}
              error={error?.message}
              onRowClick={openRow}
              emptyState={{ icon: Package, title: "Nothing to show", description: "No access packages or lifecycle workflows match the current search and filters." }}
            />
          </DataTableMainHeader>
        </>
      )}

      <SlideOver isOpen={!!drawerId} onClose={() => setDrawerId(null)} title="Access Package Detail" icon={<Package size={16} />} width="lg">
        {drawerId && <PackageDrawerBody id={drawerId} />}
      </SlideOver>
    </div>
  );
}
