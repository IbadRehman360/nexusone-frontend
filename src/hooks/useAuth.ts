import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, logout as logoutRequest } from "@/src/services/auth";
import { setCurrentTenantId } from "@/src/lib/tenantContext";

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

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !query.isLoading && !query.isError && !!query.data,
    logout,
  };
}
