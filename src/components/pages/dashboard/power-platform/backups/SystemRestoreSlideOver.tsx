"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Button } from "@/src/components/ui/inputs/Button";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { systemRestore } from "@/src/services/power-platform/backupsApi";
import { useRestoreTargets } from "@/src/hooks/data/useRestoreTargets";

interface SystemRestoreSlideOverProps {
  isOpen: boolean;
  environmentId: string;
  environmentName: string;
  restorePointIso: string | null;
  onClose: () => void;
  onRestored: () => void;
}

export function SystemRestoreSlideOver({ isOpen, environmentId, environmentName, restorePointIso, onClose, onRestored }: SystemRestoreSlideOverProps) {
  const { options } = useRestoreTargets(environmentId);
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = options.find((o) => o.value === targetId);

  function handleClose() {
    onClose();
    setTargetId("");
  }

  const handleConfirm = async () => {
    if (!restorePointIso || !selected) return;
    setSubmitting(true);
    try {
      await systemRestore(environmentId, restorePointIso, selected.name);
      toast.success("System restore started", { description: `Restoring to ${selected.name}. This can take a while.` });
      onRestored();
      handleClose();
    } catch (err) {
      toast.error("Failed to start restore", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={handleClose}
      title="Restore environment"
      subtitle={environmentName}
      icon={<RotateCcw size={16} className="text-info-400" />}
      width="sm"
      footer={
        <div className="flex items-center gap-2">
          <Button size="sm" leftIcon={<RotateCcw size={13} />} onClick={handleConfirm} disabled={!targetId} loading={submitting}>
            Restore
          </Button>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning-700 dark:text-warning-400">
          <ShieldAlert size={14} className="shrink-0 mt-0.5" />
          <p>
            This replaces the target environment with a copy of <span className="font-semibold">{environmentName}</span> from the selected point in time. It can&apos;t be undone.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Restore point</p>
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox label="Target time" value={restorePointIso ? new Date(restorePointIso).toLocaleString() : "—"} />
            <StatBox label="Backup type" value="System" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            The environment is restored to the closest available recovery point at or before this time, within the 7-day window. Audit logs are not copied over, to keep the restore fast.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Target environment to overwrite</label>
          <Dropdown variant="plain" value={targetId} onChange={setTargetId} options={options} placeholder="Select an environment" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">Only environments eligible for restore are listed. Selecting the current environment restores it in place.</p>
        </div>
      </div>
    </SlideOver>
  );
}
