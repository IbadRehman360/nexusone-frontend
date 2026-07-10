import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchArCatalog, fetchArCampaign, compareAccessReviews } from "@/src/services/entra-id/accessReviewsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useAccessReviews() {
  const query = useQuery({
    queryKey: queryKeys.accessReviews.catalog(),
    queryFn: fetchArCatalog,
    staleTime: 120_000,
    retry: false,
  });

  return {
    items: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    insights: query.data?.insights ?? null,
    arLicensed: query.data?.arLicensed ?? true,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useAccessReviewCampaign(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.accessReviews.campaign(id ?? ""),
    queryFn: () => fetchArCampaign(id!),
    enabled: !!id,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: !!id && query.isLoading,
    error: query.error as Error | null,
  };
}

export function useArCompare() {
  const mutation = useMutation({
    mutationFn: (tenantIds: string[]) => compareAccessReviews(tenantIds),
  });

  return {
    grid: mutation.data ?? null,
    compare: (tenantIds: string[]) => mutation.mutate(tenantIds),
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
