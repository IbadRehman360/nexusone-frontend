"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Button } from "@/src/components/ui/inputs/Button";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { restoreBackup } from "@/src/services/power-platform/backupsApi";
import { useRestoreTargets } from "@/src/hooks/data/useRestoreTargets";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { EnrichedBackup } from "@/src/types/powerPlatform";

interface RestoreBackupSlideOverProps {
  backup: EnrichedBackup | null;
  environmentId: string;
  environmentName: string;
  onClose: () => void;
  onRestored: () => void;
}

export function RestoreBackupSlideOver({ backup, environmentId, environmentName, onClose, onRestored }: RestoreBackupSlideOverProps) {
  const { options } = useRestoreTargets(environmentId);
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = options.find((o) => o.value === targetId);

  function handleClose() {
    onClose();
    setTargetId("");
  }

  const handleConfirm = async () => {
    if (!backup || !selected) return;
    setSubmitting(true);
    try {
      await restoreBackup(backup, environmentId, selected.name);
      toast.success("Restore started", { description: `Restoring to ${selected.name}. This can take a while.` });
      onRestored();
      handleClose();
    } catch (err) {
      showApiError(err, { title: "Failed to start restore" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlideOver
      isOpen={!!backup}
      onClose={handleClose}
      title="Restore from backup"
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
      {backup && (
        <div className="p-5 space-y-5">
          <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning-700 dark:text-warning-400">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <p>This replaces the target environment with the contents of this backup. It can&apos;t be undone.</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Backup</p>
            <div className="grid grid-cols-2 gap-2.5">
              <StatBox label="Created" value={new Date(backup.backupRequestDateTime).toLocaleString()} />
              <StatBox label="Type" value={backup.backupType} />
              {backup.notes && <StatBox label="Label" value={backup.notes} />}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Target environment to overwrite</label>
            <Dropdown variant="plain" value={targetId} onChange={setTargetId} options={options} placeholder="Select an environment" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Only environments eligible for restore are listed. Selecting the current environment restores it in place.</p>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
