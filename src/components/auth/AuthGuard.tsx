"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/src/hooks/useAuth";
import { FullScreenLoader } from "@/src/components/ui/feedback/FullScreenLoader";
import { PendingApprovalScreen } from "./PendingApprovalScreen";
import { DeactivatedScreen } from "./DeactivatedScreen";
import { connectPresenceSocket, disconnectPresenceSocket } from "@/src/services/socket/presenceSocket";

/** Route guard — redirects to /signin when there's no valid session; shows a holding screen while the tenant awaits approval, or a deactivated screen if a platform admin has turned off access. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  // Live fast-path for a backoffice-driven deactivate/reactivate: the socket
  // (joined to a `tenant:{id}` room server-side, see PresenceGateway) pushes
  // the instant a SUPER_ADMIN changes this tenant's status, so whoever's
  // using the app right now sees DeactivatedScreen swap in immediately
  // instead of waiting for useAuth's poll fallback to catch up.
  //
  // Mounted at THIS level (not inside DashboardShell/usePresence) because it
  // must keep working even while DeactivatedScreen/PendingApprovalScreen are
  // showing — i.e. exactly when DashboardShell (and its own usePresence
  // connection) is unmounted. connectPresenceSocket()/disconnectPresenceSocket()
  // are reference-counted specifically so this effect and usePresence can
  // each independently hold the shared connection open; the connection only
  // actually closes once BOTH have released it. Without that, a reactivation
  // pushed while this screen was showing would never be received — the
  // socket was already torn down by DashboardShell's unmount.
  useEffect(() => {
    if (!isAuthenticated || !user?.currentTenantId) return;
    const tenantId = user.currentTenantId;
    const socket = connectPresenceSocket();
    const onStatusChanged = (payload: { tenantId: string; status: string }) => {
      if (payload.tenantId !== tenantId) return;
      // Invalidate everything, not just auth/me — a deactivate/reactivate is
      // a wholesale tenant-state change, and every tenant-scoped query
      // (tenants, billing, modules, members, ...) is now stale. Cherry-
      // picking a couple of keys here (an earlier version of this fix did
      // only auth/me) left OTHER cached data behind, e.g. the tenant
      // switcher's name via useTenants()'s ["tenants"] query.
      void queryClient.invalidateQueries();
    };
    socket.on("tenant:status-changed", onStatusChanged);
    return () => {
      socket.off("tenant:status-changed", onStatusChanged);
      disconnectPresenceSocket();
    };
  }, [isAuthenticated, user?.currentTenantId, queryClient]);

  if (isLoading || !isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (user?.tenantStatus === "pending_approval") {
    return <PendingApprovalScreen />;
  }

  if (user?.tenantStatus === "deactivated") {
    return <DeactivatedScreen />;
  }

  return <>{children}</>;
}
