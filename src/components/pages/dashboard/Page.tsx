"use client";

import { Globe, Layers, LayoutGrid, ShieldCheck, ShieldAlert, UploadCloud, UsersRound, Users, AppWindow, Database } from "lucide-react";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { StatsCardProps } from "@/src/components/ui/display/StatsCard";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useResourceSummary } from "@/src/hooks/data/useResourceSummary";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { usePpDlpPolicies } from "@/src/hooks/data/usePpDlpPolicies";
import { useImportJobs } from "@/src/hooks/data/useImportJobs";
import { useEntraUsers } from "@/src/hooks/data/useEntraUsers";
import { useGroups } from "@/src/hooks/data/useGroups";
import { useEnterpriseApps } from "@/src/hooks/data/useEnterpriseApps";
import { useCatalogStats } from "@/src/hooks/data/usePurviewDataMap";
import { useDlpAlerts } from "@/src/hooks/data/usePurviewDlp";
import { useAuth } from "@/src/hooks/useAuth";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { SAMPLE_PP_OVERVIEW } from "@/src/components/module-connect/samplePowerPlatformData";
import { SAMPLE_ENTRA_OVERVIEW } from "@/src/components/module-connect/sampleEntraIdData";
import { SAMPLE_DLP_ALERTS } from "@/src/components/module-connect/samplePurviewData";
import { HomeHeader } from "./HomeHeader";

/** Appends a "sample data" marker to a card's subtitle when its module isn't
 * connected yet — same convention as the Purview Overview page's DLP cards. */
function withSampleMarker(subtitle: string, isSample: boolean): string {
  return isSample ? `${subtitle} — sample` : subtitle;
}

export default function Page() {
  const { user } = useAuth();
  const ownedModules = user?.subscription?.modules ?? [];

  const { connected: ppConnected } = useModuleConnection("pp");
  const { environments, isLoading: envLoading } = useEnvironments(undefined, ppConnected);
  const { groups, isLoading: groupsLoading } = useEnvironmentGroups(ppConnected);
  const { summary, isLoading: summaryLoading } = useResourceSummary(ppConnected);
  const { overview, isLoading: complianceLoading } = useComplianceOverview(ppConnected);
  const { policies, isLoading: policiesLoading } = usePpDlpPolicies(ppConnected);
  const { jobs, isLoading: jobsLoading } = useImportJobs(ppConnected);

  const { connected: entraConnected } = useModuleConnection("entra");
  const { users, isLoading: usersLoading } = useEntraUsers(entraConnected);
  const { groups: entraGroups, isLoading: entraGroupsLoading } = useGroups(entraConnected);
  const { apps, isLoading: appsLoading } = useEnterpriseApps(entraConnected);

  const { connected: purviewConnected } = useModuleConnection("purview");
  const { catalogStats, isLoading: catalogLoading } = useCatalogStats();
  const { alerts: liveDlpAlerts, isLoading: dlpLoading } = useDlpAlerts(purviewConnected);
  const dlpAlerts = purviewConnected ? liveDlpAlerts : SAMPLE_DLP_ALERTS;

  const cards: StatsCardProps[] = [];

  if (ownedModules.includes("pp")) {
    cards.push(
      {
        title: "Environments",
        value: ppConnected ? environments.length : SAMPLE_PP_OVERVIEW.environments,
        subtitle: withSampleMarker("Power Platform", !ppConnected),
        icon: Globe,
        color: "blue",
        isLoading: ppConnected && envLoading,
        href: "/dashboard/power-platform/environments",
      },
      {
        title: "Apps & Flows",
        value: ppConnected ? (summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0) : SAMPLE_PP_OVERVIEW.appsAndFlows,
        subtitle: withSampleMarker("Resources", !ppConnected),
        icon: LayoutGrid,
        color: "purple",
        isLoading: ppConnected && summaryLoading,
        href: "/dashboard/power-platform/resources",
      },
      {
        title: "Environment Groups",
        value: ppConnected ? groups.length : SAMPLE_PP_OVERVIEW.environmentGroups,
        subtitle: withSampleMarker("Power Platform", !ppConnected),
        icon: Layers,
        color: "orange",
        isLoading: ppConnected && groupsLoading,
        href: "/dashboard/power-platform/environment-groups",
      },
      {
        title: "Compliant Environments",
        value: ppConnected ? (overview?.summary.compliant ?? 0) : SAMPLE_PP_OVERVIEW.compliantEnvironments,
        subtitle: withSampleMarker("Of total checked", !ppConnected),
        icon: ShieldCheck,
        color: "green",
        isLoading: ppConnected && complianceLoading,
        href: "/dashboard/power-platform/environmental-compliance",
      },
      // DLP Policies and Import Jobs aren't part of the curated Overview
      // fixtures (they're deeper pages) — just 0 when not connected, no
      // curated fake numbers, matching every other non-Overview page.
      {
        title: "DLP Policies",
        value: policies.length,
        subtitle: "Power Platform",
        icon: ShieldAlert,
        color: "red",
        isLoading: ppConnected && policiesLoading,
        href: "/dashboard/power-platform/dlp-policies",
      },
      {
        title: "Import Jobs",
        value: jobs.length,
        subtitle: "Power Platform",
        icon: UploadCloud,
        color: "neutral",
        isLoading: ppConnected && jobsLoading,
        href: "/dashboard/power-platform/import",
      },
    );
  }

  if (ownedModules.includes("entra")) {
    cards.push(
      {
        title: "Users",
        value: entraConnected ? users.length : SAMPLE_ENTRA_OVERVIEW.users,
        subtitle: withSampleMarker("Entra ID", !entraConnected),
        icon: UsersRound,
        color: "blue",
        isLoading: entraConnected && usersLoading,
        href: "/dashboard/entra-id/users",
      },
      {
        title: "Groups",
        value: entraConnected ? entraGroups.length : SAMPLE_ENTRA_OVERVIEW.groups,
        subtitle: withSampleMarker("Entra ID", !entraConnected),
        icon: Users,
        color: "purple",
        isLoading: entraConnected && entraGroupsLoading,
        href: "/dashboard/entra-id/groups",
      },
      {
        title: "Enterprise Applications",
        value: entraConnected ? apps.length : SAMPLE_ENTRA_OVERVIEW.enterpriseApps,
        subtitle: withSampleMarker("Entra ID", !entraConnected),
        icon: AppWindow,
        color: "green",
        isLoading: entraConnected && appsLoading,
        href: "/dashboard/entra-id/enterprise-apps",
      },
    );
  }

  if (ownedModules.includes("purview")) {
    cards.push(
      {
        title: "Total Data Assets",
        value: catalogStats?.totalAssets ?? 0,
        subtitle: "Purview",
        icon: Database,
        color: "blue",
        isLoading: catalogLoading,
        href: "/dashboard/purview/catalog",
      },
      {
        title: "DLP Incidents (Active)",
        value: dlpAlerts.filter((a) => a.status !== "resolved").length,
        subtitle: withSampleMarker("Purview", !purviewConnected),
        icon: ShieldAlert,
        color: "red",
        isLoading: purviewConnected && dlpLoading,
        href: "/dashboard/purview/dlp",
      },
    );
  }

  return (
    <div className="space-y-4">
      <HomeHeader />
      <StatsCarousel cards={cards} />
    </div>
  );
}
