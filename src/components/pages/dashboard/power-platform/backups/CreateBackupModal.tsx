"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Archive } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { createBackup } from "@/src/services/power-platform/backupsApi";

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  environmentId: string;
  environmentName: string;
  onCreated: () => void;
}

export function CreateBackupModal({ isOpen, onClose, environmentId, environmentName, onCreated }: CreateBackupModalProps) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createBackup(environmentId, environmentName, notes.trim() || undefined);
      toast.success("Backup started", { description: `A manual backup of ${environmentName} is in progress.` });
      onCreated();
      handleClose();
    } catch (err) {
      toast.error("Failed to start backup", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Backup"
      subtitle={`A manual backup will be created for ${environmentName}.`}
      icon={<Archive size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Create Backup"
      submitting={submitting}
    >
      <FormField label="Notes" hint="Optional">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Pre-deployment snapshot"
          rows={3}
          className={formInputClass() + " resize-none"}
        />
      </FormField>
    </CreateModal>
  );
}
