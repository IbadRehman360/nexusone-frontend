"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useResourceSummary } from "@/src/hooks/data/useResourceSummary";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import {
  SAMPLE_PP_ENVIRONMENTS,
  SAMPLE_PP_ENVIRONMENT_GROUPS,
  SAMPLE_PP_RESOURCE_SUMMARY,
  SAMPLE_PP_COMPLIANCE_OVERVIEW,
} from "@/src/lib/sampleData/powerPlatform";
import { Globe, LayoutGrid, Layers, ShieldCheck, Cloud } from "lucide-react";

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { environments: realEnvironments, isLoading: envLoading } = useEnvironments();
  const { groups: realGroups, isLoading: groupsLoading } = useEnvironmentGroups();
  const { summary: realSummary, isLoading: summaryLoading } = useResourceSummary();
  const { overview: realOverview, isLoading: complianceLoading } = useComplianceOverview();

  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const groups = locked ? SAMPLE_PP_ENVIRONMENT_GROUPS : realGroups;
  const summary = locked ? SAMPLE_PP_RESOURCE_SUMMARY : realSummary;
  const overview = locked ? SAMPLE_PP_COMPLIANCE_OVERVIEW : realOverview;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Power Platform"
        description="Environments, apps, and governance across your tenant."
        breadcrumbs={[{ label: "Power Platform", icon: Cloud }]}
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Environments" value={environments.length} subtitle="Total" icon={Globe} color="blue" isLoading={!locked && envLoading} href="/dashboard/power-platform/environments" />
        <StatsCard title="Environment Groups" value={groups.length} subtitle="Total" icon={Layers} color="purple" isLoading={!locked && groupsLoading} href="/dashboard/power-platform/environment-groups" />
        <StatsCard title="Apps & Flows" value={(summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0)} subtitle="Resources" icon={LayoutGrid} color="green" isLoading={!locked && summaryLoading} href="/dashboard/power-platform/resources" />
        <StatsCard title="Compliant Environments" value={overview?.summary.compliant ?? 0} subtitle="Of total checked" icon={ShieldCheck} color="green" isLoading={!locked && complianceLoading} href="/dashboard/power-platform/environmental-compliance" />
      </div>
    </div>
  );
}
