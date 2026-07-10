"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { Plug, ShieldCheck, RefreshCw, AlertTriangle, CircleSlash, ShieldQuestion } from "lucide-react";
import { useIntegrationsHealth } from "@/src/hooks/data/usePurviewIntegrations";
import type { IntegrationService } from "@/src/types/purview";
import { StatusCell, ServiceAbbreviation } from "./integrationsShared";

export default function Page() {
  const { health, isLoading } = useIntegrationsHealth();
  const [search, setSearch] = useState("");

  const unhealthyCount = useMemo(
    () => health?.services.filter((s) => s.status === "unavailable" || s.status === "degraded").length ?? 0,
    [health],
  );

  const filteredServices = useMemo(() => {
    const services = health?.services ?? [];
    if (!search.trim()) return services;
    const query = search.trim().toLowerCase();
    return services.filter((s) => s.displayName.toLowerCase().includes(query) || s.type.toLowerCase().includes(query));
  }, [health, search]);

  const checkedAtLabel = health ? new Date(health.checkedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : null;

  const columns: DtColumn<IntegrationService>[] = [
    {
      key: "displayName",
      header: "Integration",
      render: (_, service) => (
        <div className="flex items-center gap-2.5">
          <ServiceAbbreviation name={service.name} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{service.displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate max-w-64">{service.detail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_, service) => <span className="text-xs text-muted-foreground">{service.type}</span>,
    },
    {
      key: "latencyMs",
      header: "Latency",
      align: "right",
      render: (_, service) => <span className="text-xs text-muted-foreground">{service.latencyMs != null ? `${service.latencyMs} ms` : "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (_, service) => <StatusCell status={service.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Health and connection status of Microsoft services connected to the Purview module."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Integrations", icon: Plug },
        ]}
      />

      <StatsCarousel
        cards={[
          {
            title: "Connected",
            value: health ? `${health.connectedCount} / ${health.totalCount}` : "—",
            icon: Plug,
            color: "blue",
            isLoading,
          },
          {
            title: "Avg Latency",
            value: health?.avgLatencyMs != null ? `${health.avgLatencyMs} ms` : "—",
            icon: ShieldQuestion,
            color: "purple",
            isLoading,
          },
          {
            title: "Not Configured",
            value: health ? health.notConfiguredCount : "—",
            icon: CircleSlash,
            color: "neutral",
            isLoading,
          },
          {
            title: "Unhealthy",
            value: unhealthyCount,
            icon: AlertTriangle,
            color: unhealthyCount > 0 ? "red" : "purple",
            isLoading,
          },
        ]}
      />

      <DataTableMainHeader
        title={health ? `Connected integrations · ${health.connectedCount} of ${health.totalCount} active` : "Connected integrations"}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search integrations…"
        headerRight={
          checkedAtLabel && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw size={11} />
              Checked {checkedAtLabel}
            </span>
          )
        }
      >
        <DataTable<IntegrationService>
          data={filteredServices}
          columns={columns}
          keyExtractor={(service) => service.name}
          loading={isLoading}
          emptyState={{
            icon: Plug,
            title: "No integrations found",
            description: "No Microsoft service integrations are configured for this tenant.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
