"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { UsersRound, ShieldCheck, UserCheck, UserX, BadgeCheck } from "lucide-react";
import { useEntraUsers } from "@/src/hooks/data/useEntraUsers";
import { useModuleConnection } from "@/src/hooks/data/useModuleConnection";
import { useModuleEmptyState } from "@/src/hooks/data/useModuleEmptyState";
import type { EntraUser } from "@/src/types/entraUsers";
import { UserDetailSlideOver } from "./UserDetailSlideOver";
import { formatDate } from "@/src/lib/utils/dateFormat";

const STATUS_ALL = { value: "all", label: "All Statuses" };
const STATUS_OPTIONS = [STATUS_ALL, { value: "enabled", label: "Enabled" }, { value: "disabled", label: "Disabled" }];

export default function Page() {
  // Curated sample data + status tag live on the Entra ID Overview page
  // only — here, just stop firing the real (doomed) query when not
  // connected and show the generic "not connected" empty state instead.
  const { connected } = useModuleConnection("entra");
  const notConnectedState = useModuleEmptyState("entra");
  const { users, isLoading: liveLoading } = useEntraUsers(connected);
  const isLoading = connected && liveLoading;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const enabled = users.filter((u) => u.accountEnabled).length;
    const licensed = users.filter((u) => (u.assignedLicenses?.length ?? 0) > 0).length;
    return { total: users.length, enabled, disabled: users.length - enabled, licensed };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let rows = users;

    if (statusFilter !== "all") {
      rows = rows.filter((u) => (statusFilter === "enabled" ? u.accountEnabled : !u.accountEnabled));
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          u.displayName.toLowerCase().includes(query) ||
          u.userPrincipalName.toLowerCase().includes(query) ||
          (u.mail ?? "").toLowerCase().includes(query),
      );
    }

    return rows;
  }, [users, statusFilter, search]);

  const columns: DtColumn<EntraUser>[] = [
    {
      key: "displayName",
      header: "User",
      sortable: true,
      render: (_, user) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{user.displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.mail || user.userPrincipalName}</p>
        </div>
      ),
    },
    {
      key: "accountEnabled",
      header: "Status",
      render: (_, user) => <Badge variant={user.accountEnabled ? "success" : "error"}>{user.accountEnabled ? "Enabled" : "Disabled"}</Badge>,
    },
    {
      key: "jobTitle",
      header: "Job Title",
      hideOnMobile: true,
      render: (_, user) => <span className="text-xs text-muted-foreground">{user.jobTitle || "—"}</span>,
    },
    {
      key: "department",
      header: "Department",
      hideOnMobile: true,
      render: (_, user) => <span className="text-xs text-muted-foreground">{user.department || "—"}</span>,
    },
    {
      key: "createdDateTime",
      header: "Created",
      sortable: true,
      hideOnMobile: true,
      render: (_, user) => <span className="text-xs text-muted-foreground">{formatDate(user.createdDateTime)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Every user account in your tenant, read directly from Microsoft Graph."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Users", icon: UsersRound },
        ]}
      />

      <StatsCarousel
        cards={[
          { title: "Total Users", value: stats.total, icon: UsersRound, color: "blue", isLoading },
          { title: "Enabled", value: stats.enabled, icon: UserCheck, color: "green", isLoading },
          { title: "Disabled", value: stats.disabled, icon: UserX, color: "neutral", isLoading },
          { title: "Licensed", value: stats.licensed, icon: BadgeCheck, color: "purple", isLoading },
        ]}
      />

      <DataTableMainHeader
        title={`Users (${filteredUsers.length})`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or UPN…"
        filters={<Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} variant="selected" />}
      >
        <DataTable<EntraUser>
          data={filteredUsers}
          columns={columns}
          keyExtractor={(user) => user.id}
          loading={isLoading}
          sortEnabled
          defaultSortField="displayName"
          defaultSortDir="asc"
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          onRowClick={(user) => setSelectedUserId(user.id)}
          emptyState={
            notConnectedState ?? {
              icon: UsersRound,
              title: "No users found",
              description: "Users will appear here once they exist in your Microsoft tenant.",
            }
          }
        />
      </DataTableMainHeader>

      <UserDetailSlideOver userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}
