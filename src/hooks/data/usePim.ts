import { useQuery } from "@tanstack/react-query";
import { fetchPimPosture, fetchPimPrincipal } from "@/src/services/entra-id/pimApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function usePim() {
  const query = useQuery({
    queryKey: queryKeys.pim.posture(),
    queryFn: fetchPimPosture,
    staleTime: 120_000,
    retry: false,
  });

  return {
    items: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    recommendations: query.data?.recommendations ?? null,
    pimLicensed: query.data ? query.data.pimLicensed : !query.error,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function usePimPrincipal(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.pim.principal(id ?? ""),
    queryFn: () => fetchPimPrincipal(id!),
    enabled: !!id,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: !!id && query.isLoading,
    error: query.error as Error | null,
  };
}
