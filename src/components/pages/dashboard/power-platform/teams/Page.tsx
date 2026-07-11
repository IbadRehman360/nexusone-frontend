"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { useTeams } from "@/src/hooks/data/useTeams";
import { useBusinessUnits } from "@/src/hooks/data/useBusinessUnits";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_TEAMS } from "@/src/lib/sampleData/powerPlatform";
import { CreateTeamModal } from "./CreateTeamModal";
import { ManageTeamModal } from "./ManageTeamModal";
import type { Team } from "@/src/types/powerPlatform";
import { UsersThree } from "@phosphor-icons/react";
import { Cloud, Plus, Settings2 } from "lucide-react";

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { teams: realTeams, isLoading, error, refetch } = useTeams(locked ? undefined : environmentUrl);
  const teams = locked ? SAMPLE_PP_TEAMS : realTeams;
  const { businessUnits } = useBusinessUnits(locked ? "" : environmentUrl);
  const { environments } = useEnvironments();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manageTeam, setManageTeam] = useState<Team | null>(null);

  const environmentName = environments.find((e) => e.environmentUrl === environmentUrl)?.environmentDisplayName;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Teams and their business unit assignments."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Teams", icon: UsersThree },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)} disabled={!environmentUrl}>
            Create Team
          </Button>
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Teams (${teams.length})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search teams…"
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
        <DataTable<Team>
          data={teams}
          keyExtractor={(team) => team.teamId}
          loading={!locked && isLoading}
          error={locked ? undefined : error?.message}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          sortEnabled
          defaultSortField="name"
          defaultSortDir="asc"
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              render: (_, team) => <span className="text-xs font-semibold text-foreground">{team.name}</span>,
            },
            {
              key: "businessUnitName",
              header: "Business Unit",
              render: (_, team) => <span className="text-xs text-muted-foreground">{team.businessUnitName ?? "—"}</span>,
            },
            {
              key: "memberCount",
              header: "Members",
              align: "center",
              render: (_, team) => <span className="text-xs font-medium text-foreground/80">{team.memberCount ?? 0}</span>,
            },
            {
              key: "securityGroupName",
              header: "Security Group",
              hideOnMobile: true,
              render: (_, team) =>
                team.securityGroupName ? (
                  <div>
                    <p className="text-xs font-medium text-foreground">{team.securityGroupName}</p>
                    {team.azureAdObjectId && (
                      <p className="text-[10px] font-mono text-muted-foreground/70">{team.azureAdObjectId.slice(0, 8)}…</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, team) => (
                <Button variant="outline" size="sm" leftIcon={<Settings2 size={13} />} onClick={() => setManageTeam(team)}>
                  Manage
                </Button>
              ),
            },
          ]}
          emptyState={{
            icon: UsersThree,
            title: "No teams found",
            description: "Teams for this environment will appear here.",
            action: environmentUrl ? { label: "Create Team", icon: <Plus size={14} />, onClick: () => setShowCreateModal(true) } : undefined,
          }}
        />
      </DataTableMainHeader>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        environmentUrl={environmentUrl}
        environmentName={environmentName}
        businessUnits={businessUnits}
        onCreated={refetch}
      />

      <ManageTeamModal
        team={manageTeam}
        environmentUrl={environmentUrl}
        businessUnits={businessUnits}
        onClose={() => setManageTeam(null)}
        onUpdated={refetch}
      />
    </div>
  );
}
