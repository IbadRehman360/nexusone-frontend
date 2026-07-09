"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { restoreBackup } from "@/src/services/power-platform/backupsApi";
import type { EnrichedBackup } from "@/src/types/powerPlatform";

interface RestoreBackupModalProps {
  backup: EnrichedBackup | null;
  environmentId: string;
  environmentName: string;
  onClose: () => void;
  onRestored: () => void;
}

export function RestoreBackupModal({ backup, environmentId, environmentName, onClose, onRestored }: RestoreBackupModalProps) {
  const [targetName, setTargetName] = useState(environmentName);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (backup) setTargetName(environmentName);
  }, [backup, environmentName]);

  const handleConfirm = async () => {
    if (!backup || !targetName.trim()) return;
    setSubmitting(true);
    try {
      await restoreBackup(backup, environmentId, targetName.trim());
      toast.success("Restore started", { description: `Restoring to ${targetName}. This can take a while.` });
      onRestored();
      onClose();
    } catch (err) {
      toast.error("Failed to start restore", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!backup}
      onClose={onClose}
      title="Restore Backup"
      subtitle="Restoring overwrites the target environment's data."
      variant="warning"
      size="sm"
      loading={submitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!targetName.trim()} loading={submitting}>
            Restore
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-foreground">
          Restore the backup from <span className="font-semibold">{backup ? new Date(backup.backupRequestDateTime).toLocaleString() : ""}</span> into:
        </p>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Target environment name</label>
          <input type="text" value={targetName} onChange={(e) => setTargetName(e.target.value)} className={formInputClass()} />
        </div>
      </div>
    </Modal>
  );
}
