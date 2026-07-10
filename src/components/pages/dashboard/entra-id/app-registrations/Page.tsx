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
import { AppWindow, ShieldCheck, Layers, TriangleAlert, Clock, UserX, ArrowUpDown } from "lucide-react";
import { useAppRegistrations } from "@/src/hooks/data/useAppRegistrations";
import type { AppRegistrationListItem, HealthStatus } from "@/src/types/appRegistrations";
import { formatDate } from "@/src/lib/utils/dateFormat";
import { AppRegistrationDetailSlideOver } from "./AppRegistrationDetailSlideOver";

const CREDENTIAL_ALL = { value: "all", label: "All Credentials" };
const CREDENTIAL_OPTIONS = [
  CREDENTIAL_ALL,
  { value: "valid", label: "Valid" },
  { value: "expiring", label: "Expiring" },
  { value: "expired", label: "Expired" },
];

const AUDIENCE_ALL = { value: "all", label: "All Audiences" };
const AUDIENCE_OPTIONS = [
  AUDIENCE_ALL,
  { value: "single", label: "Single tenant" },
  { value: "multi", label: "Multi tenant" },
];

const OWNER_ALL = { value: "all", label: "All Owners" };
const OWNER_OPTIONS = [
  OWNER_ALL,
  { value: "has_owner", label: "Has owner" },
  { value: "no_owner", label: "No owner" },
];

const HEALTH_RANK: Record<HealthStatus, number> = { danger: 0, warning: 1, healthy: 2 };

function credentialStateOf(app: AppRegistrationListItem): "valid" | "expiring" | "expired" | "none" {
  if (app.secretCount === 0 && app.certCount === 0) return "none";
  if (app.chips.some((c) => c.key === "secret_expired" || c.key === "cert_expired")) return "expired";
  if (app.chips.some((c) => c.key === "secret_expiring" || c.key === "cert_expiring")) return "expiring";
  return "valid";
}

function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === "danger") return <Badge variant="error">Needs attention</Badge>;
  if (status === "warning") return <Badge variant="warning">Review soon</Badge>;
  return <Badge variant="success">Healthy</Badge>;
}

export default function Page() {
  const { apps, stats, isLoading } = useAppRegistrations();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [credentialFilter, setCredentialFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [riskFirst, setRiskFirst] = useState(false);

  const filteredApps = useMemo(() => {
    let rows = apps;

    if (credentialFilter !== "all") {
      rows = rows.filter((app) => credentialStateOf(app) === credentialFilter);
    }
    if (audienceFilter !== "all") {
      rows = rows.filter((app) => app.audience === audienceFilter);
    }
    if (ownerFilter === "has_owner") {
      rows = rows.filter((app) => (app.ownerCount ?? 0) > 0);
    } else if (ownerFilter === "no_owner") {
      rows = rows.filter((app) => app.ownerCount === 0);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter(
        (app) =>
          app.displayName.toLowerCase().includes(query) ||
          app.appId.toLowerCase().includes(query) ||
          (app.publisherDomain ?? "").toLowerCase().includes(query),
      );
    }

    if (riskFirst) {
      rows = [...rows].sort((a, b) => HEALTH_RANK[a.healthStatus] - HEALTH_RANK[b.healthStatus]);
    }

    return rows;
  }, [apps, credentialFilter, audienceFilter, ownerFilter, search, riskFirst]);

  const columns: DtColumn<AppRegistrationListItem>[] = [
    {
      key: "displayName",
      header: "Application",
      sortable: true,
      render: (_, app) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{app.displayName}</p>
          <p className="text-[11px] font-mono text-muted-foreground truncate max-w-64">{app.appId}</p>
        </div>
      ),
    },
    {
      key: "owners",
      header: "Owner(s)",
      render: (_, app) => (
        <span className="text-xs text-muted-foreground">
          {app.ownerCount === null ? "—" : app.owners.length > 0 ? app.owners.join(", ") : "None"}
        </span>
      ),
    },
    {
      key: "credentials",
      header: "Credentials",
      render: (_, app) => (
        <div>
          <p className="text-xs text-foreground/80">
            {app.secretCount === 0 && app.certCount === 0 ? "None" : `${app.secretCount} secret(s), ${app.certCount} cert(s)`}
          </p>
          {app.nearestExpiry && <p className="text-[11px] text-muted-foreground">Expires {formatDate(app.nearestExpiry)}</p>}
        </div>
      ),
    },
    {
      key: "apiPermissionCount",
      header: "API Permissions",
      align: "right",
      render: (_, app) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {app.apiPermissionCount}
          {app.hasHighRiskPermission && <span className="w-1.5 h-1.5 rounded-full bg-error-400" />}
        </span>
      ),
    },
    {
      key: "healthStatus",
      header: "Health",
      render: (_, app) => <HealthBadge status={app.healthStatus} />,
    },
    {
      key: "audience",
      header: "Audience",
      render: (_, app) => <Badge variant="neutral">{app.audience === "single" ? "Single tenant" : "Multi tenant"}</Badge>,
    },
    {
      key: "createdDateTime",
      header: "Created",
      sortable: true,
      render: (_, app) => <span className="text-xs text-muted-foreground">{formatDate(app.createdDateTime)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Registrations"
        description="Every app registration in your tenant — credential health, permissions, audience, and the security signals that need attention."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "App Registrations", icon: AppWindow },
        ]}
      />

      <StatsCarousel
        cards={[
          { title: "Total Registrations", value: stats?.total ?? 0, icon: Layers, color: "blue", isLoading },
          { title: "Expiring Soon", value: stats?.secretsExpiringSoon ?? 0, icon: Clock, color: "orange", isLoading },
          { title: "Expired Credentials", value: stats?.expiredCredentials ?? 0, icon: TriangleAlert, color: "red", isLoading },
          { title: "No Owner", value: stats?.noOwner ?? 0, icon: UserX, color: "neutral", isLoading },
        ]}
      />

      <DataTableMainHeader
        title={`App Registrations (${filteredApps.length})`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, app ID, or publisher…"
        filters={
          <>
            <Dropdown options={CREDENTIAL_OPTIONS} value={credentialFilter} onChange={setCredentialFilter} variant="selected" />
            <Dropdown options={AUDIENCE_OPTIONS} value={audienceFilter} onChange={setAudienceFilter} variant="selected" />
            <Dropdown options={OWNER_OPTIONS} value={ownerFilter} onChange={setOwnerFilter} variant="selected" />
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
        <DataTable<AppRegistrationListItem>
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
            icon: AppWindow,
            title: "No app registrations found",
            description: "App registrations will appear here once they exist in your Microsoft tenant.",
          }}
        />
      </DataTableMainHeader>

      <AppRegistrationDetailSlideOver appId={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}
