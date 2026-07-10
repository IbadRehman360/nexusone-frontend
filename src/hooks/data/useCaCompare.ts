import { useMutation } from "@tanstack/react-query";
import { compareCaTenants } from "@/src/services/entra-id/conditionalAccessApi";

export function useCaCompare() {
  const mutation = useMutation({
    mutationFn: (tenantIds: string[]) => compareCaTenants(tenantIds),
  });

  return {
    grid: mutation.data ?? null,
    compare: (tenantIds: string[]) => mutation.mutate(tenantIds),
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
