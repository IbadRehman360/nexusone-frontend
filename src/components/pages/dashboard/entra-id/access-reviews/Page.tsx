"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, ShieldCheck, ClipboardList, Clock, Percent, FileWarning, LayoutGrid, ExternalLink, Lock } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Loader } from "@/src/components/ui/feedback/Loader";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useAccessReviews, useAccessReviewCampaign } from "@/src/hooks/data/useAccessReviews";
import type { ArCampaignItem, ArDecisionTallies, ArInsight, ArScopeFilter, ArStatusFilter, HealthChip, InsightSeverity } from "@/src/types/accessReviews";
import { formatDate } from "@/src/lib/utils/dateFormat";

const COMPLETED_STATUSES = ["Completed", "Applied"];

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

function arChipLabel(chip: HealthChip): string {
  switch (chip.key) {
    case "overdue":
      return "Overdue";
    case "incomplete":
      return "Incomplete";
    case "rubber_stamping":
      return "Rubber-stamping";
    case "decisions_not_applied":
      return "Decisions not applied";
    case "no_recurring_review_privileged":
      return "No recurring review";
    case "on_track":
      return "On track";
    default:
      return chip.key;
  }
}

export function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {arChipLabel(chip)}
        </Badge>
      ))}
    </div>
  );
}

function talliesLabel(tallies: ArDecisionTallies | null): string {
  if (!tallies || tallies.total === 0) return "—";
  return `${tallies.approve}✓ · ${tallies.deny}✗ · ${tallies.noResponse}?`;
}


const INSIGHT_SEVERITY_VARIANT: Record<InsightSeverity, BadgeVariant> = { danger: "error", warning: "warning", info: "info" };
const INSIGHT_SEVERITY_LABEL: Record<InsightSeverity, string> = { danger: "Critical", warning: "Warning", info: "Info" };

function InsightCard({ insight }: { insight: ArInsight }) {
  const affectedCount = insight.affectedCampaigns?.length ?? 0;
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

function ArLicenseRequired() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-(--custom-table-border) bg-card px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-400/10 text-warning-400">
        <Lock size={22} />
      </div>
      <h2 className="text-base font-semibold text-foreground">Requires Entra ID P2</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Access Reviews require Microsoft Entra ID P2. Track certification completion, catch rubber-stamping, and prove decisions were applied — across every entity.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard/entra-id/licenses">View licensing</Link>
      </Button>
    </div>
  );
}

const STATUS_FILTER_OPTIONS: { value: ArStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

const SCOPE_FILTER_OPTIONS: { value: ArScopeFilter; label: string }[] = [
  { value: "all", label: "All scopes" },
  { value: "role", label: "Directory role" },
  { value: "group", label: "Group" },
  { value: "app", label: "Application" },
  { value: "accessPackage", label: "Access package" },
];

function matchesStatus(item: ArCampaignItem, filter: ArStatusFilter): boolean {
  if (filter === "active") return item.instanceStatus === "InProgress";
  if (filter === "overdue") return item.chips.some((c) => c.key === "overdue");
  if (filter === "completed") return COMPLETED_STATUSES.includes(item.instanceStatus);
  return true;
}

function decisionVariant(decision: string): BadgeVariant {
  if (decision === "Approve") return "success";
  if (decision === "Deny") return "error";
  return "neutral";
}

function CampaignDrawerBody({ id }: { id: string }) {
  const { detail, isLoading, error } = useAccessReviewCampaign(id);

  if (isLoading) return <Loader size="md" text="Loading review…" className="py-16" />;
  if (error) return <p className="py-12 text-center text-xs text-error-400">{error.message}</p>;
  if (!detail) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">{detail.displayName}</h2>
        <p className="text-xs text-muted-foreground">
          {detail.scopeLabel} · {detail.recurrenceLabel}
          {detail.autoApply ? " · auto-apply" : ""} · read-only
        </p>
      </div>

      {!detail.arLicensed && <p className="rounded-lg border border-warning-400/30 bg-warning-400/10 px-3 py-2 text-xs text-warning-700 dark:text-warning-400">Requires Entra ID P2 — access review data is unavailable for this tenant.</p>}

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Reviewers</p>
        {detail.reviewers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No reviewers.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {detail.reviewers.map((reviewer, index) => (
              <Badge key={`${reviewer}-${index}`} variant="neutral">
                {reviewer}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Instances</p>
        {detail.instances.length === 0 ? (
          <p className="text-xs text-muted-foreground">No instances yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.instances.map((instance) => (
              <div key={instance.id} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                <span className="text-foreground">{instance.status}</span>
                <span className="text-muted-foreground">
                  {formatDate(instance.startDateTime)} – {formatDate(instance.endDateTime)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-foreground">Decisions</p>
        {detail.tallies && (
          <p className="mb-2 text-xs text-muted-foreground">
            {detail.tallies.approve} approved · {detail.tallies.deny} denied · {detail.tallies.noResponse} no response · {detail.tallies.applied} applied
          </p>
        )}
        {detail.decisions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No decisions recorded.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
            {detail.decisions.map((decision, index) => (
              <div key={`${decision.principalName}-${index}`} className="flex items-start justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">{decision.principalName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {decision.reviewedBy ?? "—"}
                    {decision.applied ? " · applied" : ""}
                  </p>
                </div>
                <Badge variant={decisionVariant(decision.decision)}>{decision.decision}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  const { items, stats, insights, arLicensed, isLoading, error } = useAccessReviews();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArStatusFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ArScopeFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !item.displayName.toLowerCase().includes(query)) return false;
      if (!matchesStatus(item, statusFilter)) return false;
      if (scopeFilter !== "all" && item.scopeType !== scopeFilter) return false;
      return true;
    });
  }, [items, search, statusFilter, scopeFilter]);

  const showLicenseGate = !isLoading && !arLicensed;

  const columns: DtColumn<ArCampaignItem>[] = [
    {
      key: "displayName",
      header: "Review",
      sortable: true,
      render: (_, c) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{c.displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {c.recurrenceLabel}
            {c.autoApply ? " · auto-apply" : ""}
          </p>
        </div>
      ),
    },
    {
      key: "scopeLabel",
      header: "Scope",
      render: (_, c) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-xs text-foreground">{c.scopeLabel}</span>
          {c.isPrivilegedScope && <Badge variant="warning">Privileged</Badge>}
        </div>
      ),
    },
    { key: "reviewerCount", header: "Reviewers", hideOnMobile: true, render: (_, c) => <span className="text-xs text-muted-foreground">{c.reviewerCount}</span> },
    {
      key: "startDateTime",
      header: "Period",
      hideOnMobile: true,
      render: (_, c) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(c.startDateTime)} – {formatDate(c.endDateTime)}
        </span>
      ),
    },
    { key: "instanceStatus", header: "Status", render: (_, c) => <span className="text-xs text-foreground">{c.instanceStatus}</span> },
    { key: "completionPercent", header: "% Complete", render: (_, c) => <span className="text-xs text-muted-foreground">{c.completionPercent !== null ? `${c.completionPercent}%` : "—"}</span> },
    { key: "tallies", header: "Decisions", hideOnMobile: true, render: (_, c) => <span className="text-xs text-muted-foreground">{talliesLabel(c.tallies)}</span> },
    { key: "healthStatus", header: "Health", render: (_, c) => <HealthChips chips={c.chips} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Reviews"
        description="Access certification at a glance — which campaigns are done, who hasn't responded, where decisions stalled, and where reviews are being rubber-stamped."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Access Reviews", icon: ClipboardCheck }]}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/entra-id/access-reviews/compare">
              <LayoutGrid size={14} />
              Compliance Board
            </Link>
          </Button>
        }
      />

      {showLicenseGate ? (
        <ArLicenseRequired />
      ) : (
        <>
          <StatsCarousel
            cards={[
              {
                title: "Compliance Posture",
                value: insights ? `${insights.completionScore}%` : "—",
                subtitle: insights ? `${insights.passedChecks} of ${insights.totalChecks} checks passing` : undefined,
                icon: insights && insights.insights.length === 0 ? ShieldCheck : ClipboardList,
                color: insights && insights.insights.length === 0 ? "green" : "orange",
                isLoading,
              },
              { title: "Active Reviews", value: stats?.activeReviews ?? 0, icon: ClipboardList, color: "blue", isLoading },
              { title: "Overdue / Incomplete", value: stats?.overdueIncomplete ?? 0, icon: Clock, color: "red", isLoading },
              { title: "Avg Completion %", value: stats?.avgCompletion ?? 0, icon: Percent, color: "green", isLoading },
              { title: "Decisions Pending Apply", value: stats?.decisionsPendingApply ?? 0, icon: FileWarning, color: "orange", isLoading },
            ]}
          />

          {!isLoading && insights && insights.insights.length > 0 && (
            <section className="rounded-2xl border border-(--custom-table-border) bg-card p-5">
              <div className="grid gap-3">
                {insights.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}

          <DataTableMainHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search reviews…"
            filters={
              <>
                <Dropdown options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={(v) => setStatusFilter(v as ArStatusFilter)} variant="selected" />
                <Dropdown options={SCOPE_FILTER_OPTIONS} value={scopeFilter} onChange={(v) => setScopeFilter(v as ArScopeFilter)} variant="selected" />
              </>
            }
          >
            <DataTable<ArCampaignItem>
              data={visible}
              columns={columns}
              keyExtractor={(c) => c.id}
              className="border-0 rounded-none"
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              loading={isLoading}
              error={error?.message}
              onRowClick={(c) => setDrawerId(c.id)}
              emptyState={{ icon: ClipboardCheck, title: "No access reviews", description: "No campaigns match the current search and filters." }}
            />
          </DataTableMainHeader>
        </>
      )}

      <SlideOver isOpen={!!drawerId} onClose={() => setDrawerId(null)} title="Review Detail" icon={<ClipboardCheck size={16} />} width="lg">
        {drawerId && <CampaignDrawerBody id={drawerId} />}
      </SlideOver>
    </div>
  );
}
