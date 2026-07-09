"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useBackups } from "@/src/hooks/data/useBackups";
import { deleteBackup, deleteBackupSchedule, listBackupSchedules, syncBackupStatus } from "@/src/services/power-platform/backupsApi";
import { CreateBackupModal } from "./CreateBackupModal";
import { RestoreBackupModal } from "./RestoreBackupModal";
import { BackupScheduleSlideOver } from "./BackupScheduleSlideOver";
import { BackupDetailSlideOver } from "./BackupDetailSlideOver";
import { BackupInfoSlideOver } from "./BackupInfoSlideOver";
import { SystemBackupPanel } from "./SystemBackupPanel";
import { RestoreHistoryTable } from "./RestoreHistoryTable";
import { BackupStatsCards } from "./BackupStatsCards";
import { BACKUP_TABS, type BackupTabId } from "./backupTabs";
import { useBackupStats } from "@/src/hooks/data/useBackupStats";
import type { EnrichedBackup, BackupSchedule } from "@/src/types/powerPlatform";
import { Archive, Cloud, Plus, Calendar, RotateCcw, Trash2, Info, RefreshCw, Eye } from "lucide-react";

const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["succeeded", "ready", "completed"].includes(s)) return "success";
  if (["pending", "running", "inprogress"].includes(s)) return "warning";
  if (["failed", "error"].includes(s)) return "error";
  return "neutral";
}

const STATUS_DOT: Record<string, string> = {
  success: "bg-success-400",
  warning: "bg-warning-400",
  error: "bg-error-400",
  neutral: "bg-muted-foreground",
};

function StatusDotBadge({ status }: { status: string }) {
  const variant = statusVariant(status);
  return (
    <Badge variant={variant}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${STATUS_DOT[variant]}`} />
      {status}
    </Badge>
  );
}

function shortId(id: string): string {
  return id.split("-")[0] || id.slice(0, 8);
}

function expiresOn(createdIso: string): string {
  const d = new Date(createdIso);
  if (isNaN(d.getTime())) return "—";
  return new Date(d.getTime() + RETENTION_DAYS * MS_PER_DAY).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Page() {
  const { environments } = useEnvironments();
  const [environmentId, setEnvironmentId] = useState("");
  const activeEnvId = environmentId || environments[0]?.environmentId || "";
  const activeEnv = environments.find((e) => e.environmentId === activeEnvId);
  const activeEnvName = activeEnv?.environmentDisplayName ?? activeEnv?.displayName ?? activeEnv?.environmentName ?? "";
  const { backups, isLoading, error, refetch } = useBackups(activeEnvId);

  const [activeTab, setActiveTab] = useState<BackupTabId>("schedule");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<EnrichedBackup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedBackup | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailBackup, setDetailBackup] = useState<EnrichedBackup | null>(null);

  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleDeleting, setScheduleDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingRunId, setSyncingRunId] = useState<string | null>(null);

  const isRestoring = !!restoreTarget || backups.some((b) => b.bapStatus.toLowerCase() === "pending");
  const stats = useBackupStats(backups, schedule ? [schedule] : []);

  const handleSync = async (runId: string) => {
    setSyncingRunId(runId);
    try {
      await syncBackupStatus(runId);
      await refetch();
    } catch (err) {
      toast.error("Sync failed", { description: err instanceof Error ? err.message : "Could not sync backup status." });
    } finally {
      setSyncingRunId(null);
    }
  };

  const loadSchedule = () => {
    if (!activeEnvId) return;
    setScheduleLoading(true);
    listBackupSchedules(activeEnvId)
      .then((schedules) => setSchedule(schedules[0] ?? null))
      .catch(() => setSchedule(null))
      .finally(() => setScheduleLoading(false));
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEnvId]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBackup(deleteTarget, activeEnvId);
      toast.success("Backup deleted");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to delete backup", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;
    setScheduleDeleting(true);
    try {
      await deleteBackupSchedule(schedule.id);
      toast.success("Backup schedule removed");
      setSchedule(null);
    } catch (err) {
      toast.error("Failed to remove schedule", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setScheduleDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      loadSchedule();
    } finally {
      setRefreshing(false);
    }
  };

  const tabs = (
    <Tabs<BackupTabId>
      variant="pill"
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={BACKUP_TABS.map((t) => (t.id === "schedule" ? { ...t, count: backups.length } : t))}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backups & Restore"
        description="Manual and scheduled backups for the selected environment."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Backups & Restore", icon: Archive },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Info size={14} />} onClick={() => setShowInfo(true)}>
              Backup Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              disabled={refreshing || isRestoring}
              title={isRestoring ? "Unavailable during a restore" : undefined}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <BackupStatsCards stats={stats} isLoading={isLoading || scheduleLoading} hasEnvironment={!!activeEnvId} />

      <DataTableMainHeader
        tabs={tabs}
        headerRight={
          <div className="flex items-center gap-2">
            {activeTab === "schedule" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Calendar size={13} />}
                  onClick={() => setShowSchedule(true)}
                  disabled={!activeEnvId || isRestoring}
                  title={isRestoring ? "Unavailable during a restore" : undefined}
                >
                  {schedule ? "Update schedule" : "Set schedule"}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => setShowCreateModal(true)}
                  disabled={!activeEnvId || isRestoring}
                  title={isRestoring ? "Unavailable during a restore" : undefined}
                >
                  Create backup
                </Button>
              </>
            )}
            <Dropdown
              value={activeEnvId}
              onChange={setEnvironmentId}
              options={environments.map((env) => ({
                value: env.environmentId,
                label: env.environmentDisplayName ?? env.displayName ?? env.environmentName,
              }))}
            />
          </div>
        }
      >
        {activeTab === "schedule" && (
          <>
            {!scheduleLoading && schedule && (
              <div className="px-5 py-3.5 border-b border-(--custom-table-border) bg-(--custom-table-header-bg)/40">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                      <Calendar size={15} className="text-info-400" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-semibold text-foreground">
                        {schedule.cronExpression === "0 0 * * *" ? "Every day" : schedule.cronExpression === "0 0 * * 0" ? "Every week" : schedule.cronExpression === "0 0 1 * *" ? "Every month" : schedule.cronExpression}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Next run · {new Date(schedule.nextRunAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={handleDeleteSchedule} loading={scheduleDeleting} aria-label="Remove schedule">
                    <Trash2 size={13} className="text-error-400" />
                  </Button>
                </div>
              </div>
            )}

            <DataTable<EnrichedBackup>
              data={backups}
              keyExtractor={(backup) => backup.bapBackupId}
              loading={isLoading}
              error={error?.message}
              sortEnabled
              defaultSortField="backupRequestDateTime"
              defaultSortDir="desc"
              onRowClick={(backup) => setDetailBackup(backup)}
              columns={[
                {
                  key: "notes",
                  header: "Backup",
                  sortable: true,
                  render: (_, backup) => (
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate">{backup.notes || "Untitled backup"}</span>
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{shortId(backup.bapBackupId)}</span>
                    </div>
                  ),
                },
                {
                  key: "backupType",
                  header: "Type",
                  render: (_, backup) => (
                    <Badge variant={backup.triggeredBy === "scheduler" ? "info" : "neutral"}>
                      {backup.triggeredBy === "scheduler" ? "Scheduled" : "Manual"}
                    </Badge>
                  ),
                },
                {
                  key: "triggeredBy",
                  header: "Created By",
                  hideOnMobile: true,
                  render: (_, backup) => {
                    if (backup.triggeredBy === "scheduler") return <span className="text-xs text-foreground/75">Scheduler</span>;
                    return backup.triggeredBy ? (
                      <span className="text-xs text-foreground/75 truncate block">{backup.triggeredBy}</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/40 italic">Microsoft</span>
                    );
                  },
                },
                {
                  key: "backupRequestDateTime",
                  header: "Created",
                  sortable: true,
                  render: (_, backup) => (
                    <span className="text-xs text-foreground/70 tabular-nums">
                      {new Date(backup.backupRequestDateTime).toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "bapStatus",
                  header: "Status",
                  sortable: true,
                  render: (_, backup) => <StatusDotBadge status={backup.bapStatus} />,
                },
                {
                  key: "expiresOn",
                  header: "Expires on",
                  hideOnMobile: true,
                  render: (_, backup) => (
                    <span className="text-xs text-foreground/60 whitespace-nowrap">{expiresOn(backup.backupRequestDateTime)}</span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (_, backup) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDetailBackup(backup)} aria-label="View details">
                        <Eye size={13} />
                      </Button>
                      {backup.runId && backup.bapStatus.toLowerCase() === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleSync(backup.runId!)}
                          loading={syncingRunId === backup.runId}
                          disabled={isRestoring}
                          aria-label="Sync status"
                        >
                          <RefreshCw size={13} />
                        </Button>
                      )}
                      {backup.bapStatus.toLowerCase() === "succeeded" && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<RotateCcw size={12} />}
                          onClick={() => setRestoreTarget(backup)}
                          disabled={isRestoring}
                        >
                          Restore
                        </Button>
                      )}
                      <Button variant="danger-outline" size="icon-sm" onClick={() => setDeleteTarget(backup)} aria-label="Delete backup" disabled={isRestoring}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              emptyState={{
                icon: Archive,
                title: "No backups found",
                description: "Backups for this environment will appear here.",
                action: activeEnvId ? { label: "Create Backup", icon: <Plus size={14} />, onClick: () => setShowCreateModal(true) } : undefined,
              }}
            />
          </>
        )}

        {activeTab === "system" && (
          <SystemBackupPanel
            environmentId={activeEnvId}
            environmentName={activeEnvName}
            canManage
            isAnyRestoring={isRestoring}
            onRestored={() => setActiveTab("history")}
          />
        )}

        {activeTab === "history" && <RestoreHistoryTable environmentId={activeEnvId} />}
      </DataTableMainHeader>

      <CreateBackupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        environmentId={activeEnvId}
        environmentName={activeEnvName}
        onCreated={refetch}
      />

      <RestoreBackupModal
        backup={restoreTarget}
        environmentId={activeEnvId}
        environmentName={activeEnvName}
        onClose={() => setRestoreTarget(null)}
        onRestored={refetch}
      />

      <BackupScheduleSlideOver
        isOpen={showSchedule}
        onClose={() => { setShowSchedule(false); loadSchedule(); }}
        environmentId={activeEnvId}
        environmentName={activeEnvName}
      />

      <BackupDetailSlideOver
        backup={detailBackup}
        environmentId={activeEnvId}
        onClose={() => setDetailBackup(null)}
        onRestore={setRestoreTarget}
      />

      <BackupInfoSlideOver isOpen={showInfo} onClose={() => setShowInfo(false)} />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Backup"
        subtitle="This action cannot be undone."
        variant="danger"
        size="sm"
        loading={deleting}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} loading={deleting}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">Are you sure you want to delete this backup?</p>
      </Modal>
    </div>
  );
}
