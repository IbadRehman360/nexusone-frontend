"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FullScreenLoader } from "@/src/components/ui/feedback/FullScreenLoader";

/**
 * Reached after the Azure OAuth round-trip. On success the backend already
 * set httpOnly session cookies and redirected straight to /dashboard — this
 * page only renders when something needs a client-side bounce (or in an
 * error case). No error copy here by design: just a loader, then redirect.
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasError = !!searchParams.get("error");

  useEffect(() => {
    router.replace(hasError ? "/signin" : "/dashboard");
  }, [router, hasError]);

  return <FullScreenLoader />;
}

export default function Page() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
