"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, LogIn, Clock, UserX, Network, ExternalLink } from "lucide-react";
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
import { formatDateTime } from "@/src/lib/utils/dateFormat";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useIdentityProtection, useIdpUser } from "@/src/hooks/data/useIdentityProtection";
import { InlineError } from "@/src/components/error/InlineError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { HealthChip, IdpInsight, IdpQueueItem, IdpSeverityFilter, IdpStateFilter, IdpWindowFilter, InsightSeverity, RiskLevel, RiskState } from "@/src/types/identityProtection";

const EXPOSURE_GOOD = 20;
const EXPOSURE_FAIR = 50;

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

function idpChipLabel(chip: HealthChip): string {
  switch (chip.key) {
    case "high_risk":
      return "High risk";
    case "medium_risk":
      return "Medium risk";
    case "low_risk":
      return "Low risk";
    case "confirmed_compromised":
      return "Confirmed compromised";
    case "unremediated_24h":
      return "Unremediated >24h";
    case "leaked_credentials":
      return "Leaked credentials";
    case "dismissed":
      return "Dismissed";
    case "remediated":
      return "Remediated";
    default:
      return chip.key;
  }
}

export function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {idpChipLabel(chip)}
        </Badge>
      ))}
    </div>
  );
}

export function riskStateLabel(state: RiskState): string {
  switch (state) {
    case "atRisk":
      return "At risk";
    case "confirmedCompromised":
      return "Confirmed compromised";
    case "dismissed":
      return "Dismissed";
    case "remediated":
      return "Remediated";
    case "confirmedSafe":
      return "Safe";
    default:
      return "—";
  }
}

export function humanizeReason(reason: string): string {
  const spaced = reason.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatAge(hours: number | null): string {
  if (hours == null) return "—";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function exposureColor(percent: number): string {
  if (percent <= EXPOSURE_GOOD) return "text-success-700 dark:text-success-400";
  if (percent <= EXPOSURE_FAIR) return "text-warning-700 dark:text-warning-400";
  return "text-error-700 dark:text-error-400";
}

const INSIGHT_SEVERITY_VARIANT: Record<InsightSeverity, BadgeVariant> = { danger: "error", warning: "warning", info: "info" };
const INSIGHT_SEVERITY_LABEL: Record<InsightSeverity, string> = { danger: "Critical", warning: "Warning", info: "Info" };

function InsightCard({ insight }: { insight: IdpInsight }) {
  const affectedCount = insight.affectedPrincipals?.length ?? 0;
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

function IdpLicenseRequired() {
  return (
    <LicenseGateState
      title="Requires Microsoft Entra ID P2"
      description="Identity Protection requires Microsoft Entra ID P2. Triage risky users and sign-ins, see why each was flagged, and prioritise the genuine threats."
      steps={LICENSE_GATE_STEPS}
    />
  );
}

const SEVERITY_FILTER_OPTIONS: { value: IdpSeverityFilter; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATE_FILTER_OPTIONS: { value: IdpStateFilter; label: string }[] = [
  { value: "all", label: "All states" },
  { value: "atRisk", label: "At risk" },
  { value: "confirmedCompromised", label: "Confirmed" },
  { value: "dismissed", label: "Dismissed" },
  { value: "remediated", label: "Remediated" },
];

const WINDOW_FILTER_OPTIONS: { value: IdpWindowFilter; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
];

const WINDOW_HOURS: Record<IdpWindowFilter, number | null> = { all: null, "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };

const RISK_VARIANT: Record<RiskLevel, BadgeVariant> = { high: "error", medium: "warning", low: "neutral", none: "neutral" };

function IdpDrawerBody({ id }: { id: string }) {
  const { detail, isLoading, error } = useIdpUser(id);

  if (isLoading) return <Loader size="md" text="Loading user…" className="py-16" />;
  if (error) return <InlineError error={presentError(error)} />;
  if (!detail) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">{detail.principalName}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {detail.principalUpn && <span>{detail.principalUpn}</span>}
          <Badge variant={RISK_VARIANT[detail.riskLevel]}>{detail.riskLevel} risk</Badge>
          <span>{riskStateLabel(detail.riskState)} · read-only</span>
        </div>
      </div>

      {!detail.idpLicensed && <p className="rounded-lg border border-warning-400/30 bg-warning-400/10 px-3 py-2 text-xs text-warning-700 dark:text-warning-400">Requires Entra ID P2 — Identity Protection data is unavailable for this tenant.</p>}

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Risk detections</p>
        {detail.detections.length === 0 ? (
          <p className="text-xs text-muted-foreground">No detections.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.detections.map((d) => (
              <div key={`${d.riskEventType}-${d.detectedDateTime}`} className="flex items-start justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">{humanizeReason(d.riskEventType)}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {d.ipAddress ?? "—"} · {d.source ?? "—"}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(d.detectedDateTime)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Risky sign-ins</p>
        {detail.riskySignIns.length === 0 ? (
          <p className="text-xs text-muted-foreground">No risky sign-ins.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.riskySignIns.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">{s.appDisplayName ?? "—"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {s.ipAddress ?? "—"} · {s.location ?? "—"} · {s.riskLevel}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(s.createdDateTime)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Risk history</p>
        {detail.history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No history.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.history.map((entry, index) => (
              <div key={`${entry.updatedDateTime}-${index}`} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                <span className="text-foreground">
                  {entry.riskState ?? "—"}
                  {entry.initiatedBy ? ` · ${entry.initiatedBy}` : ""}
                </span>
                <span className="text-muted-foreground">{formatDateTime(entry.updatedDateTime)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  const { items, stats, insights, idpLicensed, isLoading, error } = useIdentityProtection();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<IdpSeverityFilter>("all");
  const [stateFilter, setStateFilter] = useState<IdpStateFilter>("all");
  const [windowFilter, setWindowFilter] = useState<IdpWindowFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const windowHours = WINDOW_HOURS[windowFilter];
    return items.filter((item) => {
      const haystack = `${item.principalName} ${item.principalUpn ?? ""} ${item.reasons.join(" ")}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (severityFilter !== "all" && item.riskLevel !== severityFilter) return false;
      if (stateFilter !== "all" && item.riskState !== stateFilter) return false;
      if (windowHours !== null && (item.stalenessHours === null || item.stalenessHours > windowHours)) return false;
      return true;
    });
  }, [items, search, severityFilter, stateFilter, windowFilter]);

  const showLicenseGate = !isLoading && !idpLicensed;

  const columns: DtColumn<IdpQueueItem>[] = [
    {
      key: "principalName",
      header: "User",
      sortable: true,
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
    { key: "riskySignInCount", header: "Risky Sign-ins", hideOnMobile: true, render: (_, p) => <span className="text-xs text-muted-foreground">{p.riskySignInCount}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Protection"
        description="The SOC triage queue — risky users and sign-ins flagged by Microsoft's threat engine, ranked high-risk and aging first, with the detection that explains each one."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldAlert }, { label: "Identity Protection", icon: ShieldAlert }]}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/entra-id/identity-protection/soc">
              <Network size={14} />
              SOC Queue (All Tenants)
            </Link>
          </Button>
        }
      />

      {showLicenseGate ? (
        <IdpLicenseRequired />
      ) : (
        <>
          <StatsCarousel
            cards={[
              { title: "High-Risk Users", value: stats?.high ?? 0, icon: ShieldAlert, color: "red", isLoading },
              { title: "Risky Sign-ins", value: stats?.riskySignIns ?? 0, icon: LogIn, color: "orange", isLoading },
              { title: "Unremediated >24h", value: stats?.unremediated24h ?? 0, icon: Clock, color: "red", isLoading },
              { title: "Confirmed Compromised", value: stats?.confirmedCompromised ?? 0, icon: UserX, color: "red", isLoading },
            ]}
          />

          {!isLoading && insights && (
            <section className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {insights.insights.length === 0 ? <ShieldCheck className="h-5 w-5 text-success-400" /> : <ShieldAlert className="h-5 w-5 text-error-400" />}
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Threat exposure</h2>
                    <p className="text-xs text-muted-foreground">
                      {insights.unremediated} unremediated · {insights.highRisk} high-risk
                    </p>
                  </div>
                </div>
                <span className={`text-2xl font-semibold ${exposureColor(insights.exposurePercent)}`}>{insights.exposurePercent}%</span>
              </div>

              {insights.insights.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">No active threats flagged.</p>
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
            searchPlaceholder="Search users or reasons…"
            filters={
              <>
                <Dropdown options={SEVERITY_FILTER_OPTIONS} value={severityFilter} onChange={(v) => setSeverityFilter(v as IdpSeverityFilter)} variant="selected" />
                <Dropdown options={STATE_FILTER_OPTIONS} value={stateFilter} onChange={(v) => setStateFilter(v as IdpStateFilter)} variant="selected" />
                <Dropdown options={WINDOW_FILTER_OPTIONS} value={windowFilter} onChange={(v) => setWindowFilter(v as IdpWindowFilter)} variant="selected" />
              </>
            }
          >
            <DataTable<IdpQueueItem>
              data={visible}
              columns={columns}
              keyExtractor={(p) => p.id}
              className="border-0 rounded-none"
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              loading={isLoading}
              error={error ? presentError(error) : undefined}
              onRowClick={(p) => setDrawerId(p.principalId)}
              emptyState={{ icon: ShieldCheck, title: "No risky users or sign-ins", description: "Nothing matches the current search and filters." }}
            />
          </DataTableMainHeader>
        </>
      )}

      <SlideOver isOpen={!!drawerId} onClose={() => setDrawerId(null)} title="Risky User Detail" icon={<ShieldAlert size={16} />} width="lg">
        {drawerId && <IdpDrawerBody id={drawerId} />}
      </SlideOver>
    </div>
  );
}
