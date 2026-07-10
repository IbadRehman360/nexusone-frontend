import { useQuery } from "@tanstack/react-query";
import { fetchSsprCatalog, fetchSsprUserDetail, fetchSsprConfig, fetchSsprUsage } from "@/src/services/entra-id/ssprApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useSsprCatalog() {
  const query = useQuery({
    queryKey: queryKeys.sspr.catalog(),
    queryFn: fetchSsprCatalog,
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

export function useSsprUserDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.sspr.userDetail(id ?? ""),
    queryFn: () => fetchSsprUserDetail(id!),
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

export function useSsprConfig(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.sspr.config(),
    queryFn: fetchSsprConfig,
    enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => void query.refetch(),
  };
}

export function useSsprUsage(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.sspr.usage(),
    queryFn: fetchSsprUsage,
    enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    usage: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => void query.refetch(),
  };
}
