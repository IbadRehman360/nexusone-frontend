"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LifeBuoy } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Button } from "@/src/components/ui/inputs/Button";
import { CopyableId } from "@/src/components/ui/display/CopyableId";
import { reportError } from "@/src/lib/errors/reportError";

/**
 * The "Contact Support" dialog opened from {@link ErrorState}. Shows the
 * reference (correlation) id the user can quote — copyable via {@link CopyableId}
 * — and an optional "what were you doing?" note, then files a ticket through
 * {@link reportError} (POST /support/report-error). Only non-sensitive context
 * is sent; the tenant + user are inferred server-side.
 *
 * The endpoint per-tenant-dedups by error code: if support already has an open
 * ticket for this same error we attach a note instead of opening a new one, and
 * the dialog says so ("we're already aware") rather than pretending it's new.
 */
export function ContactSupportDialog({
  isOpen,
  onClose,
  correlationId,
  errorCode,
  errorMessage,
  defaultWhatHappened,
}: {
  isOpen: boolean;
  onClose: () => void;
  correlationId?: string;
  errorCode?: string;
  errorMessage?: string;
  defaultWhatHappened?: string;
}) {
  const [whatHappened, setWhatHappened] = useState(defaultWhatHappened ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await reportError({
        correlationId,
        errorCode,
        errorMessage,
        whatHappened: whatHappened.trim() || undefined,
      });
      if (result.deduped) {
        toast.success("We're already aware of this", {
          description: "Our team is already looking into it. Thanks for flagging it.",
        });
      } else {
        toast.success("Thanks — we've logged this", {
          description: `Your support ticket #${result.ticketNumber} has been created.`,
        });
      }
      onClose();
    } catch {
      toast.error("Couldn't reach support", {
        description: "Please try again, or open a ticket from Settings → Support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Support"
      subtitle="We'll pass this to our team with the details below."
      size="md"
      variant="info"
      icon={<LifeBuoy size={18} className="text-info-400" />}
      loading={submitting}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending…" : "Send to support"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {correlationId && (
          <div className="rounded-lg border border-(--custom-header-input-border) bg-(--custom-table-bg) px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
            <CopyableId value={correlationId} className="text-foreground" />
          </div>
        )}

        <FormField
          label="Briefly, what were you doing?"
          hint="Optional — this helps us reproduce the problem faster. Please don't include passwords or sensitive details."
        >
          <textarea
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="e.g. I was saving a DLP policy when the page errored."
            className={formInputClass()}
          />
        </FormField>
      </div>
    </Modal>
  );
}

export default ContactSupportDialog;
