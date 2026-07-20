"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { useUsers } from "@/src/hooks/data/useUsers";
import { useBusinessUnits } from "@/src/hooks/data/useBusinessUnits";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_USERS } from "@/src/lib/sampleData/powerPlatform";
import { ManageUserModal } from "./ManageUserModal";
import { DelegateUserModal } from "./DelegateUserModal";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { PPUser } from "@/src/types/powerPlatform";
import { UserCircleGear } from "@phosphor-icons/react";
import { Cloud, Clock, Settings2 } from "lucide-react";

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { users: realUsers, isLoading, error, refetch } = useUsers(locked ? "" : environmentUrl);
  const users = locked ? SAMPLE_PP_USERS : realUsers;
  const { businessUnits } = useBusinessUnits(locked ? "" : environmentUrl);
  const { environments } = useEnvironments();
  const [manageUser, setManageUser] = useState<PPUser | null>(null);
  const [delegateUser, setDelegateUser] = useState<PPUser | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const toggleExpanded = (userId: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const environmentName = environments.find((e) => e.environmentUrl === environmentUrl)?.environmentDisplayName;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Users provisioned into the selected environment."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Users", icon: UserCircleGear },
        ]}
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Users (${users.length})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users…"
        headerRight={
          locked ? (
            <Dropdown
              value="sample-env-prod"
              onChange={() => {}}
              disabled
              options={[{ value: "sample-env-prod", label: "Contoso Production" }]}
            />
          ) : (
            <EnvironmentSelect value={environmentUrl} onChange={setEnvironmentUrl} />
          )
        }
      >
        <DataTable<PPUser>
          data={users}
          keyExtractor={(user) => user.userId}
          loading={!locked && isLoading}
          error={locked || !error ? undefined : presentError(error)}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          sortEnabled
          defaultSortField="fullName"
          defaultSortDir="asc"
          columns={[
            {
              key: "fullName",
              header: "User",
              sortable: true,
              render: (_, user) => (
                <div>
                  <p className="text-xs font-semibold text-foreground">{user.fullName}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              ),
            },
            {
              key: "enabled",
              header: "Status",
              render: (_, user) => (
                <span className={`text-xs font-medium ${user.enabled === false ? "text-error-400" : "text-success-400"}`}>
                  {user.enabled === false ? "Disabled" : "Enabled"}
                </span>
              ),
            },
            {
              key: "businessUnitName",
              header: "Business Unit",
              hideOnMobile: true,
              render: (_, user) => <span className="text-xs text-muted-foreground">{user.businessUnitName ?? "—"}</span>,
            },
            {
              key: "roles",
              header: "Roles",
              render: (_, user) => {
                const roles = user.roles ?? [];
                if (roles.length === 0) return <span className="text-xs text-muted-foreground">No roles</span>;
                const isExpanded = expandedRoles.has(user.userId);
                const visible = isExpanded ? roles : roles.slice(0, 2);
                const remaining = roles.length - visible.length;
                return (
                  <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                    {visible.map((r) => (
                      <span key={r.roleId} className="text-xs font-medium text-foreground/80">{r.roleName}</span>
                    ))}
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(user.userId)}
                        className="text-xs text-info-400 hover:underline"
                      >
                        +{remaining} more
                      </button>
                    )}
                    {isExpanded && roles.length > 2 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(user.userId)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        less
                      </button>
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, user) => (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Clock size={13} />} onClick={() => setDelegateUser(user)}>
                    Delegate
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Settings2 size={13} />} onClick={() => setManageUser(user)}>
                    Manage
                  </Button>
                </div>
              ),
            },
          ]}
          emptyState={{
            icon: UserCircleGear,
            title: "No users found",
            description: "Users for this environment will appear here.",
          }}
        />
      </DataTableMainHeader>

      <ManageUserModal
        user={manageUser}
        environmentUrl={environmentUrl}
        environmentName={environmentName}
        businessUnits={businessUnits}
        onClose={() => setManageUser(null)}
        onUpdated={refetch}
      />

      <DelegateUserModal
        delegator={delegateUser}
        environmentUrl={environmentUrl}
        users={users}
        onClose={() => setDelegateUser(null)}
        onCreated={refetch}
      />
    </div>
  );
}
