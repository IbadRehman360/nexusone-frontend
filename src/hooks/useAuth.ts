import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, logout as logoutRequest, type SubscriptionView } from "@/src/services/auth";
import { setCurrentTenantId } from "@/src/lib/tenantContext";
import { useAppSelector } from "@/src/store";
import { resolveTrialOverride } from "@/src/store/slices/trialSlice";

const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

/**
 * Real session check — GET /auth/me. httpOnly cookies are sent automatically
 * (apiClient has withCredentials: true), so there's nothing to read from JS.
 * A 401/network failure just means "not signed in" — no error UI needed,
 * callers should treat isAuthenticated === false as the normal signed-out state.
 *
 * tenantContext is populated synchronously inside getMe() itself (not here
 * via an effect) — see that function for why.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const devScenario = useAppSelector((s) => s.trial.scenario);

  const query = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
    // While pending approval, poll so a SUPER_ADMIN's approval takes effect
    // on the PendingApprovalScreen without a manual reload.
    refetchInterval: (q) => (q.state.data?.tenantStatus === "pending_approval" ? 30_000 : false),
  });

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setCurrentTenantId(null);
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
    }
  };

  // Dev-only: DevTestingPanel's Trial Testing tab overlays a fake subscription
  // status onto the real user so the trial/grace/locked chip can be previewed
  // without needing a tenant actually in that state.
  const override = resolveTrialOverride(devScenario);
  const user =
    override && query.data
      ? { ...query.data, subscription: { ...query.data.subscription, ...override } as SubscriptionView }
      : query.data ?? null;

  return {
    user,
    isLoading: query.isLoading,
    isAuthenticated: !query.isLoading && !query.isError && !!query.data,
    logout,
  };
}
