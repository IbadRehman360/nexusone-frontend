"use client";

import { useEffect } from "react";
import { ErrorState } from "./ErrorState";

/**
 * Shared fallback for App Router `error.tsx` boundaries (Phase 11). Each section
 * boundary renders this so a crash in one section shows a contained error while
 * the surrounding shell stays intact. `reset` re-renders the segment.
 */
export function SectionErrorBoundary({
  error,
  reset,
  label,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  label?: string;
}) {
  useEffect(() => {
    // Surface the real error to the console for debugging; the user only sees
    // the friendly ErrorState.
    console.error(`${label ?? "Section"} error:`, error);
  }, [error, label]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <ErrorState
        error={error}
        onRetry={reset}
        whatHappened={label ? `Using ${label}` : undefined}
      />
    </div>
  );
}
