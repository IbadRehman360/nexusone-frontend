import { useQuery } from "@tanstack/react-query";
import { fetchMfaCatalog, fetchMfaUserDetail, fetchMfaPosture, fetchMfaPolicy } from "@/src/services/entra-id/mfaApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useMfaCatalog() {
  const query = useQuery({
    queryKey: queryKeys.mfa.catalog(),
    queryFn: fetchMfaCatalog,
    staleTime: 120_000,
    retry: false,
  });

  return {
    users: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useMfaUserDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.mfa.userDetail(id ?? ""),
    queryFn: () => fetchMfaUserDetail(id!),
    enabled: !!id,
    staleTime: 120_000,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useMfaPosture(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.mfa.posture(),
    queryFn: fetchMfaPosture,
    enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    posture: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => void query.refetch(),
  };
}

export function useMfaPolicy(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.mfa.policy(),
    queryFn: fetchMfaPolicy,
    enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    policy: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => void query.refetch(),
  };
}
