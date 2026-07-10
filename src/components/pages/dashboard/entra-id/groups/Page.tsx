"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { Users, ShieldCheck } from "lucide-react";
import { useGroups } from "@/src/hooks/data/useGroups";
import type { GroupListItem } from "@/src/types/groups";
import { GroupDetailSlideOver } from "./GroupDetailSlideOver";
import { formatDate } from "@/src/lib/utils/dateFormat";

const TYPE_ALL = { value: "all", label: "All Types" };
const TYPE_OPTIONS = [TYPE_ALL, { value: "security", label: "Security" }, { value: "microsoft365", label: "Microsoft 365" }];

function isM365Group(group: GroupListItem): boolean {
  return group.groupTypes?.includes("Unified") ?? false;
}

function groupKind(group: GroupListItem): string {
  if (isM365Group(group)) return "Microsoft 365";
  if (group.securityEnabled) return "Security";
  return "Distribution";
}


export default function Page() {
  const { groups, isLoading } = useGroups();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    let rows = groups;

    if (typeFilter === "security") {
      rows = rows.filter((g) => g.securityEnabled && !isM365Group(g));
    } else if (typeFilter === "microsoft365") {
      rows = rows.filter((g) => isM365Group(g));
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter((g) => g.displayName.toLowerCase().includes(query) || (g.mail ?? "").toLowerCase().includes(query));
    }

    return rows;
  }, [groups, typeFilter, search]);

  const columns: DtColumn<GroupListItem>[] = [
    {
      key: "displayName",
      header: "Group",
      sortable: true,
      render: (_, group) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{group.displayName}</p>
          <p className="text-[11px] text-muted-foreground">{groupKind(group)}</p>
        </div>
      ),
    },
    {
      key: "mail",
      header: "Email",
      hideOnMobile: true,
      render: (_, group) => <span className="text-xs text-muted-foreground">{group.mail ?? "—"}</span>,
    },
    {
      key: "membershipRule",
      header: "Membership",
      align: "center",
      hideOnMobile: true,
      render: (_, group) => <span className="text-xs text-muted-foreground">{group.membershipRule ? "Dynamic" : "Assigned"}</span>,
    },
    {
      key: "securityEnabled",
      header: "Security",
      align: "center",
      hideOnMobile: true,
      render: (_, group) => <span className="text-xs text-muted-foreground">{group.securityEnabled ? "Security" : "—"}</span>,
    },
    {
      key: "createdDateTime",
      header: "Created",
      sortable: true,
      hideOnMobile: true,
      render: (_, group) => <span className="text-xs text-muted-foreground">{formatDate(group.createdDateTime)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        description="Security groups and Microsoft 365 groups in your tenant, read directly from Microsoft Graph."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Groups", icon: Users },
        ]}
      />

      <DataTableMainHeader
        title={`Groups (${filteredGroups.length})`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search groups…"
        filters={<Dropdown options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} variant="selected" />}
      >
        <DataTable<GroupListItem>
          data={filteredGroups}
          columns={columns}
          keyExtractor={(group) => group.id}
          loading={isLoading}
          sortEnabled
          defaultSortField="displayName"
          defaultSortDir="asc"
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          onRowClick={(group) => setSelectedGroupId(group.id)}
          emptyState={{
            icon: Users,
            title: "No Entra ID groups found",
            description: "Groups will appear here once they exist in your Microsoft tenant.",
          }}
        />
      </DataTableMainHeader>

      <GroupDetailSlideOver groupId={selectedGroupId} onClose={() => setSelectedGroupId(null)} />
    </div>
  );
}
