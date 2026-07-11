"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Eye, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useConditionalAccess } from "@/src/hooks/data/useConditionalAccess";
import type {
  CaControls,
  CaPolicyListItem,
  CaRecommendation,
  CaState,
  ControlFilter,
  HealthChip,
  HealthStatus,
  RecommendationSeverity,
  ScopeFilter,
  StateFilter,
} from "@/src/types/conditionalAccess";
import { CaDetailSlideOver } from "./CaDetailBody";

const RISK_RANK: Record<HealthStatus, number> = { danger: 0, warning: 1, healthy: 2 };

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

function chipLabel(chip: HealthChip): string {
  switch (chip.key) {
    case "no_mfa_for_all":
      return "No MFA for all users";
    case "report_only_too_long":
      return chip.days != null ? `Report-only ${chip.days}d` : "Report-only too long";
    case "break_glass_not_excluded":
      return "No break-glass exclusion";
    case "excludes_too_many_users":
      return "Excludes many users";
    case "disabled":
      return "Disabled";
    case "modified_recently":
      return chip.days != null ? `Changed ${chip.days}d ago` : "Recently changed";
    case "healthy":
      return "Healthy";
    default:
      return chip.key;
  }
}

export function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {chipLabel(chip)}
        </Badge>
      ))}
    </div>
  );
}

const STATE_BADGE: Record<CaState, { label: string; variant: BadgeVariant }> = {
  enabled: { label: "On", variant: "success" },
  enabledForReportingButNotEnforced: { label: "Report-only", variant: "warning" },
  disabled: { label: "Off", variant: "neutral" },
};

function CaStateBadge({ state }: { state: CaState }) {
  const cfg = STATE_BADGE[state];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function controlLabels(controls: CaControls): string[] {
  const items: string[] = [];
  if (controls.mfa) items.push("MFA");
  if (controls.authStrength) items.push(controls.authStrength);
  if (controls.compliantDevice) items.push("Compliant device");
  if (controls.domainJoined) items.push("Hybrid joined");
  if (controls.block) items.push("Block");
  if (controls.signInFrequency) items.push("Sign-in freq.");
  return items;
}

function ControlsCell({ controls }: { controls: CaControls }) {
  const items = controlLabels(controls);
  if (items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((label) => (
        <span key={label} className="rounded-md border border-(--custom-table-border) bg-(--custom-table-bg) px-1.5 py-0.5 text-[10px] text-foreground/70">
          {label}
        </span>
      ))}
    </div>
  );
}

const REC_SEVERITY_VARIANT: Record<RecommendationSeverity, BadgeVariant> = { danger: "error", warning: "warning", info: "info" };
const REC_SEVERITY_LABEL: Record<RecommendationSeverity, string> = { danger: "Critical", warning: "Warning", info: "Info" };

function RecommendationCard({ recommendation }: { recommendation: CaRecommendation }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={REC_SEVERITY_VARIANT[recommendation.severity]}>{REC_SEVERITY_LABEL[recommendation.severity]}</Badge>
        {recommendation.affectedPolicies && recommendation.affectedPolicies.length > 0 && (
          <span className="text-[11px] text-muted-foreground">{recommendation.affectedPolicies.length} policies</span>
        )}
      </div>
      <p className="text-xs font-semibold text-foreground">{recommendation.title}</p>
      <p className="text-xs text-muted-foreground">{recommendation.description}</p>
      <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
        {recommendation.remediationSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      {recommendation.learnMoreUrl && (
        <a href={recommendation.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="mt-auto pt-1 text-xs text-info-400 hover:underline">
          Learn more
        </a>
      )}
    </div>
  );
}

const STATE_FILTER_OPTIONS: { value: StateFilter; label: string }[] = [
  { value: "all", label: "All states" },
  { value: "enabled", label: "On" },
  { value: "reportOnly", label: "Report-only" },
  { value: "disabled", label: "Off" },
];

const CONTROL_FILTER_OPTIONS: { value: ControlFilter; label: string }[] = [
  { value: "all", label: "Any control" },
  { value: "mfa", label: "Requires MFA" },
  { value: "compliantDevice", label: "Compliant device" },
  { value: "authStrength", label: "Auth strength" },
  { value: "block", label: "Block access" },
];

const SCOPE_FILTER_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: "all", label: "Any scope" },
  { value: "allUsers", label: "Targets all users" },
  { value: "roles", label: "Targets roles" },
  { value: "guests", label: "Targets guests" },
];

function matchesControl(policy: CaPolicyListItem, filter: ControlFilter): boolean {
  switch (filter) {
    case "mfa":
      return policy.controls.mfa;
    case "compliantDevice":
      return policy.controls.compliantDevice;
    case "authStrength":
      return policy.controls.authStrength !== null;
    case "block":
      return policy.controls.block;
    default:
      return true;
  }
}

function matchesScope(policy: CaPolicyListItem, filter: ScopeFilter): boolean {
  const summary = policy.assignedToSummary.toLowerCase();
  switch (filter) {
    case "allUsers":
      return policy.includesAllUsers;
    case "roles":
      return summary.includes("role");
    case "guests":
      return summary.includes("guest");
    default:
      return true;
  }
}

function matchesState(policy: CaPolicyListItem, filter: StateFilter): boolean {
  if (filter === "enabled") return policy.state === "enabled";
  if (filter === "reportOnly") return policy.state === "enabledForReportingButNotEnforced";
  if (filter === "disabled") return policy.state === "disabled";
  return true;
}

export default function Page() {
  const { policies, stats, recommendations, isLoading, error } = useConditionalAccess();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [controlFilter, setControlFilter] = useState<ControlFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [riskFirst, setRiskFirst] = useState(false);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = policies.filter((p) => {
      const haystack = `${p.displayName} ${p.assignedToSummary} ${p.targetAppsSummary}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (!matchesState(p, stateFilter)) return false;
      if (!matchesControl(p, controlFilter)) return false;
      if (!matchesScope(p, scopeFilter)) return false;
      return true;
    });
    if (!riskFirst) return list;
    return [...list].sort((a, b) => RISK_RANK[a.healthStatus] - RISK_RANK[b.healthStatus]);
  }, [policies, search, stateFilter, controlFilter, scopeFilter, riskFirst]);

  const columns: DtColumn<CaPolicyListItem>[] = [
    {
      key: "displayName",
      header: "Policy",
      sortable: true,
      render: (_, p) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{p.displayName}</p>
          <p className="truncate text-[11px] text-muted-foreground mt-0.5">{p.targetAppsSummary}</p>
        </div>
      ),
    },
    { key: "state", header: "State", render: (_, p) => <CaStateBadge state={p.state} /> },
    { key: "assignedToSummary", header: "Assigned To", hideOnMobile: true, render: (_, p) => <span className="text-xs text-muted-foreground truncate">{p.assignedToSummary}</span> },
    {
      key: "excludedSummary",
      header: "Excluded",
      hideOnMobile: true,
      render: (_, p) => (p.excludedCount === 0 ? <span className="text-xs text-muted-foreground">None</span> : <span className="text-xs text-muted-foreground truncate">{p.excludedSummary}</span>),
    },
    { key: "controls", header: "Controls", render: (_, p) => <ControlsCell controls={p.controls} /> },
    { key: "healthStatus", header: "Health", render: (_, p) => <HealthChips chips={p.chips} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conditional Access"
        description="The if-then rules that govern every sign-in — MFA enforcement, device compliance, legacy-auth blocking, and the coverage gaps that put your tenant at risk."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Conditional Access", icon: ShieldCheck }]}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/entra-id/conditional-access/compare">
              <LayoutGrid size={14} />
              Compare Tenants
            </Link>
          </Button>
        }
      />

      <StatsCarousel
        cards={[
          {
            title: "Security Posture",
            value: recommendations ? `${recommendations.completionScore}%` : "—",
            subtitle: recommendations ? `${recommendations.passedChecks} of ${recommendations.totalChecks} checks passing` : undefined,
            icon: recommendations && recommendations.recommendations.length === 0 ? CheckCircle2 : AlertTriangle,
            color: recommendations && recommendations.recommendations.length === 0 ? "green" : "orange",
            isLoading,
          },
          { title: "Total Policies", value: stats?.total ?? 0, icon: ShieldCheck, color: "blue", isLoading },
          { title: "Enforced", value: stats?.enforced ?? 0, icon: ShieldCheck, color: "green", isLoading },
          { title: "Report-only", value: stats?.reportOnly ?? 0, icon: Eye, color: "orange", isLoading },
          { title: "Coverage Gaps", value: stats?.coverageGaps ?? 0, icon: ShieldAlert, color: "red", isLoading },
        ]}
      />

      {!isLoading && recommendations && recommendations.recommendations.length > 0 && (
        <section className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      <DataTableMainHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search policies…"
        filters={
          <>
            <Dropdown options={STATE_FILTER_OPTIONS} value={stateFilter} onChange={(v) => setStateFilter(v as StateFilter)} variant="selected" />
            <Dropdown options={CONTROL_FILTER_OPTIONS} value={controlFilter} onChange={(v) => setControlFilter(v as ControlFilter)} variant="selected" />
            <Dropdown options={SCOPE_FILTER_OPTIONS} value={scopeFilter} onChange={(v) => setScopeFilter(v as ScopeFilter)} variant="selected" />
            <Button variant={riskFirst ? "default" : "outline"} size="sm" onClick={() => setRiskFirst((v) => !v)}>
              <ShieldX size={12} />
              Risk first
            </Button>
          </>
        }
      >
        <DataTable<CaPolicyListItem>
          data={visible}
          columns={columns}
          keyExtractor={(p) => p.id}
          className="border-0 rounded-none"
          sortEnabled
          defaultSortField="displayName"
          defaultSortDir="asc"
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={isLoading}
          error={error?.message}
          onRowClick={(p) => setDrawerId(p.id)}
          emptyState={{ icon: ShieldCheck, title: "No Conditional Access policies", description: "No policies match the current search and filters." }}
        />
      </DataTableMainHeader>

      <CaDetailSlideOver id={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}
