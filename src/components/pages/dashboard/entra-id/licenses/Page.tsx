"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Key,
  UserCheck,
  Package,
  UserX,
  AlertTriangle,
  Zap,
  FileDown,
  ShieldCheck,
  LayoutList,
  Activity,
  DollarSign,
  TrendingDown,
  UserCircle,
  Clock,
  UserPlus,
  UserMinus,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { CreateModal } from "@/src/components/ui/overlays/CreateModal";
import { SearchInput } from "@/src/components/ui/inputs/SearchInput";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useLicenses, useLicenseUsers, useLicenseUsage, useLicenseCosts, useAssignLicense, useRevokeLicense } from "@/src/hooks/data/useLicenses";
import { exportLicensePDF } from "@/src/lib/utils/licensePdfExport";
import { showApiError } from "@/src/lib/errors/showApiError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { PresentedError } from "@/src/lib/errors/getErrorPresentation";
import type { LicenseSummary, UserLicenseSummary } from "@/src/types/licenses";

const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function fmtCompact(n: number): string {
  const s = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  return n >= 1000 ? `${s}+` : s;
}

type TabKey = "usage" | "userCosts" | "savings" | "overview";

const TABS: { id: TabKey; label: string; icon: typeof Activity }[] = [
  { id: "usage", label: "User Activity", icon: Activity },
  { id: "userCosts", label: "User Costs", icon: DollarSign },
  { id: "savings", label: "Savings", icon: TrendingDown },
  { id: "overview", label: "License Overview", icon: LayoutList },
];

const TAB_SEARCH_PLACEHOLDERS: Record<TabKey, string> = {
  usage: "Search user…",
  userCosts: "Search user…",
  savings: "Search user…",
  overview: "Search by license name…",
};

function UsageBar({ consumed, total }: { consumed: number; total: number }) {
  const pct = total > 0 ? (consumed / total) * 100 : 0;
  const color = pct > 95 ? "bg-error-400" : pct > 80 ? "bg-warning-400" : "bg-success-400";

  return (
    <div className="flex items-center gap-2 min-w-32">
      <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(pct)}%</span>
    </div>
  );
}

function LastSeenBadge({ date }: { date: string | null }) {
  const days = daysSince(date);
  if (days === null) return <span className="text-xs text-muted-foreground/50">Never signed in</span>;

  const label = days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
  const color = days <= 7 ? "text-success-400" : days <= 30 ? "text-warning-400" : "text-error-400";

  return (
    <div className="flex items-center gap-1.5">
      <Clock size={11} className={color} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}

interface UserActivityRow {
  userId: string;
  displayName: string;
  userPrincipalName: string;
  lastSignInDateTime: string | null;
  assignedProducts: string[];
}

function LicenseOverviewTable({ licenses, loading, error, searchValue }: { licenses: LicenseSummary[]; loading: boolean; error?: string | PresentedError; searchValue?: string }) {
  const columns: DtColumn<LicenseSummary>[] = [
    {
      key: "name",
      header: "License",
      sortable: true,
      render: (_, license) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate leading-tight">{license.name}</p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{license.skuPartNumber}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      align: "center",
      render: (value) => <span className="text-xs font-medium text-foreground">{value as number}</span>,
    },
    {
      key: "consumed",
      header: "Assigned",
      sortable: true,
      align: "center",
      render: (value) => <span className="text-xs font-medium text-info-400">{value as number}</span>,
    },
    {
      key: "available",
      header: "Available",
      sortable: true,
      align: "center",
      render: (value) => <span className="text-xs font-medium text-success-400">{value as number}</span>,
    },
    {
      key: "skuId",
      header: "Usage",
      hideOnMobile: true,
      render: (_, license) => <UsageBar consumed={license.consumed} total={license.total} />,
    },
  ];

  return (
    <DataTable<LicenseSummary>
      data={licenses}
      columns={columns}
      keyExtractor={(license) => license.skuId}
      searchValue={searchValue}
      className="border-0 rounded-none"
      sortEnabled
      defaultSortField="name"
      defaultSortDir="asc"
      pageSize={10}
      pageSizeOptions={[10, 20, 50]}
      loading={loading}
      error={error}
      emptyState={{ icon: Key, title: "No licenses found", description: "No license subscriptions found in your tenant." }}
    />
  );
}

function LicenseUsageTable({
  usageData,
  loading,
  error,
  searchValue,
  onAssign,
  onRevoke,
}: {
  usageData: UserActivityRow[];
  loading: boolean;
  error?: string | PresentedError;
  searchValue?: string;
  onAssign: (row: UserActivityRow) => void;
  onRevoke: (row: UserActivityRow) => void;
}) {
  const columns: DtColumn<UserActivityRow>[] = [
    {
      key: "displayName",
      header: "User",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate leading-tight">{row.displayName}</p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{row.userPrincipalName}</p>
        </div>
      ),
    },
    {
      key: "lastSignInDateTime",
      header: "Last Active",
      sortable: true,
      render: (_, row) => <LastSeenBadge date={row.lastSignInDateTime} />,
    },
    {
      key: "assignedProducts",
      header: "Licenses",
      className: "max-w-90",
      render: (_, row) =>
        row.assignedProducts.length === 0 ? (
          <Badge variant="neutral">Unlicensed</Badge>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-w-90">
            {row.assignedProducts.map((p) => (
              <Badge key={p} variant="info">
                {p}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      key: "userId",
      header: "",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onAssign(row)} leftIcon={<UserPlus size={11} />}>
            Assign
          </Button>
          <Button size="sm" onClick={() => onRevoke(row)} disabled={row.assignedProducts.length === 0} leftIcon={<UserMinus size={11} />}>
            Revoke
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<UserActivityRow>
      data={usageData}
      columns={columns}
      keyExtractor={(row) => row.userId}
      searchValue={searchValue}
      className="border-0 rounded-none"
      sortEnabled
      defaultSortField="displayName"
      defaultSortDir="asc"
      pageSize={20}
      pageSizeOptions={[10, 20, 50]}
      loading={loading}
      error={error}
      emptyState={{
        icon: Activity,
        title: "No usage data yet",
        description: "Microsoft 365 usage reports can take up to 48 hours to populate after permissions are first granted. Check back later.",
      }}
    />
  );
}

function UserCostsTable({ users, licenses, searchValue }: { users: UserLicenseSummary[]; licenses: LicenseSummary[]; searchValue?: string }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("");

  const licenseFilterOptions = [{ value: "", label: "All Licenses" }, ...licenses.map((l) => ({ value: l.name, label: l.name }))];
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "licensed", label: "Licensed" },
    { value: "unlicensed", label: "Unlicensed" },
  ];

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        if (licenseFilter && !u.licenses.includes(licenseFilter)) return false;
        if (statusFilter === "licensed" && u.licenses.length === 0) return false;
        if (statusFilter === "unlicensed" && u.licenses.length > 0) return false;
        return true;
      }),
    [users, licenseFilter, statusFilter],
  );

  const columns: DtColumn<UserLicenseSummary>[] = [
    {
      key: "displayName",
      header: "User",
      sortable: true,
      render: (_, user) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate leading-tight">{user.displayName || "Unknown"}</p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{user.email}</p>
        </div>
      ),
    },
    {
      key: "licenses",
      header: "Licenses",
      render: (_, user) =>
        user.licenses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {user.licenses.map((name) => (
              <Badge key={name} variant="info">
                {name}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant="neutral">Unlicensed</Badge>
        ),
    },
    {
      key: "userId",
      header: "Count",
      align: "center",
      sortable: true,
      hideOnMobile: true,
      render: (_, user) => <span className="text-xs font-medium text-muted-foreground">{user.licenses.length}</span>,
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-(--custom-table-border) bg-(--custom-table-header-bg)">
        <Dropdown options={licenseFilterOptions} value={licenseFilter} onChange={setLicenseFilter} variant="selected" />
        <Dropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} variant="selected" />
      </div>
      <DataTable<UserLicenseSummary>
        data={filteredUsers}
        columns={columns}
        keyExtractor={(user) => user.userId}
        searchValue={searchValue}
        className="border-0 rounded-none"
        sortEnabled
        defaultSortField="displayName"
        defaultSortDir="asc"
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        emptyState={{ icon: UserCircle, title: "No users found", description: "No user license data available." }}
      />
    </>
  );
}

interface WasteItem {
  userId: string;
  displayName: string;
  userPrincipalName: string;
  monthlyCost: number;
  daysSinceLastSignIn: number | null;
}

const INACTIVITY_FILTER_OPTIONS = [
  { value: "", label: "Any inactivity" },
  { value: "30", label: "30+ days" },
  { value: "60", label: "60+ days" },
  { value: "90", label: "90+ days" },
];

function SavingsPanel({
  waste,
  searchValue,
  loading,
}: {
  waste: WasteItem[];
  searchValue?: string;
  loading?: boolean;
}) {
  const [inactivityFilter, setInactivityFilter] = useState("");

  const filteredWaste = useMemo(() => {
    const minDays = inactivityFilter ? Number(inactivityFilter) : 0;
    return waste.filter((item) => (item.daysSinceLastSignIn ?? Infinity) >= minDays);
  }, [waste, inactivityFilter]);

  const columns: DtColumn<WasteItem>[] = [
    {
      key: "displayName",
      header: "User",
      sortable: true,
      accessor: (item) => `${item.displayName} ${item.userPrincipalName}`,
      render: (_, item) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{item.displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.userPrincipalName}</p>
        </div>
      ),
    },
    {
      key: "daysSinceLastSignIn",
      header: "Inactive For",
      sortable: true,
      render: (_, item) => <span className="text-xs text-muted-foreground">{item.daysSinceLastSignIn != null ? `${item.daysSinceLastSignIn}d` : "Never signed in"}</span>,
    },
    {
      key: "monthlyCost",
      header: "Wasted Cost",
      align: "right",
      sortable: true,
      render: (_, item) => <span className="text-xs font-semibold text-error-400">{currencyFmt.format(item.monthlyCost)}/mo</span>,
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-(--custom-table-border) bg-(--custom-table-header-bg)">
        <Dropdown options={INACTIVITY_FILTER_OPTIONS} value={inactivityFilter} onChange={setInactivityFilter} variant="selected" />
      </div>
      <DataTable<WasteItem>
        data={filteredWaste}
        columns={columns}
        keyExtractor={(item) => item.userId}
        searchValue={searchValue}
        className="border-0 rounded-none"
        sortEnabled
        defaultSortField="monthlyCost"
        defaultSortDir="desc"
        pageSize={20}
        pageSizeOptions={[10, 20, 50]}
        loading={loading}
        emptyState={{ icon: DollarSign, title: "No waste detected", description: "All licensed users are active." }}
      />
    </>
  );
}

function AssignLicenseModal({ user, licenses, onClose }: { user: UserActivityRow; licenses: LicenseSummary[]; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const assign = useAssignLicense();

  const eligible = licenses.filter(
    (l) => !user.assignedProducts.includes(l.name) && l.available > 0 && l.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAssign = () => {
    if (!selectedSkuId) return;
    assign.mutate(
      { userId: user.userId, skuId: selectedSkuId },
      {
        onSuccess: () => {
          toast.success("License assigned", { description: `Assigned to ${user.displayName}.` });
          onClose();
        },
        onError: (err) => showApiError(err, { title: "Failed to assign license" }),
      },
    );
  };

  return (
    <CreateModal
      isOpen
      onClose={onClose}
      title="Assign License"
      subtitle={user.displayName}
      icon={<UserPlus size={16} className="text-info-400" />}
      onSubmit={handleAssign}
      submitLabel="Assign License"
      submitDisabled={!selectedSkuId}
      submitting={assign.isPending}
    >
      {user.assignedProducts.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Currently assigned</p>
          <div className="flex flex-wrap gap-1.5">
            {user.assignedProducts.map((p) => (
              <Badge key={p} variant="info">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Search licenses…" size="sm" className="w-full" />

      <div className="max-h-52 overflow-y-auto space-y-1">
        {eligible.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">{search ? "No licenses match your search" : "No available licenses to assign"}</p>
        ) : (
          eligible.map((license) => (
            <button
              key={license.skuId}
              type="button"
              onClick={() => setSelectedSkuId(license.skuId === selectedSkuId ? null : license.skuId)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors border ${
                selectedSkuId === license.skuId ? "bg-info/10 border-info/20" : "border-transparent hover:bg-muted/10"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{license.name}</p>
                <p className="text-xs text-muted-foreground">
                  {license.available} available of {license.total}
                </p>
              </div>
              {license.available === 0 && <AlertTriangle size={12} className="text-error-400 shrink-0" />}
              {selectedSkuId === license.skuId && <CheckCircle2 size={14} className="text-info-400 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </CreateModal>
  );
}

function RevokeLicenseModal({ user, licenses, onClose }: { user: UserActivityRow; licenses: LicenseSummary[]; onClose: () => void }) {
  const [confirmSkuId, setConfirmSkuId] = useState<string | null>(null);
  const revoke = useRevokeLicense();

  const assigned = licenses.filter((l) => user.assignedProducts.includes(l.name));

  const handleRevoke = (skuId: string, name: string) => {
    revoke.mutate(
      { userId: user.userId, skuId },
      {
        onSuccess: () => {
          toast.success("License revoked", { description: `${name} removed from ${user.displayName}.` });
          setConfirmSkuId(null);
          onClose();
        },
        onError: (err) => showApiError(err, { title: "Failed to revoke license" }),
      },
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Revoke License"
      subtitle={user.displayName}
      icon={<UserMinus size={16} className="text-error-400" />}
      variant="danger"
      footer={
        <Button variant="outline" size="sm" className="w-full" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-2">
        {assigned.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">This user has no assigned licenses</p>
        ) : (
          assigned.map((license) => {
            const isConfirming = confirmSkuId === license.skuId;
            return (
              <div
                key={license.skuId}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors border ${
                  isConfirming ? "bg-error/5 border-error/20" : "border-transparent hover:bg-muted/5"
                }`}
              >
                <p className="text-xs font-medium text-foreground truncate flex-1">{license.name}</p>
                {isConfirming ? (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs text-error-400">Revoke?</span>
                    <Button variant="danger-outline" size="sm" onClick={() => handleRevoke(license.skuId, license.name)} loading={revoke.isPending}>
                      Yes
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmSkuId(null)}>
                      No
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger-ghost" size="sm" className="shrink-0 ml-2" onClick={() => setConfirmSkuId(license.skuId)} leftIcon={<UserMinus size={10} />}>
                    Revoke
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

export default function Page() {
  const { licenses, isLoading: licensesLoading, error: licensesError } = useLicenses();
  const { users, isLoading: usersLoading } = useLicenseUsers();
  const { usage, isLoading: usageLoading, error: usageError } = useLicenseUsage();
  const { costs, isLoading: costsLoading } = useLicenseCosts();

  const [tab, setTab] = useState<TabKey>("usage");
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<UserActivityRow | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<UserActivityRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const isLoading = licensesLoading || usersLoading;

  const stats = useMemo(() => {
    const totalLicenses = licenses.reduce((sum, l) => sum + l.total, 0);
    const totalAssigned = licenses.reduce((sum, l) => sum + l.consumed, 0);
    const totalAvailable = licenses.reduce((sum, l) => sum + l.available, 0);
    const unlicensedUsers = users.filter((u) => u.licenses.length === 0).length;

    const inactive30 = usage.filter((u) => {
      const d = daysSince(u.lastSignInDateTime);
      return d !== null && d > 30;
    }).length;

    const activeThisWeek = usage.filter((u) => {
      const d = daysSince(u.lastSignInDateTime);
      return d !== null && d <= 7;
    }).length;

    const utilisationPct = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;

    return { totalLicenses, totalAssigned, totalAvailable, unlicensedUsers, inactive30, activeThisWeek, utilisationPct };
  }, [licenses, users, usage]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportLicensePDF(licenses, users, stats);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licenses"
        description="License data is fetched from your Entra ID tenant. Use the User Activity tab to assign or revoke licenses per user."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Licenses", icon: Key }]}
        action={
          <Button variant="outline" size="sm" leftIcon={<FileDown size={14} />} onClick={handleExportPDF} disabled={exporting || isLoading || licenses.length === 0}>
            {exporting ? "Generating…" : "Export PDF"}
          </Button>
        }
      />

      <StatsCarousel
        cards={[
          { title: "Total Licenses", value: fmtCompact(stats.totalLicenses), subtitle: "Across all SKUs", icon: Key, color: "blue", isLoading },
          { title: "Assigned", value: fmtCompact(stats.totalAssigned), subtitle: "Currently in use", icon: UserCheck, color: "purple", utilisation: stats.utilisationPct, isLoading },
          { title: "Available", value: fmtCompact(stats.totalAvailable), subtitle: "Ready to assign", icon: Package, color: "green", isLoading },
          { title: "Unlicensed Users", value: stats.unlicensedUsers, subtitle: "No license assigned", icon: UserX, color: "red", isLoading },
          { title: "Inactive 30+ Days", value: stats.inactive30, subtitle: "Potential waste", icon: AlertTriangle, color: "orange", isLoading: usageLoading },
          { title: "Active This Week", value: stats.activeThisWeek, subtitle: "Used in last 7 days", icon: Zap, color: "green", isLoading: usageLoading },
          { title: "Total Monthly Cost", value: currencyFmt.format(costs?.summary.totalMonthlySpend ?? 0), icon: DollarSign, color: "blue", isLoading: costsLoading },
          { title: "Wasted Cost", value: currencyFmt.format(costs?.summary.totalWastedMonthly ?? 0), icon: TrendingDown, color: "red", isLoading: costsLoading },
          { title: "Inactive Users (Waste)", value: costs?.waste.length ?? 0, icon: UserX, color: "orange", isLoading: costsLoading },
          { title: "Potential Savings", value: `${currencyFmt.format(costs?.summary.totalPotentialSavings ?? 0)}/mo`, icon: CheckCircle2, color: "green", isLoading: costsLoading },
        ]}
      />

      <div className="space-y-4">
        <Tabs
          variant="pill"
          tabs={TABS}
          activeTab={tab}
          onChange={(id) => {
            setTab(id);
            setSearch("");
          }}
        />

        <DataTableMainHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={TAB_SEARCH_PLACEHOLDERS[tab]}
        >
          {tab === "usage" && (
            <LicenseUsageTable
              usageData={usage}
              loading={usageLoading}
              error={usageError ? presentError(usageError) : undefined}
              searchValue={search}
              onAssign={setAssignTarget}
              onRevoke={setRevokeTarget}
            />
          )}

          {tab === "userCosts" && <UserCostsTable users={users} licenses={licenses} searchValue={search} />}

          {tab === "savings" && <SavingsPanel waste={costs?.waste ?? []} searchValue={search} loading={costsLoading} />}

          {tab === "overview" && <LicenseOverviewTable licenses={licenses} loading={licensesLoading} error={licensesError ? presentError(licensesError) : undefined} searchValue={search} />}
        </DataTableMainHeader>
      </div>

      {assignTarget && <AssignLicenseModal user={assignTarget} licenses={licenses} onClose={() => setAssignTarget(null)} />}
      {revokeTarget && <RevokeLicenseModal user={revokeTarget} licenses={licenses} onClose={() => setRevokeTarget(null)} />}
    </div>
  );
}
