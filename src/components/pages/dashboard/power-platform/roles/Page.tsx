"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { useRoles } from "@/src/hooks/data/useRoles";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_SECURITY_ROLES } from "@/src/lib/sampleData/powerPlatform";
import type { Role } from "@/src/types/powerPlatform";
import { ShieldCheck, Cloud } from "lucide-react";

interface BusinessUnitRef {
  id: string;
  name: string;
}

interface GroupedRole {
  roleId: string;
  roleName: string;
  businessUnits: BusinessUnitRef[];
}

function groupRolesByName(roles: Role[]): GroupedRole[] {
  const map = new Map<string, GroupedRole>();
  for (const role of roles) {
    const existing = map.get(role.roleName);
    const bu = role.businessUnitId && role.businessUnitName
      ? { id: role.businessUnitId, name: role.businessUnitName }
      : null;

    if (existing) {
      if (bu && !existing.businessUnits.some((u) => u.id === bu.id)) {
        existing.businessUnits.push(bu);
      }
    } else {
      map.set(role.roleName, { roleId: role.roleId, roleName: role.roleName, businessUnits: bu ? [bu] : [] });
    }
  }
  return Array.from(map.values());
}

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { roles: realRoles, isLoading, error } = useRoles(locked ? "" : environmentUrl);
  const roles = locked ? SAMPLE_PP_SECURITY_ROLES : realRoles;
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const groupedRoles = useMemo(() => groupRolesByName(roles), [roles]);

  const toggleExpanded = (roleId: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Roles"
        description="Security roles available in the selected environment."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Security Roles", icon: ShieldCheck },
        ]}
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Security Roles (${groupedRoles.length})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search roles…"
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
        <DataTable<GroupedRole>
          data={groupedRoles}
          keyExtractor={(role) => role.roleId}
          loading={!locked && isLoading}
          error={locked ? undefined : error?.message}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          sortEnabled
          defaultSortField="roleName"
          defaultSortDir="asc"
          columns={[
            {
              key: "roleName",
              header: "Role Name",
              sortable: true,
              render: (_, role) => <span className="text-xs font-semibold text-foreground">{role.roleName}</span>,
            },
            {
              key: "businessUnits",
              header: "Business Units",
              render: (_, role) => {
                if (role.businessUnits.length === 0) {
                  return <span className="text-xs text-muted-foreground">—</span>;
                }
                const isExpanded = expandedRoles.has(role.roleId);
                const visible = isExpanded ? role.businessUnits : role.businessUnits.slice(0, 2);
                const remaining = role.businessUnits.length - visible.length;
                return (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {visible.map((bu) => (
                      <span key={bu.id} className="text-xs font-medium text-foreground/80">{bu.name}</span>
                    ))}
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(role.roleId)}
                        className="text-xs text-info-400 hover:underline"
                      >
                        +{remaining} more
                      </button>
                    )}
                    {isExpanded && role.businessUnits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(role.roleId)}
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
              key: "buCount",
              header: "BUs",
              sortable: true,
              align: "center",
              accessor: (role) => role.businessUnits.length,
              render: (_, role) => <span className="text-xs font-medium text-foreground/80 tabular-nums">{role.businessUnits.length}</span>,
            },
          ]}
          emptyState={{
            icon: ShieldCheck,
            title: "No security roles found",
            description: "Roles for this environment will appear here.",
          }}
        />
      </DataTableMainHeader>
    </div>
  );
}
