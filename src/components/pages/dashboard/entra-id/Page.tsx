"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEntraUsers } from "@/src/hooks/data/useEntraUsers";
import { useGroups } from "@/src/hooks/data/useGroups";
import { useEnterpriseApps } from "@/src/hooks/data/useEnterpriseApps";
import { useConditionalAccess } from "@/src/hooks/data/useConditionalAccess";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { sampleEntraUsers, sampleGroups, sampleEnterpriseApps, sampleConditionalAccessPolicies } from "@/src/lib/sampleData/entraId";
import { UsersRound, Users, AppWindow, ShieldCheck } from "lucide-react";

export default function Page() {
  const { phase, locked, lockedTooltip } = useModulePhase("entra");
  const { users: realUsers, isLoading: usersLoading } = useEntraUsers();
  const { groups: realGroups, isLoading: groupsLoading } = useGroups();
  const { apps: realApps, isLoading: appsLoading } = useEnterpriseApps();
  const { policies: realPolicies, isLoading: caLoading } = useConditionalAccess();

  const users = locked ? sampleEntraUsers : realUsers;
  const groups = locked ? sampleGroups : realGroups;
  const apps = locked ? sampleEnterpriseApps : realApps;
  const policies = locked ? sampleConditionalAccessPolicies : realPolicies;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entra ID"
        description="Identity, access, and governance across your tenant."
        breadcrumbs={[{ label: "Entra ID", icon: ShieldCheck }]}
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      {phase === "trialing" && <ModuleConnectBanner module="entra" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Users" value={users.length} subtitle="Total" icon={UsersRound} color="blue" isLoading={!locked && usersLoading} href="/dashboard/entra-id/users" />
        <StatsCard title="Groups" value={groups.length} subtitle="Total" icon={Users} color="purple" isLoading={!locked && groupsLoading} href="/dashboard/entra-id/groups" />
        <StatsCard title="Enterprise Applications" value={apps.length} subtitle="Total" icon={AppWindow} color="green" isLoading={!locked && appsLoading} href="/dashboard/entra-id/enterprise-apps" />
        <StatsCard title="Conditional Access Policies" value={policies.length} subtitle="Total" icon={ShieldCheck} color="orange" isLoading={!locked && caLoading} href="/dashboard/entra-id/conditional-access" />
      </div>
    </div>
  );
}
