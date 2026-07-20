"use client";

import { useMemo, useState } from "react";
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Lock,
  ExternalLink,
} from "lucide-react";
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
import { LicenseGateState } from "@/src/components/ui/display/LicenseGateState";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { formatDateTime } from "@/src/lib/utils/dateFormat";
import { useEntraTier } from "@/src/hooks/data/useEntraTier";
import { useMfaCatalog, useMfaPosture, useMfaPolicy, useMfaUserDetail } from "@/src/hooks/data/useMfa";
import { InlineError } from "@/src/components/error/InlineError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { PresentedError } from "@/src/lib/errors/getErrorPresentation";
import type { HealthChip, MfaEnforcingPolicy, MfaUserFilter, MfaUserListItem, MfaView, MethodTone } from "@/src/types/mfa";

const SEVERITY_VARIANT: Record<HealthChip["severity"], BadgeVariant> = {
  danger: "error",
  warning: "warning",
  muted: "neutral",
  info: "info",
  success: "success",
};

const RISK_CHIP_LABEL: Record<HealthChip["key"], string> = {
  phishing_resistant: "Phishing-resistant",
  sms_voice_only: "SMS / voice only",
  no_mfa: "No MFA registered",
  admin_without_strong: "Admin · no strong MFA",
  out_of_scope: "Out of scope",
};

const METHOD_LABELS: Record<string, string> = {
  microsoftAuthenticatorPush: "Authenticator",
  microsoftAuthenticatorPasswordless: "Authenticator (passwordless)",
  softwareOneTimePasscode: "Authenticator (code)",
  hardwareOneTimePasscode: "Hardware token",
  fido2SecurityKey: "FIDO2 key",
  windowsHelloForBusiness: "Windows Hello",
  passKeyDeviceBound: "Passkey",
  passKeyDeviceBoundAuthenticator: "Passkey",
  passKeyDeviceBoundWindowsHello: "Passkey",
  x509Certificate: "Certificate",
  mobilePhone: "SMS",
  alternateMobilePhone: "SMS (alt)",
  officePhone: "Office phone",
  sms: "SMS",
  voiceMobile: "Phone call",
  voiceAlternateMobile: "Phone call (alt)",
  voiceOffice: "Office phone",
  email: "Email",
  securityQuestion: "Questions",
};

const STRONG_METHODS = new Set([
  "fido2SecurityKey",
  "windowsHelloForBusiness",
  "passKeyDeviceBound",
  "passKeyDeviceBoundAuthenticator",
  "passKeyDeviceBoundWindowsHello",
  "x509Certificate",
  "microsoftAuthenticatorPush",
  "microsoftAuthenticatorPasswordless",
  "softwareOneTimePasscode",
  "hardwareOneTimePasscode",
]);

const WEAK_METHODS = new Set(["mobilePhone", "alternateMobilePhone", "officePhone", "sms", "voiceMobile", "voiceAlternateMobile", "voiceOffice"]);

function methodLabel(method: string): string {
  return METHOD_LABELS[method] ?? method;
}

function methodTone(method: string): MethodTone {
  if (STRONG_METHODS.has(method)) return "strong";
  if (WEAK_METHODS.has(method)) return "weak";
  return "neutral";
}

const TONE_CLASS: Record<MethodTone, string> = {
  strong: "border-success-400/20 text-success-700 dark:text-success-400",
  weak: "border-warning-400/20 text-warning-800 dark:text-warning-400",
  neutral: "border-(--custom-table-border) text-foreground/70",
};

function MethodChips({ methods }: { methods: string[] }) {
  if (methods.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {methods.map((m) => (
        <span key={m} className={`rounded-md border bg-(--custom-table-bg) px-1.5 py-0.5 text-[10px] ${TONE_CLASS[methodTone(m)]}`}>
          {methodLabel(m)}
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

const LICENSE_GATE_STEPS = [
  { title: "Purchase the license", description: "Add the required license to your tenant via the Microsoft 365 admin center or your reseller." },
  { title: "Wait for propagation", description: "Licensing changes can take up to a few hours to fully apply across Microsoft Entra ID." },
  { title: "Refresh this page", description: "Once the license is active, this page will unlock automatically — no further setup needed." },
];

function TierUpgradeState() {
  return (
    <LicenseGateState
      title="Requires Microsoft Entra ID P1"
      description="MFA monitoring requires Microsoft Entra ID P1. Upgrade to see who's protected, find the risky gaps, and prove the posture is improving."
      steps={LICENSE_GATE_STEPS}
    />
  );
}

const TABS: { id: MfaView; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "posture", label: "Posture & Reporting" },
  { id: "policy", label: "Policy & Health" },
];

const FILTER_OPTIONS: { value: MfaUserFilter; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "capable_no_strong", label: "Capable, no strong MFA" },
  { value: "weak_only", label: "Weak only" },
  { value: "protected", label: "Protected" },
];

function matchesFilter(user: MfaUserListItem, filter: MfaUserFilter): boolean {
  switch (filter) {
    case "capable_no_strong":
      return user.inScope && !user.hasStrongMethod;
    case "weak_only":
      return user.strength === "weak";
    case "protected":
      return user.hasStrongMethod;
    default:
      return true;
  }
}

function MfaUsersTab({ users, isLoading, error, onRowClick }: { users: MfaUserListItem[]; isLoading: boolean; error?: string | PresentedError; onRowClick: (u: MfaUserListItem) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MfaUserFilter>("all");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      if (query && !`${u.userDisplayName} ${u.userPrincipalName}`.toLowerCase().includes(query)) return false;
      return matchesFilter(u, filter);
    });
  }, [users, search, filter]);

  const columns: DtColumn<MfaUserListItem>[] = [
    {
      key: "userDisplayName",
      header: "User",
      sortable: true,
      render: (_, u) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-foreground">{u.userDisplayName}</span>
            {u.isAdmin && <Badge variant="info">Admin</Badge>}
          </div>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{u.userPrincipalName}</p>
        </div>
      ),
    },
    {
      key: "isMfaRegistered",
      header: "MFA On",
      render: (_, u) => <BoolValue value={u.isMfaRegistered} />,
    },
    {
      key: "methodsRegistered",
      header: "Methods",
      hideOnMobile: true,
      render: (_, u) => <MethodChips methods={u.methodsRegistered} />,
    },
    {
      key: "inScope",
      header: "In Scope",
      hideOnMobile: true,
      render: (_, u) => <BoolValue value={u.inScope} />,
    },
    {
      key: "healthStatus",
      header: "Risk",
      render: (_, u) => <HealthChips chips={u.chips} />,
    },
  ];

  return (
    <DataTableMainHeader
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search users…"
      filters={<Dropdown options={FILTER_OPTIONS} value={filter} onChange={(v) => setFilter(v as MfaUserFilter)} variant="selected" />}
    >
      <DataTable<MfaUserListItem>
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
        emptyState={{ icon: Fingerprint, title: "No users match", description: "Adjust the filter or search to see users." }}
      />
    </DataTableMainHeader>
  );
}

function MfaPostureTab() {
  const { posture, isLoading, error } = useMfaPosture(true);

  if (isLoading) return <Loader size="md" text="Loading posture…" className="py-16" />;
  if (error) return <InlineError error={presentError(error)} />;
  if (!posture) return null;

  return (
    <div className="space-y-5 p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Coverage" value={`${posture.summary.coveragePct}%`} />
        <Metric label="Strong methods" value={`${posture.summary.strongPct}%`} />
        <Metric label="Weak factor only" value={String(posture.summary.weakCount)} danger={posture.summary.weakCount > 0} />
        <Metric label="No MFA" value={String(posture.summary.noneCount)} danger={posture.summary.noneCount > 0} />
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Method strength distribution</p>
        <HorizontalBars items={posture.methodStrength} />
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">MFA adoption over time</p>
        {posture.adoptionAvailable ? (
          <HorizontalBars items={posture.adoptionOverTime.map((p) => ({ name: p.date, count: p.count }))} />
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">Not enough data yet.</p>
        )}
      </div>

      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Failed MFA prompts over time</p>
        {posture.failedPromptsAvailable && posture.failedPromptsOverTime.length > 1 ? (
          <HorizontalBars items={posture.failedPromptsOverTime.map((p) => ({ name: p.date, count: p.count }))} />
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">No failed MFA prompts recorded — or sign-in reporting is unavailable.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">A rising adoption line means posture is improving. Spikes in failed prompts can signal an MFA-fatigue attack in progress.</p>
    </div>
  );
}

const POLICY_STATE_VARIANT: Record<string, BadgeVariant> = { enforced: "success", report_only: "warning", off: "neutral" };
const POLICY_STATE_LABEL: Record<string, string> = { enforced: "On", report_only: "Report-only", off: "Off" };

function MfaPolicyTab() {
  const { policy, isLoading, error } = useMfaPolicy(true);

  if (isLoading) return <Loader size="md" text="Loading policy health…" className="py-16" />;
  if (error) return <InlineError error={presentError(error)} />;
  if (!policy) return null;

  const detailsRows: { label: string; value: React.ReactNode }[] = [
    { label: "Enforcing MFA", value: `${policy.enforcedCount} enforced · ${policy.reportOnlyCount} report-only` },
    { label: "Block legacy auth", value: <Badge variant={policy.legacyAuthBlocked ? "success" : "error"}>{policy.legacyAuthBlocked ? "Blocked" : "Allowed"}</Badge> },
    { label: "Excluded users", value: String(policy.excludedUserCount) },
    { label: "Graph connectivity", value: <Badge variant={policy.graphHealthy ? "success" : "error"}>{policy.graphHealthy ? "Healthy" : "Unavailable"}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Where the gaps are</p>
        <HorizontalBars items={[{ name: "Enforced", count: policy.gaps.enforced }, { name: "Report-only", count: policy.gaps.reportOnly }, { name: "Excluded users", count: policy.gaps.excluded }]} />
      </div>

      <DataTableMainHeader title="Details">
        <DataTable<{ label: string; value: React.ReactNode }>
          data={detailsRows}
          keyExtractor={(row) => row.label}
          className="border-0 rounded-none"
          columns={[
            { key: "label", header: "", render: (_, row) => <span className="text-xs text-muted-foreground">{row.label}</span> },
            { key: "value", header: "", align: "right", render: (_, row) => <span className="text-xs font-medium text-foreground">{row.value}</span> },
          ]}
        />
      </DataTableMainHeader>

      <DataTableMainHeader title="MFA-enforcing policies">
        <DataTable<MfaEnforcingPolicy>
          data={policy.enforcingPolicies}
          keyExtractor={(p) => p.id}
          className="border-0 rounded-none"
          columns={[
            {
              key: "displayName",
              header: "Policy",
              sortable: true,
              render: (_, p) => (
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{p.displayName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.assignedToSummary}
                    {p.excludedCount > 0 ? ` · ${p.excludedCount} excluded` : ""}
                    {p.requiresPhishingResistant ? " · phishing-resistant" : ""}
                  </p>
                </div>
              ),
            },
            { key: "state", header: "Status", align: "right", render: (_, p) => <Badge variant={POLICY_STATE_VARIANT[p.state]}>{POLICY_STATE_LABEL[p.state]}</Badge> },
          ]}
          emptyState={{ icon: ShieldAlert, title: "No enforcing policies", description: "No Conditional Access policy enforces MFA. Sign-ins rely on per-user settings — or nothing at all." }}
        />
      </DataTableMainHeader>

      <p className="text-xs text-muted-foreground">{policy.enforcementNote}</p>

      <Button variant="outline" size="sm" asChild rightIcon={<ExternalLink size={13} />}>
        <a href={policy.portalDeepLink} target="_blank" rel="noopener noreferrer">
          Open in Entra portal
        </a>
      </Button>
    </div>
  );
}

function resultVariant(result: string | null): BadgeVariant {
  const v = (result ?? "").toLowerCase();
  if (v === "success") return "success";
  if (v === "failure") return "error";
  return "neutral";
}


function MfaUserDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { detail, isLoading, error } = useMfaUserDetail(userId);

  return (
    <SlideOver isOpen={!!userId} onClose={onClose} title={detail?.userDisplayName ?? "User detail"} subtitle={detail?.userPrincipalName} icon={<Fingerprint size={16} />} width="md">
      {isLoading && <Loader size="md" text="Loading user…" className="py-16" />}
      {error && <InlineError error={presentError(error)} />}
      {detail && (
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            {detail.isAdmin && <Badge variant="info">Admin</Badge>}
            <HealthChips chips={detail.chips} />
          </div>

          <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
            <DetailRow label="In scope" value={<BoolValue value={detail.inScope} yes="In scope" no="Out of scope" />} />
            <DetailRow label="MFA registered" value={<BoolValue value={detail.isMfaRegistered} />} />
            <DetailRow label="Strong method" value={<BoolValue value={detail.hasStrongMethod} />} />
            <DetailRow label="Admin" value={<BoolValue value={detail.isAdmin} />} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Registered methods</p>
            {detail.methods.length === 0 ? (
              <p className="text-xs text-muted-foreground">No authentication methods are registered.</p>
            ) : (
              <div className="space-y-2">
                {detail.methods.map((method) => (
                  <div key={method.id} className={`flex items-center justify-between gap-3 rounded-xl border bg-(--custom-table-bg) px-4 py-3 ${TONE_CLASS[method.tone]}`}>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{method.displayName}</p>
                      <p className="text-[11px] text-muted-foreground">{method.type}</p>
                    </div>
                    {method.detail && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{method.detail}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent MFA activity</p>
            {detail.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recorded authentication-method activity in the last 30 days.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
                {detail.recentActivity.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
                    <span className="tabular-nums text-muted-foreground">{formatDateTime(event.activityDateTime)}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground">{event.activity}</span>
                    {event.result && <Badge variant={resultVariant(event.result)}>{event.result}</Badge>}
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
  const { users, stats, isLoading, error } = useMfaCatalog();
  const [view, setView] = useState<MfaView>("users");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const coverage = stats?.coveragePct ?? 0;
  const legacyBlocked = stats?.legacyAuthBlocked ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="MFA"
        description="Who's protected by MFA and who isn't — coverage, the capable users still on weak or no MFA, per-user audits, and whether enforcement actually holds."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "MFA", icon: Fingerprint }]}
      />

      <StatsCarousel
        cards={[
          {
            title: "MFA Coverage",
            value: `${coverage}%`,
            subtitle: stats ? `${stats.registeredCount} of ${stats.inScopeCount} in scope` : "Registered ÷ in scope",
            icon: ShieldCheck,
            color: coverage < 95 ? "orange" : "green",
            isLoading: tierLoading || isLoading,
          },
          { title: "Weak Factor Only", value: stats?.weakFactorOnlyCount ?? 0, subtitle: "On SMS / voice — SIM-swappable", icon: ShieldAlert, color: "red", isLoading: tierLoading || isLoading },
          { title: "Admins at Risk", value: stats?.adminsAtRiskCount ?? 0, subtitle: "Privileged, no strong MFA", icon: UserCog, color: "red", isLoading: tierLoading || isLoading },
          {
            title: "Legacy Auth",
            value: stats ? (legacyBlocked === null ? "Unknown" : legacyBlocked ? "Blocked" : "Allowed") : "—",
            subtitle: "Old protocols bypass MFA",
            icon: Lock,
            color: legacyBlocked === null ? "neutral" : legacyBlocked ? "green" : "red",
            isLoading: tierLoading || isLoading,
          },
        ]}
      />

      {!tierLoading && !hasTier("p1") ? (
        <TierUpgradeState />
      ) : (
        <>
          <div className="space-y-4">
            <Tabs variant="pill" tabs={TABS} activeTab={view} onChange={setView} />

            {view === "users" && <MfaUsersTab users={users} isLoading={tierLoading || isLoading} error={error ? presentError(error) : undefined} onRowClick={(u) => setDrawerId(u.id)} />}
            {view === "posture" && <div className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg)">{<MfaPostureTab />}</div>}
            {view === "policy" && <MfaPolicyTab />}
          </div>

          <MfaUserDrawer userId={drawerId} onClose={() => setDrawerId(null)} />
        </>
      )}
    </div>
  );
}
