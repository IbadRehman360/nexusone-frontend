"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { systemRestore } from "@/src/services/power-platform/backupsApi";

// Microsoft's default backup retention window for non-managed environments.
const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { value: `${String(hour24).padStart(2, "0")}:${minute}`, label: `${hour12}:${minute} ${period}` };
});

const pad = (n: number) => String(n).padStart(2, "0");
const toDateVal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

interface SystemBackupPanelProps {
  environmentId: string;
  environmentName: string;
  canManage: boolean;
  isAnyRestoring: boolean;
  onRestored: () => void;
}

export function SystemBackupPanel({ environmentId, environmentName, canManage, isAnyRestoring, onRestored }: SystemBackupPanelProps) {
  const now = new Date();
  const minDate = new Date(now.getTime() - RETENTION_DAYS * MS_PER_DAY);

  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const combined = selDate && selTime ? new Date(`${selDate}T${selTime}`) : null;
  const isValid = !!combined && !isNaN(combined.getTime()) && combined >= minDate && combined < now;

  const handleConfirm = async () => {
    if (!combined) return;
    setSubmitting(true);
    try {
      await systemRestore(environmentId, combined.toISOString(), environmentName);
      toast.success("System restore started", { description: `Restoring ${environmentName} to ${combined.toLocaleString()}. This can take a while.` });
      setConfirming(false);
      setSelDate("");
      setSelTime("");
      onRestored();
    } catch (err) {
      toast.error("Failed to start restore", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The retention period for this environment is <span className="font-medium text-foreground">{RETENTION_DAYS} days</span>.
        Select the point in time you&apos;d like to restore from to get started.
      </p>

      {canManage && environmentId ? (
        <div className="space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1.5 min-w-44">
              <label className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Select a date</label>
              <input
                type="date"
                value={selDate}
                onChange={(e) => setSelDate(e.target.value)}
                min={toDateVal(minDate)}
                max={toDateVal(now)}
                className={formInputClass()}
              />
            </div>
            <div className="space-y-1.5 min-w-44">
              <label className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Select a time</label>
              <Dropdown variant="plain" value={selTime} onChange={setSelTime} options={TIME_OPTIONS} placeholder="Select a time" />
            </div>
            <div className="space-y-1.5">
              <span aria-hidden className="block text-xs uppercase tracking-wide invisible">Action</span>
              <Button
                size="sm"
                onClick={() => setConfirming(true)}
                disabled={!isValid || isAnyRestoring}
                title={isAnyRestoring ? "A restore is already in progress" : undefined}
                rightIcon={<ArrowRight size={13} />}
              >
                Continue
              </Button>
            </div>
          </div>
          {selDate && selTime && !isValid && (
            <p className="text-[11px] text-error-400">Select a date and time within the last {RETENTION_DAYS} days.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 italic">Select an environment to restore from a system backup.</p>
      )}

      <Modal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title="Restore from System Backup"
        subtitle="Restoring overwrites this environment's current data."
        variant="warning"
        size="sm"
        loading={submitting}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} loading={submitting}>
              Restore
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Restore <span className="font-semibold">{environmentName}</span> to its state at{" "}
          <span className="font-semibold">{combined ? combined.toLocaleString() : ""}</span>?
        </p>
      </Modal>
    </div>
  );
}
