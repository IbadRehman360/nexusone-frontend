"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/inputs/Button";
import { CopyableId } from "@/src/components/ui/display/CopyableId";
import type { PresentedError } from "@/src/lib/errors/getErrorPresentation";

/**
 * The shared friendly error card for in-place surfaces (a failed table load, a
 * failed tab/panel fetch). Shows an icon, the friendly leak-safe message, and —
 * whenever it's available — the reference id the user quotes to support, plus an
 * optional "Try again".
 *
 * Feed it the presented form (`presentError(error)` from lib/errors) so the
 * reference id survives; a plain string still works (message only, no id). The
 * DataTable error state renders this, and any bespoke inline error spot should
 * use it too instead of hand-rolling `<p className="text-error-400">`.
 */
export function InlineError({
  error,
  onRetry,
  className,
}: {
  error: string | PresentedError;
  onRetry?: () => void;
  className?: string;
}) {
  const message = typeof error === "string" ? error : error.message;
  const referenceId = typeof error === "string" ? undefined : error.referenceId;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-error-400/20 bg-error/10">
        <AlertTriangle size={18} className="text-error-400" />
      </div>
      <p className="max-w-sm text-sm font-medium leading-relaxed text-foreground">
        {message}
      </p>
      {referenceId && (
        <p className="text-xs text-muted-foreground">
          Reference ID: <CopyableId value={referenceId} />
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-1" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
