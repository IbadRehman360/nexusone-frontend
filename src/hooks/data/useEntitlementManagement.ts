import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEmCatalog, fetchEmPackage, compareEntitlementManagement } from "@/src/services/entra-id/entitlementManagementApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useEntitlementManagement() {
  const query = useQuery({
    queryKey: queryKeys.entitlementManagement.catalog(),
    queryFn: fetchEmCatalog,
    staleTime: 120_000,
    retry: false,
  });

  return {
    items: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    insights: query.data?.insights ?? null,
    emLicensed: query.data?.emLicensed ?? true,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEmPackage(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.entitlementManagement.package(id ?? ""),
    queryFn: () => fetchEmPackage(id!),
    enabled: !!id,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: !!id && query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEmCompare() {
  const mutation = useMutation({
    mutationFn: (tenantIds: string[]) => compareEntitlementManagement(tenantIds),
  });

  return {
    grid: mutation.data ?? null,
    compare: (tenantIds: string[]) => mutation.mutate(tenantIds),
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
