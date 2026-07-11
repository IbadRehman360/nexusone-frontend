"use client";

import { createElement, useMemo } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { SectionCard } from "@/src/components/ui/display/SectionCard";
import {
  ShieldCheck,
  Database,
  Tag,
  Award,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Cloud,
} from "lucide-react";
import { Loader } from "@/src/components/ui/feedback/Loader";
import { useCatalogStats, useScanStatuses } from "@/src/hooks/data/usePurviewDataMap";
import { useDlpAlerts } from "@/src/hooks/data/usePurviewDlp";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { SAMPLE_DLP_ALERTS } from "@/src/lib/sampleData/purview";
import { useIntegrationsHealth } from "@/src/hooks/data/usePurviewIntegrations";
import { useCostSummary, useVCoreUsage } from "@/src/hooks/data/usePurviewCost";
import { formatCurrency, trendLabel, trendIcon, trendColor } from "./cost-billing/costFormat";
import { formatDateTime as formatShortDateTime } from "@/src/lib/utils/dateFormat";
import { StatusCell } from "./integrations/integrationsShared";
import { isSucceededStatus, scanStatusTextColor } from "@/src/lib/utils/scanStatus";
import { ScanTrendChart } from "./overview/ScanTrendChart";
import { DlpTrendChart } from "./overview/DlpTrendChart";
import { DlpOverviewPanel } from "./overview/DlpOverviewPanel";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";

export default function Page() {
  const { catalogStats, isLoading: catalogLoading } = useCatalogStats();
  const { history, isLoading: historyLoading } = useScanStatuses();
  const { locked: dlpLocked } = useModulePhase("purview");
  const { alerts: realDlpAlerts, isLoading: realDlpLoading } = useDlpAlerts();
  const dlpAlerts = dlpLocked ? SAMPLE_DLP_ALERTS : realDlpAlerts;
  const dlpLoading = dlpLocked ? false : realDlpLoading;
  const { health } = useIntegrationsHealth();
  const { summary } = useCostSummary();
  const { vCoreUsage } = useVCoreUsage();

  const isLoading = catalogLoading || historyLoading || dlpLoading;

  const stats = useMemo(() => {
    const classifiedPct = catalogStats && catalogStats.totalAssets > 0
      ? Math.round((catalogStats.classifiedAssets / catalogStats.totalAssets) * 100)
      : 0;

    const activeDlp = dlpAlerts.filter((a) => a.status !== "resolved").length;

    const succeeded = history.filter((s) => isSucceededStatus(s.status)).length;
    const successRate = history.length > 0 ? Math.round((succeeded / history.length) * 100) : null;

    const environments = new Set(history.map((s) => s.dataSourceName)).size;

    return { classifiedPct, activeDlp, successRate, environments };
  }, [catalogStats, dlpAlerts, history]);

  const recentActivity = useMemo(
    () => [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6),
    [history],
  );

  const healthRows = useMemo(() => {
    if (!catalogStats || catalogStats.totalAssets === 0) return [];
    const total = catalogStats.totalAssets;
    return [
      { label: "Classified", pct: Math.round((catalogStats.classifiedAssets / total) * 100), color: "bg-info-400" },
      { label: "Certified", pct: Math.round((catalogStats.certifiedAssets / total) * 100), color: "bg-info-400" },
      { label: "Owner assigned", pct: Math.round(((total - catalogStats.noOwnerAssets) / total) * 100), color: "bg-info-400" },
    ];
  }, [catalogStats]);

  const coverageRows = useMemo(() => {
    const latestBySource = new Map<string, (typeof history)[number]>();
    for (const row of history) {
      const current = latestBySource.get(row.dataSourceName);
      if (!current || row.timestamp > current.timestamp) latestBySource.set(row.dataSourceName, row);
    }
    return [...latestBySource.values()].sort((a, b) => b.assetsDiscovered - a.assetsDiscovered).slice(0, 6);
  }, [history]);
  const coverageMax = Math.max(1, ...coverageRows.map((r) => r.assetsDiscovered));

  const TrendIconEl = createElement(trendIcon(summary), { size: 11 });
  const trendColorClass = trendColor(summary);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purview"
        description="A single view of Microsoft Purview across data mapping, classification, DLP, governance, and cost."
        breadcrumbs={[{ label: "Purview", icon: ShieldCheck }]}
      />

      <ModuleConnectBanner module="purview" />

      <StatsCarousel
        cards={[
          {
            title: "Total Data Assets",
            value: catalogStats?.totalAssets ?? 0,
            subtitle: "registered in Purview",
            icon: Database,
            color: "blue",
            isLoading,
          },
          {
            title: "Classified",
            value: `${stats.classifiedPct}%`,
            subtitle: "of assets have classifications",
            icon: Tag,
            color: "green",
            isLoading,
          },
          {
            title: "Certified Assets",
            value: catalogStats?.certifiedAssets ?? 0,
            subtitle: "reviewed and endorsed",
            icon: Award,
            color: "purple",
            isLoading,
          },
          {
            title: "Orphaned Assets",
            value: catalogStats?.noOwnerAssets ?? 0,
            subtitle: "need an assigned owner",
            icon: AlertOctagon,
            color: "orange",
            isLoading,
          },
          {
            title: "DLP Incidents (Active)",
            value: stats.activeDlp,
            subtitle: "last 30 days",
            icon: ShieldAlert,
            color: "red",
            isLoading,
          },
          {
            title: "Scan Success Rate",
            value: stats.successRate != null ? `${stats.successRate}%` : "—",
            subtitle: "across all registered sources",
            icon: CheckCircle2,
            color: "blue",
            isLoading,
          },
          {
            title: "Environments in Scope",
            value: stats.environments,
            subtitle: "data sources scanned",
            icon: Cloud,
            color: "purple",
            isLoading,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Scan run history — 30 days"
          subtitle="Succeeded vs. failed scan runs per day"
          viewHref="/dashboard/purview/data-map"
          viewLabel="View data map"
        >
          <ScanTrendChart scanStatuses={history} />
        </SectionCard>

        <SectionCard
          title="DLP incidents — 30 day trend"
          subtitle="Purview DLP — policy matches by severity"
          viewHref="/dashboard/purview/dlp"
          viewLabel="View alerts"
        >
          <DlpTrendChart alerts={dlpAlerts} />
        </SectionCard>

        <SectionCard title="Recent Scan Activity" viewHref="/dashboard/purview/data-map">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground">No scan activity in the last 30 days.</p>
          ) : (
            <div className="divide-y divide-(--custom-table-border)">
              {recentActivity.map((row) => (
                <div key={`${row.dataSourceName}-${row.scanName}-${row.timestamp}`} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{row.dataSourceName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{row.scanName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-medium ${scanStatusTextColor(row.status)}`}>{row.status}</p>
                    <p className="text-[11px] text-muted-foreground">{formatShortDateTime(row.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Data Estate Health" viewHref="/dashboard/purview/catalog">
          {healthRows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No catalog data available yet.</p>
          ) : (
            <div className="space-y-3">
              {healthRows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                    <span className="text-[11px] font-medium text-foreground">{row.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Cost & Usage" viewHref="/dashboard/purview/cost-billing">
          {!summary ? (
            <Loader size="sm" text="Loading cost data…" className="py-4" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg) p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 font-medium">Month to Date</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(summary.currentMonthCost, summary.currency)}</p>
                <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${trendColorClass}`}>
                  {TrendIconEl}
                  {trendLabel(summary)}
                </p>
              </div>
              <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg) p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 font-medium">vCore-Hours</p>
                <p className="text-lg font-bold text-foreground mt-1">{vCoreUsage ? `${vCoreUsage.vCoreHours.toFixed(2)} h` : "—"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {vCoreUsage ? formatCurrency(vCoreUsage.cost, vCoreUsage.currency) : "Billed scan compute"}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Integrations Status" viewHref="/dashboard/purview/integrations">
          {!health || health.services.length === 0 ? (
            <p className="text-xs text-muted-foreground">No integration health data available yet.</p>
          ) : (
            <div className="divide-y divide-(--custom-table-border)">
              {health.services.map((service) => (
                <div key={service.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-xs text-foreground/80">{service.displayName}</span>
                  <StatusCell status={service.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Scan Coverage by Source" viewHref="/dashboard/purview/data-map">
          {coverageRows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No registered data sources have been scanned yet.</p>
          ) : (
            <div className="space-y-3">
              {coverageRows.map((row) => (
                <div key={row.dataSourceName}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-foreground/80 truncate max-w-48">{row.dataSourceName}</span>
                    <span className="text-[11px] text-muted-foreground">{row.assetsDiscovered.toLocaleString()} assets</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-info-400" style={{ width: `${(row.assetsDiscovered / coverageMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="DLP Analytics" viewHref="/dashboard/purview/dlp">
          <DlpOverviewPanel alerts={dlpAlerts} />
        </SectionCard>
      </div>
    </div>
  );
}
