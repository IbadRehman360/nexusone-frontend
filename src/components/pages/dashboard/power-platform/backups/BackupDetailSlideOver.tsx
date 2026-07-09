"use client";

import { useState } from "react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { Badge } from "@/src/components/ui/display/Badge";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Button } from "@/src/components/ui/inputs/Button";
import { useBackupDetail } from "@/src/hooks/data/useBackups";
import type { EnrichedBackup } from "@/src/types/powerPlatform";
import {
  Archive,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Table2,
  LayoutGrid,
  Paperclip,
  Zap,
  AppWindow,
  Package,
} from "lucide-react";

type DetailTab = "overview" | "whats-backed-up";

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "whats-backed-up" as const, label: "What's Backed Up" },
];

const STATUS_ICON: Record<string, React.ElementType> = {
  Succeeded: CheckCircle2,
  Failed: XCircle,
  Pending: Clock,
};

const STATUS_VARIANT: Record<string, "success" | "error" | "warning"> = {
  Succeeded: "success",
  Failed: "error",
  Pending: "warning",
};

function ProgressSteps({ status }: { status: string }) {
  const steps = ["Queued", "Preparing", "In Progress", "Finalizing", "Completed"];
  const stepStatus = (i: number): "done" | "active" | "pending" => {
    if (status === "Succeeded") return "done";
    if (status === "Failed") return i < 2 ? "done" : i === 2 ? "active" : "pending";
    return i === 0 ? "active" : "pending";
  };

  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const s = stepStatus(i);
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {s === "done" ? (
                <CheckCircle2 size={15} className="text-success-400" />
              ) : s === "active" ? (
                <Clock size={15} className="text-warning-400" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-border/50" />
              )}
              <span className={`text-[10px] font-medium whitespace-nowrap ${s === "pending" ? "text-muted-foreground/50" : "text-foreground/80"}`}>
                {status === "Failed" && i === 2 ? "Failed" : label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${s === "done" ? "bg-success-400/40" : "bg-border/40"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface BackupDetailSlideOverProps {
  backup: EnrichedBackup | null;
  environmentId: string;
  onClose: () => void;
  onRestore: (backup: EnrichedBackup) => void;
}

export function BackupDetailSlideOver({ backup, environmentId, onClose, onRestore }: BackupDetailSlideOverProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const { detail, isLoading } = useBackupDetail(backup?.bapBackupId ?? null, environmentId);

  const isScheduled = backup?.triggeredBy === "scheduler";
  const title = !backup
    ? undefined
    : backup.backupType !== "UserDefined"
      ? "System backup"
      : isScheduled
        ? "Scheduled backup"
        : "Manual backup";

  const status = backup?.bapStatus ?? "Pending";
  const StatusIcon = STATUS_ICON[status] ?? Clock;

  return (
    <SlideOver
      isOpen={!!backup}
      onClose={() => { setActiveTab("overview"); onClose(); }}
      title={title}
      subtitle="Power Platform backup"
      icon={<Archive size={16} className="text-info-400" />}
      width="md"
    >
      {!backup ? null : (
        <div className="flex flex-col h-full">
          <div className="px-5 pt-4 shrink-0">
            <Tabs<DetailTab> variant="pill" tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === "overview" ? (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  <StatBox
                    label="Status"
                    value={
                      <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>
                        <StatusIcon size={11} className="mr-1 -ml-0.5 inline" />
                        {status}
                      </Badge>
                    }
                  />
                  <StatBox label="Type" value={backup.backupType !== "UserDefined" ? "System" : isScheduled ? "Scheduled" : "Manual"} />
                  <StatBox label="Created At" value={new Date(backup.backupRequestDateTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} />
                </div>

                <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-4">Progress</p>
                  <ProgressSteps status={status} />
                </div>

                {detail && !isLoading && (
                  <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Retention</p>
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox label="Created" value={new Date(detail.createdAt).toLocaleString()} />
                      <StatBox label="Expires" value={new Date(detail.expiresAt).toLocaleString()} />
                    </div>
                  </div>
                )}

                <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-4 space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Details</p>
                  <StatBox label="Created By" value={isScheduled ? "Scheduler" : (backup.triggeredBy || "Microsoft")} />
                  {backup.notes && <StatBox label="Label" value={backup.notes} />}
                  {detail && !isLoading && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <StatBox label="Canvas Apps" value={detail.appsCount} />
                      <StatBox label="Cloud Flows" value={detail.flowsCount} />
                    </div>
                  )}
                  <StatBox label="Backup ID" value={<span className="font-mono text-[11px] break-all">{backup.bapBackupId}</span>} />
                </div>

                {status === "Succeeded" && (
                  <Button size="sm" leftIcon={<RotateCcw size={13} />} onClick={() => { onRestore(backup); onClose(); }} className="w-full justify-center">
                    Restore this backup
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Environment backups capture a full point-in-time snapshot of your Dataverse database including all tables, records,
                  relationships, business rules, canvas apps, cloud flows, and solution customizations.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <WhatsBackedUpCard icon={Table2} label="Dataverse Tables" value="All" note="Standard + custom tables" color="text-info-400 bg-info/10" />
                  <WhatsBackedUpCard icon={LayoutGrid} label="Records" value="All" note="Point-in-time snapshot" color="text-purple-400 bg-purple-400/10" />
                  <WhatsBackedUpCard icon={Paperclip} label="Attachments" value="Included" note="Files & notes" color="text-warning-400 bg-warning/10" />
                  <WhatsBackedUpCard icon={Zap} label="Cloud Flows" value={detail ? detail.flowsCount : "—"} note="Automated workflows" color="text-success-400 bg-success/10" />
                  <WhatsBackedUpCard icon={AppWindow} label="Canvas Apps" value={detail ? detail.appsCount : "—"} note="Model-driven apps included" color="text-pink-400 bg-pink-400/10" />
                  <WhatsBackedUpCard icon={Package} label="Solutions" value="All" note="Customizations & configurations" color="text-orange-400 bg-orange-400/10" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}

function WhatsBackedUpCard({ icon: Icon, label, value, note, color }: { icon: React.ElementType; label: string; value: React.ReactNode; note: string; color: string }) {
  return (
    <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-3.5 flex flex-col gap-2.5">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${color}`}>
        <Icon size={14} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
        <span className="text-[11px] font-medium text-foreground/70">{label}</span>
        <span className="text-[10px] text-muted-foreground/60">{note}</span>
      </div>
    </div>
  );
}
