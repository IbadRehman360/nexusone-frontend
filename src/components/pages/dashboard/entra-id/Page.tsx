"use client";

import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import StatsCard from "@/src/components/ui/display/StatsCard";
import { useEntraUsers } from "@/src/hooks/data/useEntraUsers";
import { useGroups } from "@/src/hooks/data/useGroups";
import { useEnterpriseApps } from "@/src/hooks/data/useEnterpriseApps";
import { useConditionalAccess } from "@/src/hooks/data/useConditionalAccess";
import { UsersRound, Users, AppWindow, ShieldCheck } from "lucide-react";

export default function Page() {
  const { users, isLoading: usersLoading } = useEntraUsers();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { apps, isLoading: appsLoading } = useEnterpriseApps();
  const { policies, isLoading: caLoading } = useConditionalAccess();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entra ID"
        description="Identity, access, and governance across your tenant."
        breadcrumbs={[{ label: "Entra ID", icon: ShieldCheck }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Users" value={users.length} subtitle="Total" icon={UsersRound} color="blue" isLoading={usersLoading} href="/dashboard/entra-id/users" />
        <StatsCard title="Groups" value={groups.length} subtitle="Total" icon={Users} color="purple" isLoading={groupsLoading} href="/dashboard/entra-id/groups" />
        <StatsCard title="Enterprise Applications" value={apps.length} subtitle="Total" icon={AppWindow} color="green" isLoading={appsLoading} href="/dashboard/entra-id/enterprise-apps" />
        <StatsCard title="Conditional Access Policies" value={policies.length} subtitle="Total" icon={ShieldCheck} color="orange" isLoading={caLoading} href="/dashboard/entra-id/conditional-access" />
      </div>
    </div>
  );
}
