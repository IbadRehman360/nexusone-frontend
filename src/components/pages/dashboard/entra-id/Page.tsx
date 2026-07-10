"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEntraUsers } from "@/src/hooks/data/useEntraUsers";
import { useGroups } from "@/src/hooks/data/useGroups";
import { useEnterpriseApps } from "@/src/hooks/data/useEnterpriseApps";
import { useConditionalAccess } from "@/src/hooks/data/useConditionalAccess";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { ModuleStatusTag } from "@/src/components/module-connect/ModuleStatusTag";
import { SAMPLE_ENTRA_OVERVIEW } from "@/src/components/module-connect/sampleEntraIdData";
import { UsersRound, Users, AppWindow, ShieldCheck } from "lucide-react";

export default function Page() {
  // Sample data whenever there's no real access yet — trial-only or
  // paid-but-not-connected both qualify. See useModuleConnection.
  const { connected } = useModuleConnection("entra");
  const { users, isLoading: usersLoading } = useEntraUsers(connected);
  const { groups, isLoading: groupsLoading } = useGroups(connected);
  const { apps, isLoading: appsLoading } = useEnterpriseApps(connected);
  const { policies, isLoading: caLoading } = useConditionalAccess(connected);

  const stats = connected
    ? {
        users: users.length,
        groups: groups.length,
        enterpriseApps: apps.length,
        conditionalAccessPolicies: policies.length,
      }
    : SAMPLE_ENTRA_OVERVIEW;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entra ID"
        description="Identity, access, and governance across your tenant."
        breadcrumbs={[{ label: "Entra ID", icon: ShieldCheck }]}
        titleBadge={<ModuleStatusTag module="entra" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Users" value={stats.users} subtitle="Total" icon={UsersRound} color="blue" isLoading={connected && usersLoading} href="/dashboard/entra-id/users" />
        <StatsCard title="Groups" value={stats.groups} subtitle="Total" icon={Users} color="purple" isLoading={connected && groupsLoading} href="/dashboard/entra-id/groups" />
        <StatsCard title="Enterprise Applications" value={stats.enterpriseApps} subtitle="Total" icon={AppWindow} color="green" isLoading={connected && appsLoading} href="/dashboard/entra-id/enterprise-apps" />
        <StatsCard title="Conditional Access Policies" value={stats.conditionalAccessPolicies} subtitle="Total" icon={ShieldCheck} color="orange" isLoading={connected && caLoading} href="/dashboard/entra-id/conditional-access" />
      </div>
    </div>
  );
}
