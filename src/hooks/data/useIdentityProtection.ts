import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchIdpQueue, fetchIdpUser, fetchIdpSocQueue } from "@/src/services/entra-id/identityProtectionApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useIdentityProtection() {
  const query = useQuery({
    queryKey: queryKeys.identityProtection.queue(),
    queryFn: fetchIdpQueue,
    staleTime: 60_000,
    retry: false,
  });

  return {
    items: query.data?.items ?? [],
    stats: query.data?.stats ?? null,
    insights: query.data?.insights ?? null,
    idpLicensed: query.data?.idpLicensed ?? true,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useIdpUser(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.identityProtection.user(id ?? ""),
    queryFn: () => fetchIdpUser(id!),
    enabled: !!id,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: !!id && query.isLoading,
    error: query.error as Error | null,
  };
}

export function useIdpSoc() {
  const mutation = useMutation({
    mutationFn: (tenantIds: string[]) => fetchIdpSocQueue(tenantIds),
  });

  return {
    queue: mutation.data ?? null,
    load: (tenantIds: string[]) => mutation.mutate(tenantIds),
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
