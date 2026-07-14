"use client";

import { ErrorState } from "@/src/components/error/ErrorState";

/**
 * Root-level React error boundary (Phase 11). Catches render crashes not caught
 * by a nested error.tsx. Because it replaces the root layout, it must render its
 * own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <ErrorState
            error={error}
            onRetry={reset}
            whatHappened="Loading the app"
          />
        </div>
      </body>
    </html>
  );
}
