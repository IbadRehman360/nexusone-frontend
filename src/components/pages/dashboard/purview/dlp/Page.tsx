"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { ShieldAlert, ShieldCheck, TriangleAlert, Users, ToggleLeft } from "lucide-react";
import { useDlpAlerts } from "@/src/hooks/data/usePurviewDlp";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { SAMPLE_DLP_ALERTS } from "@/src/lib/sampleData/purview";
import { formatDateTime } from "@/src/lib/utils/dateFormat";
import type { DlpAlert, DlpSeverity } from "@/src/types/purview";
import { SeverityCell, StatusPill, resolvePolicyName } from "./dlpShared";
import { DLP_SEVERITY_LABELS, REPEAT_OFFENDER_THRESHOLD } from "./dlpConstants";
import { DlpAlertDetailPanel } from "./DlpAlertDetailPanel";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";

const SEVERITY_ALL = { value: "all", label: "All Severities" };
const LOCATION_ALL = { value: "all", label: "All Locations" };
const MAX_POLICIES = 8;

interface PolicyRow {
  policy: string;
  triggers: number;
}

export default function Page() {
  const [selectedAlert, setSelectedAlert] = useState<DlpAlert | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const { locked, lockedTooltip } = useModulePhase("purview");
  const { alerts: realAlerts, isLoading: realLoading, error: realError } = useDlpAlerts();
  const alerts = locked ? SAMPLE_DLP_ALERTS : realAlerts;
  const isLoading = locked ? false : realLoading;
  const error = locked ? null : realError;

  const stats = useMemo(() => {
    const highSeverity = alerts.filter((a) => a.severity === "high").length;

    const countByUser = new Map<string, number>();
    for (const alert of alerts) {
      for (const user of alert.users) {
        countByUser.set(user, (countByUser.get(user) ?? 0) + 1);
      }
    }
    const repeatOffenders = [...countByUser.values()].filter((c) => c >= REPEAT_OFFENDER_THRESHOLD).length;

    const blocked = alerts.filter((a) => a.severity === "high" || a.severity === "medium").length;
    const auditOnly = alerts.filter((a) => a.severity === "low" || a.severity === "informational").length;

    return { highSeverity, repeatOffenders, blocked, auditOnly };
  }, [alerts]);

  const topPolicies = useMemo<PolicyRow[]>(() => {
    const counts = new Map<string, number>();
    for (const alert of alerts) {
      const name = resolvePolicyName(alert) !== "—" ? resolvePolicyName(alert) : alert.displayName;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_POLICIES)
      .map(([policy, triggers]) => ({ policy, triggers }));
  }, [alerts]);

  const severityOptions = useMemo(
    () => [SEVERITY_ALL, ...(Object.keys(DLP_SEVERITY_LABELS) as DlpSeverity[]).map((s) => ({ value: s, label: DLP_SEVERITY_LABELS[s] }))],
    [],
  );

  const locationOptions = useMemo(() => {
    const locations = new Set(alerts.map((a) => a.location).filter(Boolean));
    return [LOCATION_ALL, ...[...locations].sort().map((l) => ({ value: l, label: l }))];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    let rows = alerts;
    if (severityFilter !== "all") rows = rows.filter((a) => a.severity === severityFilter);
    if (locationFilter !== "all") rows = rows.filter((a) => a.location === locationFilter);
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter((a) => a.displayName.toLowerCase().includes(query) || a.users.some((u) => u.toLowerCase().includes(query)));
    }
    return rows;
  }, [alerts, severityFilter, locationFilter, search]);

  const policyColumns: DtColumn<PolicyRow>[] = [
    {
      key: "policy",
      header: "Policy",
      render: (_, row) => <span className="text-xs text-foreground/80 truncate max-w-md">{row.policy}</span>,
    },
    {
      key: "triggers",
      header: "Triggers",
      align: "right",
      render: (_, row) => <span className="text-xs font-semibold text-foreground tabular-nums">{row.triggers}</span>,
    },
  ];

  const alertColumns: DtColumn<DlpAlert>[] = [
    {
      key: "displayName",
      header: "Alert Name",
      sortable: true,
      render: (_, alert) => <span className="text-xs font-semibold text-foreground">{alert.displayName}</span>,
    },
    {
      key: "policy",
      header: "Policy",
      render: (_, alert) => <span className="px-2 py-0.5 rounded-md text-[11px] bg-info/10 text-info-400">{resolvePolicyName(alert)}</span>,
    },
    {
      key: "severity",
      header: "Severity",
      render: (_, alert) => <SeverityCell severity={alert.severity} />,
    },
    {
      key: "status",
      header: "Status",
      render: (_, alert) => <StatusPill status={alert.status} />,
    },
    {
      key: "detectedAt",
      header: "Time Detected",
      sortable: true,
      render: (_, alert) => <span className="text-xs text-muted-foreground">{formatDateTime(alert.detectedAt)}</span>,
    },
    {
      key: "users",
      header: "Users",
      render: (_, alert) => <span className="text-xs text-muted-foreground">{alert.users.length > 0 ? alert.users.join(", ") : "—"}</span>,
    },
    {
      key: "location",
      header: "Location",
      render: (_, alert) => <span className="text-xs text-muted-foreground">{alert.location}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="DLP"
        description="Data loss prevention alerts detected across your Microsoft 365 tenant."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "DLP", icon: ShieldAlert },
        ]}
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="purview" />

      <StatsCarousel
        cards={[
          {
            title: "DLP Incidents (30d)",
            value: alerts.length,
            icon: ShieldAlert,
            color: alerts.length > 0 ? "red" : "green",
            isLoading,
          },
          {
            title: "High Severity",
            value: stats.highSeverity,
            icon: TriangleAlert,
            color: stats.highSeverity > 0 ? "red" : "green",
            isLoading,
          },
          {
            title: "Repeat Offenders",
            value: stats.repeatOffenders,
            subtitle: `${REPEAT_OFFENDER_THRESHOLD}+ incidents`,
            icon: Users,
            color: "orange",
            isLoading,
          },
          {
            title: "Blocked vs Audit",
            value: `${stats.blocked} / ${stats.auditOnly}`,
            icon: ToggleLeft,
            color: "purple",
            isLoading,
          },
        ]}
      />

      <DataTableMainHeader title="Top triggered policies">
        <DataTable<PolicyRow>
          data={topPolicies}
          columns={policyColumns}
          keyExtractor={(row) => row.policy}
          loading={isLoading}
          loadingRows={4}
          sortEnabled
          defaultSortField="triggers"
          defaultSortDir="desc"
          emptyState={{
            title: "No DLP incidents",
            description: "No policy matches found in the last 30 days.",
          }}
          locked={locked}
          lockedTooltip={lockedTooltip}
        />
      </DataTableMainHeader>

      <div className="space-y-3">
        {error?.status === 403 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning-400">
            SecurityAlert.Read.All permission not granted — DLP alerts cannot be retrieved until this admin consent is granted.
          </div>
        )}

        <DataTableMainHeader
          title="DLP Alerts"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search alerts…"
          filters={
            <>
              <Dropdown options={severityOptions} value={severityFilter} onChange={setSeverityFilter} variant="selected" />
              <Dropdown options={locationOptions} value={locationFilter} onChange={setLocationFilter} variant="selected" />
            </>
          }
        >
          <DataTable<DlpAlert>
            data={filteredAlerts}
            columns={alertColumns}
            keyExtractor={(alert) => alert.id}
            loading={isLoading}
            sortEnabled
            defaultSortField="detectedAt"
            defaultSortDir="desc"
            pageSize={10}
            pageSizeOptions={[10, 25]}
            onRowClick={setSelectedAlert}
            emptyState={{
              icon: ShieldAlert,
              title: "No DLP alerts",
              description: "No data loss prevention incidents have been detected in the last 30 days.",
            }}
            locked={locked}
            lockedTooltip={lockedTooltip}
          />
        </DataTableMainHeader>
      </div>

      <DlpAlertDetailPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
}
