"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { LayoutGrid, ShieldCheck, AlertTriangle, Ban, ArrowUpDown } from "lucide-react";
import { useEnterpriseApps } from "@/src/hooks/data/useEnterpriseApps";
import type { EnterpriseAppListItem, HealthStatus } from "@/src/types/enterpriseApps";
import { formatDate } from "@/src/lib/utils/dateFormat";
import { EnterpriseAppDetailSlideOver } from "./EnterpriseAppDetailSlideOver";

const TYPE_ALL = { value: "all", label: "All Types" };
const TYPE_OPTIONS = [
  { value: "enterprise", label: "Enterprise" },
  TYPE_ALL,
  { value: "microsoft", label: "Microsoft" },
  { value: "managedIdentity", label: "Managed identity" },
];

const SSO_ALL = { value: "all", label: "All SSO Modes" };
const SSO_OPTIONS = [SSO_ALL, { value: "saml", label: "SAML" }, { value: "oidc", label: "OIDC" }, { value: "none", label: "None" }];

const STATUS_ALL = { value: "all", label: "All Statuses" };
const STATUS_OPTIONS = [STATUS_ALL, { value: "enabled", label: "Enabled" }, { value: "disabled", label: "Disabled" }];

const ASSIGNMENT_ALL = { value: "all", label: "All Assignments" };
const ASSIGNMENT_OPTIONS = [ASSIGNMENT_ALL, { value: "required", label: "Required" }, { value: "open", label: "Open" }];

const RISK_RANK: Record<HealthStatus, number> = { danger: 0, warning: 1, disabled: 2, healthy: 3 };

function formatLastSignIn(value: string | null): string {
  return value ? formatDate(value) : "Never";
}

function SsoBadge({ mode }: { mode: EnterpriseAppListItem["ssoMode"] }) {
  if (mode === "saml") return <Badge variant="info">SAML</Badge>;
  if (mode === "oidc") return <Badge variant="info">OIDC</Badge>;
  return <Badge variant="neutral">None</Badge>;
}

function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === "danger") return <Badge variant="error">Needs attention</Badge>;
  if (status === "warning") return <Badge variant="warning">Review soon</Badge>;
  if (status === "disabled") return <Badge variant="neutral">Disabled</Badge>;
  return <Badge variant="success">Healthy</Badge>;
}

export default function Page() {
  const { apps, stats, isLoading } = useEnterpriseApps();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("enterprise");
  const [ssoFilter, setSsoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [riskFirst, setRiskFirst] = useState(false);

  const filteredApps = useMemo(() => {
    let rows = apps;

    if (typeFilter !== "all") rows = rows.filter((app) => app.appType === typeFilter);
    if (ssoFilter !== "all") rows = rows.filter((app) => app.ssoMode === ssoFilter);
    if (statusFilter !== "all") rows = rows.filter((app) => (statusFilter === "enabled" ? app.accountEnabled : !app.accountEnabled));
    if (assignmentFilter !== "all") rows = rows.filter((app) => (assignmentFilter === "required" ? app.assignmentRequired : !app.assignmentRequired));

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter((app) => app.displayName.toLowerCase().includes(query) || (app.publisher ?? "").toLowerCase().includes(query));
    }

    if (riskFirst) {
      rows = [...rows].sort((a, b) => RISK_RANK[a.healthStatus] - RISK_RANK[b.healthStatus]);
    }

    return rows;
  }, [apps, typeFilter, ssoFilter, statusFilter, assignmentFilter, search, riskFirst]);

  const columns: DtColumn<EnterpriseAppListItem>[] = [
    {
      key: "displayName",
      header: "Application",
      sortable: true,
      render: (_, app) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{app.displayName}</p>
          <p className="text-[11px] text-muted-foreground">Created {formatDate(app.createdDateTime)}</p>
        </div>
      ),
    },
    {
      key: "publisher",
      header: "Publisher",
      render: (_, app) => <span className="text-xs text-muted-foreground">{app.publisher ?? "—"}</span>,
    },
    {
      key: "ssoMode",
      header: "SSO",
      render: (_, app) => <SsoBadge mode={app.ssoMode} />,
    },
    {
      key: "assignmentRequired",
      header: "Assignment",
      render: (_, app) => <Badge variant={app.assignmentRequired ? "info" : "neutral"}>{app.assignmentRequired ? "Required" : "Open"}</Badge>,
    },
    {
      key: "healthStatus",
      header: "Health",
      render: (_, app) => <HealthBadge status={app.healthStatus} />,
    },
    {
      key: "lastSignInDateTime",
      header: "Last Sign-in",
      sortable: true,
      render: (_, app) => <span className="text-xs text-muted-foreground">{formatLastSignIn(app.lastSignInDateTime)}</span>,
    },
    {
      key: "accountEnabled",
      header: "Status",
      render: (_, app) => <Badge variant={app.accountEnabled ? "success" : "error"}>{app.accountEnabled ? "Enabled" : "Disabled"}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Applications"
        description="Applications your users can sign into — SSO configuration, assignment, and permission health across your tenant."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Enterprise Applications", icon: LayoutGrid },
        ]}
      />

      <StatsCarousel
        cards={[
          { title: "Total Applications", value: stats?.total ?? 0, icon: LayoutGrid, color: "blue", isLoading },
          { title: "SSO Configured", value: stats?.ssoConfigured ?? 0, icon: ShieldCheck, color: "green", isLoading },
          { title: "Needs Attention", value: stats?.needsAttention ?? 0, icon: AlertTriangle, color: "orange", isLoading },
          { title: "Disabled", value: stats?.disabled ?? 0, icon: Ban, color: "neutral", isLoading },
        ]}
      />

      <DataTableMainHeader
        title={`Enterprise Applications (${filteredApps.length})`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or publisher…"
        filters={
          <>
            <Dropdown options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} variant="selected" />
            <Dropdown options={SSO_OPTIONS} value={ssoFilter} onChange={setSsoFilter} variant="selected" />
            <Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} variant="selected" />
            <Dropdown options={ASSIGNMENT_OPTIONS} value={assignmentFilter} onChange={setAssignmentFilter} variant="selected" />
            <Button
              variant={riskFirst ? "default" : "outline"}
              size="sm"
              leftIcon={<ArrowUpDown size={13} />}
              onClick={() => setRiskFirst((v) => !v)}
            >
              Risk first
            </Button>
          </>
        }
      >
        <DataTable<EnterpriseAppListItem>
          data={filteredApps}
          columns={columns}
          keyExtractor={(app) => app.id}
          loading={isLoading}
          sortEnabled
          defaultSortField="displayName"
          defaultSortDir="asc"
          pageSize={20}
          onRowClick={(app) => setDrawerId(app.id)}
          emptyState={{
            icon: LayoutGrid,
            title: "No enterprise applications found",
            description: "Enterprise applications will appear here once they exist in your Microsoft tenant.",
          }}
        />
      </DataTableMainHeader>

      <EnterpriseAppDetailSlideOver appId={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}
