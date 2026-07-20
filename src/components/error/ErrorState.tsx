"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/inputs/Button";
import { CopyableId } from "@/src/components/ui/display/CopyableId";
import { getErrorPresentation } from "@/src/lib/errors/getErrorPresentation";
import { ContactSupportDialog } from "@/src/components/error/ContactSupportDialog";

/**
 * Reusable error panel (Phase 11). Shows a friendly, errorCode-aware message,
 * the correlationId reference (copyable) the user can quote to support, an
 * optional "Try again", and a "Contact Support" button that opens a dialog to
 * file a prefilled, per-tenant-deduped Zoho ticket. Used by the route error
 * boundaries and can be dropped into any page.
 */
export function ErrorState({
  error,
  onRetry,
  whatHappened,
}: {
  error: unknown;
  onRetry?: () => void;
  whatHappened?: string;
}) {
  const presentation = getErrorPresentation(error);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        {presentation.title}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {presentation.message}
      </p>

      {presentation.correlationId && (
        <p className="text-xs text-muted-foreground">
          Reference ID: <CopyableId value={presentation.correlationId} />
        </p>
      )}

      <div className="mt-2 flex items-center gap-3">
        {presentation.retryable && onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        <Button variant="outline" onClick={() => setSupportOpen(true)}>
          Contact Support
        </Button>
      </div>

      <ContactSupportDialog
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        correlationId={presentation.correlationId}
        errorCode={presentation.errorCode}
        errorMessage={presentation.message}
        defaultWhatHappened={whatHappened}
      />
    </div>
  );
}
