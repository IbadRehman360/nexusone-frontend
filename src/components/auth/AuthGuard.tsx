"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { FullScreenLoader } from "@/src/components/ui/feedback/FullScreenLoader";
import { PendingApprovalScreen } from "./PendingApprovalScreen";

/** Route guard — redirects to /signin when there's no valid session; shows a holding screen while the tenant awaits approval. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (user?.tenantStatus === "pending_approval") {
    return <PendingApprovalScreen />;
  }

  return <>{children}</>;
}
