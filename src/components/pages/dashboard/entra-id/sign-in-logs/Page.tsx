"use client";

import { useMemo, useState } from "react";
import {
  LogIn,
  ShieldCheck,
  RefreshCw,
  Download,
  Monitor,
  Smartphone,
  Bot,
  KeyRound,
  Fingerprint,
} from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useSignInLogs } from "@/src/hooks/data/useSignInLogs";
import { downloadSignInLogs } from "@/src/services/entra-id/signInLogsApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { SignInDateRange, SignInExportFormat, SignInLogFilters, SignInLogRow, SignInStatus, SignInTab } from "@/src/types/signInLogs";

const RANGE_MS: Record<SignInDateRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const TABS: { id: SignInTab; label: string; icon: typeof Monitor }[] = [
  { id: "interactive", label: "Interactive", icon: Monitor },
  { id: "nonInteractive", label: "Non-interactive", icon: Smartphone },
  { id: "servicePrincipal", label: "Service Principal", icon: Bot },
  { id: "managedIdentity", label: "Managed Identity", icon: KeyRound },
];

const DATE_RANGE_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
  { value: "interrupted", label: "Interrupted" },
];

const STATUS_BADGE_VARIANT: Record<SignInStatus, BadgeVariant> = {
  success: "success",
  failure: "error",
  interrupted: "warning",
};

function startDateFor(range: SignInDateRange): string {
  return new Date(Date.now() - RANGE_MS[range]).toISOString();
}

function formatTimestamp(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
  const [tab, setTab] = useState<SignInTab>("interactive");
  const [dateRange, setDateRange] = useState<SignInDateRange>("24h");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<SignInLogRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const filters: SignInLogFilters = useMemo(() => {
    const f: SignInLogFilters = { signInType: tab };
    if (dateRange !== "24h") f.startDate = startDateFor(dateRange);
    if (status) f.status = status as SignInStatus;
    return f;
  }, [tab, dateRange, status]);

  const { rows, isLoading, isFetching, error, hasMore, isLoadingMore, loadMore, refetch } = useSignInLogs(filters);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (r.userDisplayName ?? "").toLowerCase().includes(q) ||
        (r.userPrincipalName ?? "").toLowerCase().includes(q) ||
        (r.appDisplayName ?? "").toLowerCase().includes(q) ||
        (r.ipAddress ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleExport = async (format: SignInExportFormat) => {
    setExporting(true);
    try {
      const blob = await downloadSignInLogs(filters, format);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sign-in-logs-${tab}-${stamp}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showApiError(err, { title: "Couldn't export sign-in logs" });
    } finally {
      setExporting(false);
    }
  };

  const columns: DtColumn<SignInLogRow>[] = [
    {
      key: "createdDateTime",
      header: "Date & Time",
      sortable: true,
      render: (_, row) => <span className="text-xs text-foreground whitespace-nowrap">{formatTimestamp(row.createdDateTime)}</span>,
    },
    {
      key: "userDisplayName",
      header: "User",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate leading-tight">{row.userDisplayName || "—"}</p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{row.userPrincipalName || "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: "appDisplayName",
      header: "Application",
      hideOnMobile: true,
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.appDisplayName || "—"}</span>,
    },
    {
      key: "ipAddress",
      header: "IP Address",
      hideOnMobile: true,
      render: (_, row) => <span className="text-xs font-mono text-muted-foreground">{row.ipAddress || "—"}</span>,
    },
    {
      key: "location",
      header: "Location",
      hideOnMobile: true,
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.location || "—"}</span>,
    },
    {
      key: "clientApp",
      header: "Client App",
      hideOnMobile: true,
      render: (_, row) => <span className="text-xs text-muted-foreground">{row.clientApp || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sign-in Logs"
        description="Monitor every sign-in across your tenant — interactive, non-interactive, service principal, and managed identity."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Sign-in Logs", icon: LogIn }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />} onClick={refetch}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => handleExport("csv")} disabled={exporting || rows.length === 0}>
              {exporting ? "Exporting…" : `Export CSV (${rows.length})`}
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <Tabs variant="pill" tabs={TABS} activeTab={tab} onChange={setTab} />

        <DataTableMainHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by user, app, or IP…"
          filters={
            <>
              <Dropdown options={DATE_RANGE_OPTIONS} value={dateRange} onChange={(v) => setDateRange(v as SignInDateRange)} variant="selected" />
              <Dropdown options={STATUS_OPTIONS} value={status} onChange={setStatus} variant="selected" />
            </>
          }
        >
          <DataTable<SignInLogRow>
            data={filteredRows}
            columns={columns}
            keyExtractor={(row) => row.id}
            className="border-0 rounded-none"
            pageSize={999}
            loading={isLoading}
            error={error ? presentError(error) : undefined}
            onRowClick={setSelectedRow}
            emptyState={{
              icon: LogIn,
              title: "No sign-in activity",
              description: "No sign-ins matched this tab, date range, and filters.",
            }}
          />

          {hasMore && (
            <div className="flex items-center justify-center py-3 border-t border-(--custom-table-border)">
              <Button variant="outline" size="sm" onClick={loadMore} loading={isLoadingMore}>
                Load more
              </Button>
            </div>
          )}
        </DataTableMainHeader>
      </div>

      <SlideOver isOpen={!!selectedRow} onClose={() => setSelectedRow(null)} title="Sign-in Details" subtitle={selectedRow?.userDisplayName ?? undefined} icon={<Fingerprint size={16} />}>
        {selectedRow && (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sign-in</p>
              <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                <DetailRow label="Date & time" value={formatTimestamp(selectedRow.createdDateTime)} />
                <DetailRow label="Status" value={<Badge variant={STATUS_BADGE_VARIANT[selectedRow.status]}>{selectedRow.status}</Badge>} />
                {selectedRow.errorCode !== 0 && <DetailRow label="Error code" value={selectedRow.errorCode} />}
                {selectedRow.failureReason && <DetailRow label="Failure reason" value={selectedRow.failureReason} />}
                <DetailRow label="Conditional access" value={selectedRow.conditionalAccessStatus ?? "—"} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identity</p>
              <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                <DetailRow label="Display name" value={selectedRow.userDisplayName ?? "—"} />
                <DetailRow label="User principal name" value={selectedRow.userPrincipalName ?? "—"} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Application</p>
              <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                <DetailRow label="Application" value={selectedRow.appDisplayName ?? "—"} />
                <DetailRow label="Resource" value={selectedRow.resourceDisplayName ?? "—"} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Network &amp; device</p>
              <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                <DetailRow label="IP address" value={<span className="font-mono">{selectedRow.ipAddress ?? "—"}</span>} />
                <DetailRow label="Location" value={selectedRow.location ?? "—"} />
                <DetailRow label="Client app" value={selectedRow.clientApp ?? "—"} />
                <DetailRow label="Browser" value={selectedRow.browser ?? "—"} />
                <DetailRow label="Operating system" value={selectedRow.operatingSystem ?? "—"} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identifiers</p>
              <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                <DetailRow label="Sign-in ID" value={<span className="font-mono text-[11px]">{selectedRow.id}</span>} />
                <DetailRow label="Correlation ID" value={<span className="font-mono text-[11px]">{selectedRow.correlationId}</span>} />
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
