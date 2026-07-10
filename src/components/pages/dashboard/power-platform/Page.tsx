"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useResourceSummary } from "@/src/hooks/data/useResourceSummary";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { ModuleStatusTag } from "@/src/components/module-connect/ModuleStatusTag";
import { SAMPLE_PP_OVERVIEW } from "@/src/components/module-connect/samplePowerPlatformData";
import { Globe, LayoutGrid, Layers, ShieldCheck, Cloud } from "lucide-react";

export default function Page() {
  // Sample data covers BOTH states with no real access yet: trial-only
  // (never purchased, no consent possible) and paid-but-not-connected
  // (purchased, consent pending). The Connect banner only asks for consent
  // in the second case — never during a bare trial.
  const { connected } = useModuleConnection("pp");
  const { environments, isLoading: envLoading } = useEnvironments(undefined, connected);
  const { groups, isLoading: groupsLoading } = useEnvironmentGroups(connected);
  const { summary, isLoading: summaryLoading } = useResourceSummary(connected);
  const { overview, isLoading: complianceLoading } = useComplianceOverview(connected);

  const stats = connected
    ? {
        environments: environments.length,
        environmentGroups: groups.length,
        appsAndFlows: (summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0),
        compliantEnvironments: overview?.summary.compliant ?? 0,
      }
    : {
        environments: SAMPLE_PP_OVERVIEW.environments,
        environmentGroups: SAMPLE_PP_OVERVIEW.environmentGroups,
        appsAndFlows: SAMPLE_PP_OVERVIEW.appsAndFlows,
        compliantEnvironments: SAMPLE_PP_OVERVIEW.compliantEnvironments,
      };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Power Platform"
        description="Environments, apps, and governance across your tenant."
        breadcrumbs={[{ label: "Power Platform", icon: Cloud }]}
        titleBadge={<ModuleStatusTag module="pp" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Environments" value={stats.environments} subtitle="Total" icon={Globe} color="blue" isLoading={connected && envLoading} href="/dashboard/power-platform/environments" />
        <StatsCard title="Environment Groups" value={stats.environmentGroups} subtitle="Total" icon={Layers} color="purple" isLoading={connected && groupsLoading} href="/dashboard/power-platform/environment-groups" />
        <StatsCard title="Apps & Flows" value={stats.appsAndFlows} subtitle="Resources" icon={LayoutGrid} color="green" isLoading={connected && summaryLoading} href="/dashboard/power-platform/resources" />
        <StatsCard title="Compliant Environments" value={stats.compliantEnvironments} subtitle="Of total checked" icon={ShieldCheck} color="green" isLoading={connected && complianceLoading} href="/dashboard/power-platform/environmental-compliance" />
      </div>
    </div>
  );
}
