"use client";

import { SectionErrorBoundary } from "@/src/components/error/SectionErrorBoundary";

export default function PowerPlatformError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SectionErrorBoundary {...props} label="Power Platform" />;
}
