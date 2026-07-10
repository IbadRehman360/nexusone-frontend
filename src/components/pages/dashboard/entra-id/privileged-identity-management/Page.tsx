"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck, ShieldAlert, Clock, Crown, Zap, GitCompare, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { usePim, usePimPrincipal } from "@/src/hooks/data/usePim";
import type { HealthChip, PimActivationRules, PimAssignmentItem, PimRecommendation, PimRoleFilter, PimStandingFilter, PimTypeFilter, RecommendationSeverity } from "@/src/types/pim";
import { formatDate } from "@/src/lib/utils/dateFormat";

const MAX_GLOBAL_ADMINS = 5;
const POSTURE_SCORE_GOOD = 80;
const POSTURE_SCORE_FAIR = 50;

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

function pimChipLabel(chip: HealthChip): string {
  switch (chip.key) {
    case "standing_global_admin":
      return "Standing Global Admin";
    case "permanent_high_privilege":
      return "Permanent high-privilege";
    case "activation_lacks_mfa_approval":
      return "Activation lacks MFA/approval";
    case "eligible_never_activated":
      return chip.days != null ? `Eligible, unused ${chip.days}d` : "Eligible, never activated";
    case "healthy_jit":
      return "Healthy (JIT)";
    default:
      return chip.key;
  }
}

function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {pimChipLabel(chip)}
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

const REC_SEVERITY_VARIANT: Record<RecommendationSeverity, BadgeVariant> = { danger: "error", warning: "warning", info: "info" };
const REC_SEVERITY_LABEL: Record<RecommendationSeverity, string> = { danger: "Critical", warning: "Warning", info: "Info" };

function RecommendationCard({ recommendation }: { recommendation: PimRecommendation }) {
  const affectedCount = recommendation.affectedPrincipals?.length ?? 0;
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={REC_SEVERITY_VARIANT[recommendation.severity]}>{REC_SEVERITY_LABEL[recommendation.severity]}</Badge>
          <h3 className="text-sm font-semibold text-foreground">{recommendation.title}</h3>
        </div>
        {affectedCount > 0 && <span className="shrink-0 text-[11px] text-muted-foreground">{affectedCount} affected</span>}
      </div>
      <p className="text-xs text-muted-foreground">{recommendation.description}</p>
      <ol className="list-decimal pl-5 space-y-0.5 text-xs text-muted-foreground">
        {recommendation.remediationSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {recommendation.learnMoreUrl && (
        <a href={recommendation.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-info-400 hover:underline">
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

function PimLicenseRequired() {
  return (
    <LicenseGateState
      title="Requires Microsoft Entra ID P2"
      description="Privileged Identity Management requires Microsoft Entra ID P2. Monitor just-in-time access, standing administrators, and activation policy across your directory roles."
      steps={LICENSE_GATE_STEPS}
    />
  );
}

const TYPE_FILTER_OPTIONS: { value: PimTypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "eligible", label: "Eligible" },
  { value: "active", label: "Active" },
];

const STANDING_FILTER_OPTIONS: { value: PimStandingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "standing", label: "Standing only" },
];

const ROLE_FILTER_OPTIONS: { value: PimRoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "tier0", label: "Tier-0 only" },
];

function matchesType(item: PimAssignmentItem, filter: PimTypeFilter): boolean {
  if (filter === "eligible") return item.kind === "eligible";
  if (filter === "active") return item.kind === "active";
  return true;
}

function activationSummary(rules: PimActivationRules | null): string {
  if (!rules) return "—";
  const parts: string[] = [];
  parts.push(rules.requiresMfa ? "MFA" : "No MFA");
  parts.push(rules.requiresApproval ? "Approval" : "No approval");
  if (rules.maxDurationHours != null) parts.push(`${rules.maxDurationHours}h`);
  return parts.join(" · ");
}

function AssignmentRow({ assignment }: { assignment: PimAssignmentItem }) {
  const { activation } = assignment;
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">{assignment.roleName}</span>
        {assignment.isTier0 && <Badge variant="warning">Tier-0</Badge>}
        <Badge variant={assignment.kind === "active" ? "success" : "info"}>{assignment.kind === "active" ? "Active" : "Eligible"}</Badge>
        {assignment.standing && <Badge variant="error">Standing</Badge>}
      </div>
      <div className="mt-2">
        <HealthChips chips={assignment.chips} />
      </div>
      {activation && (
        <p className="mt-2 text-xs text-muted-foreground">
          Activation: {activationSummary(activation)}
          {activation.approvers.length > 0 ? ` · approvers: ${activation.approvers.join(", ")}` : ""}
        </p>
      )}
    </div>
  );
}

function PimDrawerBody({ id }: { id: string }) {
  const { detail, isLoading, error } = usePimPrincipal(id);

  if (isLoading) return <Loader size="md" text="Loading principal…" className="py-16" />;
  if (error) return <p className="py-12 text-center text-xs text-error-400">{error.message}</p>;
  if (!detail) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">{detail.principalName}</h2>
        <p className="text-xs text-muted-foreground">{detail.principalType} · read-only</p>
      </div>

      {!detail.pimLicensed && <p className="rounded-lg border border-warning-400/30 bg-warning-400/10 px-3 py-2 text-xs text-warning-700 dark:text-warning-400">Requires Entra ID P2 — PIM data is unavailable for this tenant.</p>}

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Assignments</p>
        {detail.assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No privileged assignments.</p>
        ) : (
          <div className="space-y-2">
            {detail.assignments.map((assignment) => (
              <AssignmentRow key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Recent activations</p>
        {detail.activationHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active just-in-time activations.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.activationHistory.map((event, index) => (
              <div key={`${event.roleName}-${index}`} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                <span className="text-foreground">{event.roleName}</span>
                <span className="text-muted-foreground">{event.startDateTime ? new Date(event.startDateTime).toLocaleString() : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  const { items, stats, recommendations, pimLicensed, isLoading, error } = usePim();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PimTypeFilter>("all");
  const [standingFilter, setStandingFilter] = useState<PimStandingFilter>("all");
  const [roleFilter, setRoleFilter] = useState<PimRoleFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.principalName} ${item.roleName}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (!matchesType(item, typeFilter)) return false;
      if (standingFilter === "standing" && !item.standing) return false;
      if (roleFilter === "tier0" && !item.isTier0) return false;
      return true;
    });
  }, [items, search, typeFilter, standingFilter, roleFilter]);

  const showLicenseGate = !isLoading && !pimLicensed;

  const columns: DtColumn<PimAssignmentItem>[] = [
    {
      key: "principalName",
      header: "Principal",
      sortable: true,
      render: (_, p) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{p.principalName}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {p.principalType} · {p.memberType}
          </p>
        </div>
      ),
    },
    {
      key: "roleName",
      header: "Role",
      render: (_, p) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-xs text-foreground">{p.roleName}</span>
          {p.isTier0 && <Badge variant="warning">Tier-0</Badge>}
        </div>
      ),
    },
    { key: "kind", header: "Type", render: (_, p) => <Badge variant={p.kind === "active" ? "success" : "info"}>{p.kind === "active" ? "Active" : "Eligible"}</Badge> },
    { key: "standing", header: "Standing", render: (_, p) => (p.standing ? <Badge variant="error">Standing</Badge> : <span className="text-xs text-muted-foreground">—</span>) },
    { key: "activation", header: "Activation", hideOnMobile: true, render: (_, p) => <span className="text-xs text-muted-foreground truncate">{activationSummary(p.activation)}</span> },
    { key: "startDateTime", header: "Starts / Since", hideOnMobile: true, render: (_, p) => <span className="text-xs text-muted-foreground">{formatDate(p.startDateTime)}</span> },
    { key: "healthStatus", header: "Health", render: (_, p) => <HealthChips chips={p.chips} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privileged Identity Management"
        description="Standing vs just-in-time privileged access — who holds admin roles permanently, who is eligible, and whether activation is protected by MFA and approval."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "PIM", icon: KeyRound }]}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/entra-id/privileged-identity-management/compare">
              <GitCompare size={14} />
              Compare Tenants
            </Link>
          </Button>
        }
      />

      <p className="text-xs text-muted-foreground">Direct directory-role assignments only — roles held via group membership (PIM for Groups) are not counted in v1.</p>

      {showLicenseGate ? (
        <PimLicenseRequired />
      ) : (
        <>
          <StatsCarousel
            cards={[
              { title: "Standing Admins", value: stats?.standingAdmins ?? 0, icon: ShieldAlert, color: "red", isLoading },
              { title: "Eligible / JIT", value: stats?.eligibleJit ?? 0, icon: Clock, color: "green", isLoading },
              { title: "Global Admins", value: stats?.globalAdmins ?? 0, icon: Crown, color: (stats?.globalAdmins ?? 0) > MAX_GLOBAL_ADMINS ? "red" : "blue", isLoading },
              { title: "Active Now", value: stats?.activeNow ?? 0, icon: Zap, color: "orange", isLoading },
            ]}
          />

          {!isLoading && recommendations && (
            <section className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {recommendations.recommendations.length === 0 ? <CheckCircle2 className="h-5 w-5 text-success-400" /> : <AlertTriangle className="h-5 w-5 text-warning-400" />}
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Privileged access posture</h2>
                    <p className="text-xs text-muted-foreground">
                      {recommendations.passedChecks} of {recommendations.totalChecks} baseline checks passing
                    </p>
                  </div>
                </div>
                <span className={`text-2xl font-semibold ${scoreColor(recommendations.completionScore)}`}>{recommendations.completionScore}%</span>
              </div>

              {recommendations.recommendations.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">All baseline PIM checks are passing.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {recommendations.recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              )}
            </section>
          )}

          <DataTableMainHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search principals or roles…"
            filters={
              <>
                <Dropdown options={TYPE_FILTER_OPTIONS} value={typeFilter} onChange={(v) => setTypeFilter(v as PimTypeFilter)} variant="selected" />
                <Dropdown options={STANDING_FILTER_OPTIONS} value={standingFilter} onChange={(v) => setStandingFilter(v as PimStandingFilter)} variant="selected" />
                <Dropdown options={ROLE_FILTER_OPTIONS} value={roleFilter} onChange={(v) => setRoleFilter(v as PimRoleFilter)} variant="selected" />
              </>
            }
          >
            <DataTable<PimAssignmentItem>
              data={visible}
              columns={columns}
              keyExtractor={(p) => p.id}
              className="border-0 rounded-none"
              sortEnabled
              defaultSortField="principalName"
              defaultSortDir="asc"
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              loading={isLoading}
              error={error?.message}
              onRowClick={(p) => setDrawerId(p.principalId)}
              emptyState={{ icon: ShieldCheck, title: "No privileged assignments", description: "No assignments match the current search and filters." }}
            />
          </DataTableMainHeader>
        </>
      )}

      <SlideOver isOpen={!!drawerId} onClose={() => setDrawerId(null)} title="Principal Detail" icon={<KeyRound size={16} />} width="lg">
        {drawerId && <PimDrawerBody id={drawerId} />}
      </SlideOver>
    </div>
  );
}
