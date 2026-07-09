"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { LifeBuoy, Paperclip, X } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { createSupportTicket } from "@/src/services/support/supportApi";
import { useInvalidateSupport } from "@/src/hooks/data/useSupport";
import type { TicketPriority } from "@/src/services/support/supportApi";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const invalidate = useInvalidateSupport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setFiles([]);
    onClose();
  };

  const handleFilesSelected = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is over the 10MB limit.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await createSupportTicket({ subject: subject.trim(), description: description.trim(), priority, attachments: files });
      toast.success("Ticket submitted", { description: "Our team typically responds within one business day." });
      await invalidate();
      handleClose();
    } catch (err) {
      toast.error("Failed to submit ticket", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Ticket"
      subtitle="Submit a request to our support team."
      icon={<LifeBuoy size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Submit ticket"
      submitting={submitting}
    >
      <FormField label="Subject">
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" className={formInputClass()} />
      </FormField>
      <FormField label="Priority">
        <Dropdown variant="plain" value={priority} onChange={(v) => setPriority(v as TicketPriority)} options={PRIORITY_OPTIONS} />
      </FormField>
      <FormField label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what's happening, and any steps to reproduce…"
          rows={5}
          className={formInputClass() + " resize-none"}
        />
      </FormField>
      <FormField label="Attachments" hint="Up to 5 files, 10MB each">
        <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-(--custom-header-input-border) bg-(--custom-table-bg) text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Paperclip size={13} />
          Add files
        </button>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {files.map((f, i) => (
              <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/15 text-[11px] text-foreground">
                {f.name}
                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} aria-label={`Remove ${f.name}`}>
                  <X size={11} className="text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
        )}
      </FormField>
    </CreateModal>
  );
}
