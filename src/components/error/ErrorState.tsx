"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/inputs/Button";
import { getErrorPresentation } from "@/src/lib/errors/getErrorPresentation";
import { reportError } from "@/src/lib/errors/reportError";

/**
 * Reusable error panel (Phase 11). Shows a friendly, errorCode-aware message,
 * the correlationId reference the user can quote to support, an optional
 * "Try again", and a "Report this issue" button that files a prefilled Zoho
 * ticket. Used by the route error boundaries and can be dropped into any page.
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
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    setReporting(true);
    try {
      await reportError({
        correlationId: presentation.correlationId,
        errorMessage: presentation.message,
        whatHappened,
      });
      setReported(true);
      toast.success("Issue reported", {
        description: "Our team will take a look. Thank you.",
      });
    } catch {
      toast.error("Couldn't submit the report", {
        description: "Please try again, or open a ticket from Settings → Support.",
      });
    } finally {
      setReporting(false);
    }
  };

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
          Reference ID:{" "}
          <span className="font-mono">{presentation.correlationId}</span>
        </p>
      )}

      <div className="mt-2 flex items-center gap-3">
        {presentation.retryable && onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        <Button
          variant="outline"
          onClick={handleReport}
          disabled={reporting || reported}
        >
          {reported
            ? "Reported"
            : reporting
              ? "Reporting…"
              : "Report this issue"}
        </Button>
      </div>
    </div>
  );
}
