import { useQuery } from "@tanstack/react-query";
import { fetchEntraTier } from "@/src/services/entra-id/licenseTierApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { EntraTier, EntraTierInfo } from "@/src/types/licenses";

const TIER_RANK: Record<EntraTier, number> = { free: 0, p1: 1, p2: 2 };

export function useEntraTier() {
  const query = useQuery({
    queryKey: queryKeys.licenses.tier(),
    queryFn: fetchEntraTier,
    staleTime: 600_000,
    retry: false,
  });

  const tier: EntraTierInfo | null = query.data ?? null;

  const hasTier = (required: EntraTier): boolean => {
    if (!tier) return false;
    return TIER_RANK[tier.tier] >= TIER_RANK[required];
  };

  return { tier, isLoading: query.isLoading, hasTier };
}
