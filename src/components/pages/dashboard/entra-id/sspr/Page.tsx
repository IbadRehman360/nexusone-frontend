"use client";

import { useMemo, useState } from "react";
import { KeyRound, ShieldCheck, UserCheck, RotateCcw, RefreshCw, Lock, ExternalLink } from "lucide-react";
import { LicenseGateState } from "@/src/components/ui/display/LicenseGateState";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Loader } from "@/src/components/ui/feedback/Loader";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { ColorVariant } from "@/src/components/ui/display/StatsCard";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useEntraTier } from "@/src/hooks/data/useEntraTier";
import { useSsprCatalog, useSsprConfig, useSsprUsage, useSsprUserDetail } from "@/src/hooks/data/useSspr";
import { InlineError } from "@/src/components/error/InlineError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { PresentedError } from "@/src/lib/errors/getErrorPresentation";
import type { HealthChip, MethodCategory, SsprAllowedMethod, SsprStatus, SsprUserFilter, SsprUserListItem, SsprUserMethod, SsprView, WritebackStatus } from "@/src/types/sspr";
import { formatDate, formatDateTime } from "@/src/lib/utils/dateFormat";

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

const RISK_CHIP_LABEL: Record<HealthChip["key"], string> = {
  registered: "Registered",
  capable_not_registered: "Capable, not registered",
  admin_not_registered: "Admin · not registered",
  weak_method: "Weak method only",
  out_of_scope: "Out of scope",
};

const METHOD_CATEGORY_LABELS: Record<MethodCategory, string> = {
  app: "App",
  phone: "Phone",
  email: "Email",
  questions: "Questions",
};

const STATUS_LABEL: Record<SsprStatus, string> = {
  enabled_all: "Enabled (all)",
  enabled_selected: "Enabled (selected)",
  off: "Off",
  unknown: "Unknown",
};

const WRITEBACK_LABEL: Record<WritebackStatus, string> = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  na: "N/A",
  unknown: "Unknown",
};

const WRITEBACK_BADGE: Record<WritebackStatus, BadgeVariant> = {
  healthy: "success",
  unhealthy: "error",
  na: "neutral",
  unknown: "neutral",
};

function statusColor(status: SsprStatus): ColorVariant {
  if (status === "off") return "red";
  if (status === "unknown") return "neutral";
  return "green";
}

function writebackColor(status: WritebackStatus): ColorVariant {
  if (status === "unhealthy") return "red";
  if (status === "healthy") return "green";
  return "neutral";
}

function MethodChips({ categories }: { categories: MethodCategory[] }) {
  if (categories.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((c) => (
        <span key={c} className="rounded-md border border-(--custom-table-border) bg-(--custom-table-bg) px-1.5 py-0.5 text-[10px] text-foreground/70">
          {METHOD_CATEGORY_LABELS[c]}
        </span>
      ))}
    </div>
  );
}

function HealthChips({ chips }: { chips: HealthChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant={SEVERITY_VARIANT[chip.severity]}>
          {RISK_CHIP_LABEL[chip.key]}
        </Badge>
      ))}
    </div>
  );
}

function BoolValue({ value, yes = "Yes", no = "No" }: { value: boolean; yes?: string; no?: string }) {
  return <span className={value ? "font-medium text-foreground" : "text-muted-foreground"}>{value ? yes : no}</span>;
}


function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${danger ? "text-error-400" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function HorizontalBars({ items }: { items: { name: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-xs text-muted-foreground">{item.name}</span>
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-info-400" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function WeeklyBars({ weeks }: { weeks: { week: string; success: number; failure: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.success + w.failure));
  return (
    <div className="space-y-2.5">
      {weeks.map((week) => {
        const total = week.success + week.failure;
        const widthPct = (total / max) * 100;
        const successPct = total ? (week.success / total) * 100 : 0;
        return (
          <div key={week.week} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-[11px] text-muted-foreground">{week.week}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/30">
              <div className="flex h-full" style={{ width: `${widthPct}%` }}>
                <div className="h-full bg-success-400/70" style={{ width: `${successPct}%` }} />
                <div className="h-full bg-error-400/70" style={{ width: `${100 - successPct}%` }} />
              </div>
            </div>
            <span className="w-16 shrink-0 text-right text-[11px] tabular-nums">
              <span className="text-success-400">{week.success}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="text-error-400">{week.failure}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

const LICENSE_GATE_STEPS = [
  { title: "Purchase the license", description: "Add the required license to your tenant via the Microsoft 365 admin center or your reseller." },
  { title: "Wait for propagation", description: "Licensing changes can take up to a few hours to fully apply across Microsoft Entra ID." },
  { title: "Refresh this page", description: "Once the license is active, this page will unlock automatically — no further setup needed." },
];

function TierUpgradeState() {
  return (
    <LicenseGateState
      title="Requires Microsoft Entra ID P1"
      description="Self-service password reset requires Microsoft Entra ID P1. Upgrade to let users reset their own passwords and cut helpdesk tickets."
      steps={LICENSE_GATE_STEPS}
    />
  );
}

const TABS: { id: SsprView; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "config", label: "Config & Health" },
  { id: "usage", label: "Usage & Reporting" },
];

const FILTER_OPTIONS: { value: SsprUserFilter; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "capable_not_registered", label: "Capable, not registered" },
  { value: "registered", label: "Registered" },
  { value: "out_of_scope", label: "Out of scope" },
];

function matchesFilter(user: SsprUserListItem, filter: SsprUserFilter): boolean {
  switch (filter) {
    case "capable_not_registered":
      return user.inScope && user.isCapable && !user.isRegistered;
    case "registered":
      return user.isRegistered;
    case "out_of_scope":
      return !user.inScope;
    default:
      return true;
  }
}

function SsprUsersTab({ users, isLoading, error, onRowClick }: { users: SsprUserListItem[]; isLoading: boolean; error?: string | PresentedError; onRowClick: (u: SsprUserListItem) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SsprUserFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      if (query && !`${u.userDisplayName} ${u.userPrincipalName}`.toLowerCase().includes(query)) return false;
      return matchesFilter(u, filter);
    });
  }, [users, search, filter]);

  const columns: DtColumn<SsprUserListItem>[] = [
    {
      key: "userDisplayName",
      header: "User",
      sortable: true,
      render: (_, u) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{u.userDisplayName}</p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{u.userPrincipalName}</p>
        </div>
      ),
    },
    { key: "isRegistered", header: "Registered", render: (_, u) => <BoolValue value={u.isRegistered} /> },
    { key: "inScope", header: "In Scope", hideOnMobile: true, render: (_, u) => <BoolValue value={u.inScope} /> },
    { key: "methodCategories", header: "Methods", hideOnMobile: true, render: (_, u) => <MethodChips categories={u.methodCategories} /> },
    {
      key: "lastUpdatedDateTime",
      header: "Last Updated",
      hideOnMobile: true,
      render: (_, u) => <span className="text-xs text-muted-foreground">{u.lastUpdatedDateTime ? formatDate(u.lastUpdatedDateTime) : "—"}</span>,
    },
    { key: "healthStatus", header: "Health", render: (_, u) => <HealthChips chips={u.chips} /> },
  ];

  return (
    <DataTableMainHeader
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search users…"
      filters={<Dropdown options={FILTER_OPTIONS} value={filter} onChange={(v) => setFilter(v as SsprUserFilter)} variant="selected" />}
    >
      <DataTable<SsprUserListItem>
        data={visible}
        columns={columns}
        keyExtractor={(u) => u.id}
        className="border-0 rounded-none"
        sortEnabled
        defaultSortField="userDisplayName"
        defaultSortDir="asc"
        pageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        loading={isLoading}
        error={error}
        onRowClick={onRowClick}
        emptyState={{ icon: KeyRound, title: "No users match", description: "Adjust the filter or search to see users." }}
      />
    </DataTableMainHeader>
  );
}

function SsprConfigTab() {
  const { config, isLoading, error } = useSsprConfig(true);

  if (error) return <InlineError error={presentError(error)} />;

  const statusRows: { label: string; value: React.ReactNode }[] = config
    ? [
        { label: "SSPR status", value: STATUS_LABEL[config.status] },
        { label: "Scope", value: config.scopeLabel },
        { label: "Methods required to reset", value: <span className="text-muted-foreground">Set in Entra portal</span> },
      ]
    : [];

  const writebackRows: { label: string; value: React.ReactNode }[] = config
    ? [
        { label: "Writeback", value: <Badge variant={WRITEBACK_BADGE[config.writeback.status]}>{WRITEBACK_LABEL[config.writeback.status]}</Badge> },
        { label: "Applicable", value: config.writeback.applicable ? "Yes (hybrid)" : "No (cloud-only)" },
        { label: "Source", value: config.writeback.source },
      ]
    : [];

  return (
    <div className="space-y-5">
      <DataTableMainHeader title="Details">
        <DataTable<{ label: string; value: React.ReactNode }>
          data={statusRows}
          keyExtractor={(row) => row.label}
          className="border-0 rounded-none"
          loading={isLoading}
          columns={[
            { key: "label", header: "", render: (_, row) => <span className="text-xs text-muted-foreground">{row.label}</span> },
            { key: "value", header: "", align: "right", render: (_, row) => <span className="text-xs font-medium text-foreground">{row.value}</span> },
          ]}
        />
      </DataTableMainHeader>

      <DataTableMainHeader title="Allowed Methods">
        <DataTable<SsprAllowedMethod>
          data={config?.allowedMethods ?? []}
          keyExtractor={(method) => method.method}
          className="border-0 rounded-none"
          loading={isLoading}
          columns={[
            { key: "method", header: "Method", sortable: true, render: (_, method) => <span className="text-xs font-medium text-foreground">{method.method}</span> },
            {
              key: "state",
              header: "Status",
              align: "right",
              render: (_, method) => <Badge variant={method.state === "enabled" ? "success" : "neutral"}>{method.state === "enabled" ? "Enabled" : "Disabled"}</Badge>,
            },
          ]}
          emptyState={{ icon: KeyRound, title: "No method policy available", description: "Method policy is not available via the API." }}
        />
      </DataTableMainHeader>

      <DataTableMainHeader title="Writeback">
        <DataTable<{ label: string; value: React.ReactNode }>
          data={writebackRows}
          keyExtractor={(row) => row.label}
          className="border-0 rounded-none"
          loading={isLoading}
          columns={[
            { key: "label", header: "", render: (_, row) => <span className="text-xs text-muted-foreground">{row.label}</span> },
            { key: "value", header: "", align: "right", render: (_, row) => <span className="text-xs font-medium text-foreground">{row.value}</span> },
          ]}
        />
      </DataTableMainHeader>

      {config && (
        <>
          <p className="text-xs text-muted-foreground">{config.methodsRequiredNote}</p>

          <Button variant="outline" size="sm" asChild rightIcon={<ExternalLink size={13} />}>
            <a href={config.portalDeepLink} target="_blank" rel="noopener noreferrer">
              Open in Entra portal
            </a>
          </Button>
        </>
      )}
    </div>
  );
}

const USAGE_CAPTION =
  "Password reset and account-unlock events from the directory audit log (last 30 days). This includes self-service resets, helpdesk/admin resets, and blocked attempts — a blocked attempt (e.g. an unregistered user trying to reset) counts as a failure, so failures can appear even when few users are registered.";

function SsprUsageTab() {
  const { usage, isLoading, error } = useSsprUsage(true);

  if (isLoading) return <Loader size="md" text="Loading usage…" className="py-16" />;
  if (error) return <InlineError error={presentError(error)} />;
  if (!usage) return null;

  return (
    <div className="space-y-5 p-5">
      <p className="text-xs leading-relaxed text-muted-foreground">{USAGE_CAPTION}</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Resets this month" value={String(usage.summary.thisMonth)} />
        <Metric label="Succeeded" value={String(usage.summary.succeeded)} />
        <Metric label="Failed" value={String(usage.summary.failed)} danger={usage.summary.failed > 0} />
        <Metric label="Success rate" value={`${usage.summary.successRatePct}%`} />
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Resets over time (weekly)</p>
        {usage.resetsOverTime.length > 1 ? (
          <HorizontalBars items={usage.resetsOverTime.map((p) => ({ name: p.date, count: p.count }))} />
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">Not enough data yet.</p>
        )}
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Success vs failure by week</p>
        {usage.byWeek.length > 0 ? <WeeklyBars weeks={usage.byWeek} /> : <p className="py-6 text-center text-xs text-muted-foreground">Not enough data yet.</p>}
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Top failure reasons</p>
        {usage.topFailureReasons.length > 0 ? (
          <div className="divide-y divide-(--custom-table-border)">
            {usage.topFailureReasons.map((reason) => (
              <div key={reason.name} className="flex items-start justify-between gap-4 py-2">
                <span className="min-w-0 text-xs text-foreground/80">{reason.name}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-error-400">{reason.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">No reset failures recorded.</p>
        )}
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Resets by method</p>
        {usage.byMethodAvailable ? (
          <HorizontalBars items={usage.byMethod} />
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">Microsoft doesn&apos;t record which method was used in the reset audit log.</p>
        )}
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Reset vs unlock</p>
        <HorizontalBars items={[{ name: "Resets", count: usage.resetVsUnlock.resets }, { name: "Unlocks", count: usage.resetVsUnlock.unlocks }]} />
      </div>
    </div>
  );
}

function resultVariant(result: string): BadgeVariant {
  if (result === "success") return "success";
  if (result === "failure") return "error";
  return "neutral";
}

function MethodRow({ method }: { method: SsprUserMethod }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">{method.displayName}</p>
        <p className="text-[11px] text-muted-foreground">{method.type}</p>
      </div>
      {method.detail && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{method.detail}</span>}
    </div>
  );
}

function SsprUserDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { detail, isLoading, error } = useSsprUserDetail(userId);

  return (
    <SlideOver isOpen={!!userId} onClose={onClose} title={detail?.userDisplayName ?? "User detail"} subtitle={detail?.userPrincipalName} icon={<KeyRound size={16} />} width="md">
      {isLoading && <Loader size="md" text="Loading user…" className="py-16" />}
      {error && <InlineError error={presentError(error)} />}
      {detail && (
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            {detail.isAdmin && <Badge variant="info">Admin</Badge>}
            <HealthChips chips={detail.chips} />
          </div>

          <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
            <DetailRow label="In scope" value={<BoolValue value={detail.inScope} yes="Enabled" no="Out of scope" />} />
            <DetailRow label="Capable" value={<BoolValue value={detail.isCapable} />} />
            <DetailRow label="Registered" value={<BoolValue value={detail.isRegistered} />} />
            <DetailRow label="Admin" value={<BoolValue value={detail.isAdmin} />} />
            <DetailRow label="Methods" value={<MethodChips categories={detail.methodCategories} />} />
            <DetailRow label="Last updated" value={detail.lastUpdatedDateTime ? formatDate(detail.lastUpdatedDateTime) : "—"} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Registered methods</p>
            {detail.methods.length === 0 ? (
              <p className="text-xs text-muted-foreground">No methods registered.</p>
            ) : (
              <div className="space-y-2">
                {detail.methods.map((method) => <MethodRow key={method.id} method={method} />)}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent reset / unlock activity</p>
            {detail.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recorded activity in the last 30 days.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
                {detail.recentActivity.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                    <span className="tabular-nums text-muted-foreground">{formatDateTime(event.activityDateTime)}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground">{event.activity}</span>
                    <Badge variant={resultVariant(event.result)}>{event.result}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}

export default function Page() {
  const { hasTier, isLoading: tierLoading } = useEntraTier();
  const { users, stats, isLoading, error } = useSsprCatalog();
  const [view, setView] = useState<SsprView>("users");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const coverage = stats?.coveragePct ?? 0;
  const statsLoading = tierLoading || isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Password Reset (SSPR)"
        description="Who can reset their own password — coverage, the capable-but-unregistered users who'll call the helpdesk next, reset activity, and configuration health."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Password Reset", icon: KeyRound }]}
      />

      <StatsCarousel
        cards={[
          { title: "SSPR Status", value: stats ? STATUS_LABEL[stats.status] : "—", icon: Lock, color: stats ? statusColor(stats.status) : "neutral", isLoading: statsLoading },
          {
            title: "Registration Coverage",
            value: `${coverage}%`,
            subtitle: stats ? `${stats.registeredCount} of ${stats.capableCount} capable` : undefined,
            icon: UserCheck,
            color: coverage < 90 ? "orange" : "green",
            isLoading: statsLoading,
          },
          { title: "Resets This Month", value: stats?.resetsThisMonth ?? 0, subtitle: stats ? `${stats.resetSuccessRate}% success` : undefined, icon: RotateCcw, color: "blue", isLoading: statsLoading },
          { title: "Writeback", value: stats ? WRITEBACK_LABEL[stats.writeback] : "—", icon: RefreshCw, color: stats ? writebackColor(stats.writeback) : "neutral", isLoading: statsLoading },
        ]}
      />

      {!tierLoading && !hasTier("p1") ? (
        <TierUpgradeState />
      ) : (
        <SsprBody users={users} isLoading={tierLoading || isLoading} error={error} view={view} setView={setView} drawerId={drawerId} setDrawerId={setDrawerId} />
      )}
    </div>
  );
}

function SsprBody({
  users,
  isLoading,
  error,
  view,
  setView,
  drawerId,
  setDrawerId,
}: {
  users: SsprUserListItem[];
  isLoading: boolean;
  error: Error | null;
  view: SsprView;
  setView: (v: SsprView) => void;
  drawerId: string | null;
  setDrawerId: (id: string | null) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <Tabs variant="pill" tabs={TABS} activeTab={view} onChange={setView} />

        {view === "users" && <SsprUsersTab users={users} isLoading={isLoading} error={error ? presentError(error) : undefined} onRowClick={(u) => setDrawerId(u.id)} />}
        {view === "config" && <SsprConfigTab />}
        {view === "usage" && <div className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg)">{<SsprUsageTab />}</div>}
      </div>

      <SsprUserDrawer userId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  );
}
