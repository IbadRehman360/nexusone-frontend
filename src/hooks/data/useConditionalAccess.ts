import { useQuery } from "@tanstack/react-query";
import { fetchCaCatalog, fetchCaOverview, fetchCaConditions, fetchCaControls, fetchCaCoverage, fetchCaActivity } from "@/src/services/entra-id/conditionalAccessApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useConditionalAccess(enabled: boolean = true) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.catalog(),
    queryFn: fetchCaCatalog,
    staleTime: 120_000,
    retry: false,
    enabled,
  });

  return {
    policies: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    recommendations: query.data?.recommendations ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCaOverview(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.detail(id ?? "", "overview"),
    queryFn: () => fetchCaOverview(id!),
    enabled: !!id,
    staleTime: 120_000,
    retry: false,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCaConditions(id: string, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.detail(id, "conditions"),
    queryFn: () => fetchCaConditions(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCaControls(id: string, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.detail(id, "controls"),
    queryFn: () => fetchCaControls(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCaCoverage(id: string, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.detail(id, "coverage"),
    queryFn: () => fetchCaCoverage(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCaActivity(id: string, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.conditionalAccess.detail(id, "activity"),
    queryFn: () => fetchCaActivity(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => void query.refetch(),
  };
}
