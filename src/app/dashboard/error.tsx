"use client";

import { SectionErrorBoundary } from "@/src/components/error/SectionErrorBoundary";

/**
 * Dashboard error boundary (Phase 11). Renders inside the dashboard shell, so a
 * page crash shows a contained error while the header/nav stay usable.
 */
export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SectionErrorBoundary {...props} label="the dashboard" />;
}
