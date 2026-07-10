import { useMutation } from "@tanstack/react-query";
import { comparePimTenants } from "@/src/services/entra-id/pimApi";

export function usePimCompare() {
  const mutation = useMutation({
    mutationFn: (tenantIds: string[]) => comparePimTenants(tenantIds),
  });

  return {
    grid: mutation.data ?? null,
    compare: (tenantIds: string[]) => mutation.mutate(tenantIds),
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
