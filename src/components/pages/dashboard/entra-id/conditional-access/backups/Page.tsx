"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { History, RotateCcw, Trash2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import { useCaBackups, useCaBackupMutations } from "@/src/hooks/data/useCaBackups";
import { showApiError } from "@/src/lib/errors/showApiError";
import { InlineError } from "@/src/components/error/InlineError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { CaPolicyRestoreStatus, CaRestoreSummary, CaSnapshotSummary } from "@/src/types/conditionalAccess";
import { formatDateTime as formatDate } from "@/src/lib/utils/dateFormat";

type PendingAction = { type: "restore" | "delete"; snapshot: CaSnapshotSummary } | null;

function SnapshotTable({
  snapshots,
  loading,
  busyId,
  onRestore,
  onDelete,
}: {
  snapshots: CaSnapshotSummary[];
  loading: boolean;
  busyId: string | null;
  onRestore: (snapshot: CaSnapshotSummary) => void;
  onDelete: (snapshot: CaSnapshotSummary) => void;
}) {
  const columns: DtColumn<CaSnapshotSummary>[] = [
    { key: "createdAt", header: "Taken", sortable: true, render: (_, s) => <span className="text-xs text-foreground">{formatDate(s.createdAt)}</span> },
    { key: "triggerType", header: "Source", render: (_, s) => <Badge variant={s.triggerType === "SCHEDULED" ? "info" : "neutral"}>{s.triggerType === "SCHEDULED" ? "Scheduled" : "Manual"}</Badge> },
    { key: "policyCount", header: "Policies", hideOnMobile: true, render: (_, s) => <span className="text-xs text-muted-foreground">{s.policyCount}</span> },
    { key: "createdBy", header: "By", hideOnMobile: true, render: (_, s) => <span className="text-xs text-muted-foreground">{s.createdBy}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (_, snapshot) => {
        const busy = busyId === snapshot.id;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" disabled={busy} leftIcon={<RotateCcw size={14} />} onClick={() => onRestore(snapshot)}>
              Restore
            </Button>
            <Button variant="danger-ghost" size="sm" disabled={busy} leftIcon={<Trash2 size={14} />} onClick={() => onDelete(snapshot)}>
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<CaSnapshotSummary>
      data={snapshots}
      columns={columns}
      keyExtractor={(s) => s.id}
      className="border-0 rounded-none"
      sortEnabled
      defaultSortField="createdAt"
      defaultSortDir="desc"
      loading={loading}
      pageSize={20}
      pageSizeOptions={[10, 20, 50]}
      emptyState={{ icon: History, title: "No snapshots yet", description: "Create a snapshot to capture the current Conditional Access policies." }}
    />
  );
}

const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "MANUAL", label: "Manual" },
];

const RESTORE_STATUS_VARIANT: Record<CaPolicyRestoreStatus, BadgeVariant> = { restored: "success", failed: "error", skipped: "neutral" };

function RestoreResultModal({ summary, onClose }: { summary: CaRestoreSummary | null; onClose: () => void }) {
  const hasFailures = summary !== null && summary.failed > 0;

  return (
    <Modal
      isOpen={summary !== null}
      onClose={onClose}
      title="Restore results"
      size="lg"
      variant={hasFailures ? "warning" : "success"}
      footer={
        <div className="flex justify-end">
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {summary && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {summary.restored} restored · {summary.failed} failed
            {summary.skipped > 0 ? ` · ${summary.skipped} skipped` : ""}
          </p>
          <div className="flex flex-col divide-y divide-(--custom-table-border) rounded-xl border border-(--custom-table-border)">
            {summary.results.map((result) => (
              <div key={result.policyId} className="flex items-start justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{result.displayName}</p>
                  {result.failureReason && <p className="text-xs text-error-400">{result.failureReason}</p>}
                  {result.recreatedAsPolicyId && <p className="text-xs text-muted-foreground">Recreated with a new policy ID</p>}
                </div>
                <Badge variant={RESTORE_STATUS_VARIANT[result.status]}>{result.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={danger ? "danger" : "warning"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "default"} size="sm" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}

export default function Page() {
  const { snapshots, isLoading, error } = useCaBackups();
  const { restore, remove } = useCaBackupMutations();

  const [pending, setPending] = useState<PendingAction>(null);
  const [restoreSummary, setRestoreSummary] = useState<CaRestoreSummary | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const mutating = restore.isPending || remove.isPending;
  const busyId = pending && mutating ? pending.snapshot.id : null;

  const filteredSnapshots = useMemo(() => {
    const query = search.trim().toLowerCase();
    return snapshots.filter((s) => {
      if (sourceFilter !== "all" && s.triggerType !== sourceFilter) return false;
      if (!query) return true;
      return s.createdBy.toLowerCase().includes(query) || formatDate(s.createdAt).toLowerCase().includes(query);
    });
  }, [snapshots, search, sourceFilter]);

  async function confirmAction() {
    if (!pending) return;
    const action = pending;
    try {
      if (action.type === "restore") {
        const summary = await restore.mutateAsync({ id: action.snapshot.id });
        setRestoreSummary(summary);
      } else {
        await remove.mutateAsync(action.snapshot.id);
        toast.success("Snapshot deleted", { description: "The snapshot was removed." });
      }
    } catch (err) {
      showApiError(err, { title: action.type === "restore" ? "Restore failed" : "Delete failed" });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backups & History"
        description="Point-in-time snapshots of your Conditional Access policies. Compare versions and restore a previous state."
        breadcrumbs={[
          { label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck },
          { label: "Backups & History" },
        ]}
      />

      {error ? (
        <InlineError error={presentError(error)} />
      ) : (
        <DataTableMainHeader
          title="Snapshots"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by user or date…"
          filters={
            <Dropdown
              variant="selected"
              value={sourceFilter}
              onChange={setSourceFilter}
              options={SOURCE_FILTER_OPTIONS}
            />
          }
        >
          <SnapshotTable
            snapshots={filteredSnapshots}
            loading={isLoading}
            busyId={busyId}
            onRestore={(snapshot) => setPending({ type: "restore", snapshot })}
            onDelete={(snapshot) => setPending({ type: "delete", snapshot })}
          />
        </DataTableMainHeader>
      )}

      <ConfirmDialog
        isOpen={pending !== null}
        title={pending?.type === "restore" ? "Restore snapshot?" : "Delete snapshot?"}
        message={
          pending?.type === "restore"
            ? "This overwrites current Conditional Access policies with the snapshot's state. Policies deleted since the snapshot are recreated with new IDs."
            : "This permanently removes the snapshot. It cannot be undone."
        }
        confirmLabel={pending?.type === "restore" ? "Restore" : "Delete"}
        danger={pending?.type === "delete"}
        loading={mutating}
        onConfirm={confirmAction}
        onClose={() => setPending(null)}
      />

      <RestoreResultModal summary={restoreSummary} onClose={() => setRestoreSummary(null)} />
    </div>
  );
}
