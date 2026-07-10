"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useResourceSummary } from "@/src/hooks/data/useResourceSummary";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { Globe, LayoutGrid, Layers, ShieldCheck, Cloud } from "lucide-react";

export default function Page() {
  const { environments, isLoading: envLoading } = useEnvironments();
  const { groups, isLoading: groupsLoading } = useEnvironmentGroups();
  const { summary, isLoading: summaryLoading } = useResourceSummary();
  const { overview, isLoading: complianceLoading } = useComplianceOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Power Platform"
        description="Environments, apps, and governance across your tenant."
        breadcrumbs={[{ label: "Power Platform", icon: Cloud }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Environments" value={environments.length} subtitle="Total" icon={Globe} color="blue" isLoading={envLoading} href="/dashboard/power-platform/environments" />
        <StatsCard title="Environment Groups" value={groups.length} subtitle="Total" icon={Layers} color="purple" isLoading={groupsLoading} href="/dashboard/power-platform/environment-groups" />
        <StatsCard title="Apps & Flows" value={(summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0)} subtitle="Resources" icon={LayoutGrid} color="green" isLoading={summaryLoading} href="/dashboard/power-platform/resources" />
        <StatsCard title="Compliant Environments" value={overview?.summary.compliant ?? 0} subtitle="Of total checked" icon={ShieldCheck} color="green" isLoading={complianceLoading} href="/dashboard/power-platform/environmental-compliance" />
      </div>
    </div>
  );
}
