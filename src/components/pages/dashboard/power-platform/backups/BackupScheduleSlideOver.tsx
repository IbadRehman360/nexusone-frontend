"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Calendar, Info, Trash2 } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Button } from "@/src/components/ui/inputs/Button";
import { listBackupSchedules, createBackupSchedule, deleteBackupSchedule } from "@/src/services/power-platform/backupsApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { BackupSchedule } from "@/src/types/powerPlatform";

const CADENCE_OPTIONS = [
  { value: "0 0 * * *", label: "Every day" },
  { value: "0 0 * * 0", label: "Every week" },
  { value: "0 0 1 * *", label: "Every month" },
];

interface BackupScheduleSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  environmentId: string;
  environmentName: string;
}

export function BackupScheduleSlideOver({ isOpen, onClose, environmentId, environmentName }: BackupScheduleSlideOverProps) {
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [cronExpression, setCronExpression] = useState(CADENCE_OPTIONS[0].value);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !environmentId) return;
    setLoading(true);
    listBackupSchedules(environmentId)
      .then((schedules) => {
        const existing = schedules[0] ?? null;
        setSchedule(existing);
        setCronExpression(existing?.cronExpression ?? CADENCE_OPTIONS[0].value);
      })
      .catch(() => setSchedule(null))
      .finally(() => setLoading(false));
  }, [isOpen, environmentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await createBackupSchedule(environmentId, environmentName, cronExpression);
      setSchedule(saved);
      toast.success("Backup schedule saved", { description: `${environmentName} will back up ${CADENCE_OPTIONS.find((o) => o.value === cronExpression)?.label.toLowerCase()}.` });
      onClose();
    } catch (err) {
      showApiError(err, { title: "Failed to save schedule" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;
    setDeleting(true);
    try {
      await deleteBackupSchedule(schedule.id);
      setSchedule(null);
      toast.success("Backup schedule removed");
      onClose();
    } catch (err) {
      showApiError(err, { title: "Failed to remove schedule" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Set backup schedule"
      subtitle={environmentName}
      icon={<Calendar size={16} className="text-info-400" />}
      width="sm"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" leftIcon={<Check size={13} />} onClick={handleSave} loading={saving}>
              Save schedule
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
          {schedule && (
            <Button variant="danger-outline" size="icon-sm" onClick={handleDelete} loading={deleting} aria-label="Delete schedule">
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      }
    >
      <div className="p-5 space-y-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading schedule…</p>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">How often should backups run?</p>
              <p className="text-xs text-muted-foreground mb-3">Choose a cadence that matches how fast this environment changes.</p>
              <div className="space-y-2">
                {CADENCE_OPTIONS.map((opt) => {
                  const active = cronExpression === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCronExpression(opt.value)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        active ? "border-info-400 bg-info/10 text-info-400" : "border-border/50 text-foreground hover:border-border"
                      }`}
                    >
                      {opt.label}
                      {active && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-info/10 border border-info/20">
              <Info size={14} className="text-info-400 shrink-0 mt-0.5" />
              <p className="text-xs text-info-400">
                Each scheduled backup is retained for 7 days by Microsoft, then removed automatically. Backups run at the start of the day for the chosen cadence.
              </p>
            </div>
          </>
        )}
      </div>
    </SlideOver>
  );
}
