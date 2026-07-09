import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnvironmentBusinessUnits } from "@/src/services/power-platform/environmentApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { BusinessUnit } from "@/src/types/powerPlatform";

/** Raw shape returned by the backend (`environments.service.ts#getEnvironmentBusinessUnits`). */
interface RawBusinessUnit {
  id: string;
  name: string;
  parentId: string | null;
  isRoot: boolean;
}

/** Group the flat, backend-shaped list into a parent/child tree keyed by `businessUnitId`. */
function buildTree(raw: RawBusinessUnit[]): BusinessUnit[] {
  const nodes = new Map<string, BusinessUnit>(
    raw.map((bu) => [bu.id, { businessUnitId: bu.id, name: bu.name, parentBusinessUnitId: bu.parentId, children: [] }]),
  );
  const roots: BusinessUnit[] = [];
  for (const bu of raw) {
    const node = nodes.get(bu.id)!;
    const parent = bu.parentId ? nodes.get(bu.parentId) : undefined;
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function useBusinessUnits(environmentUrl: string) {
  const query = useQuery({
    queryKey: queryKeys.businessUnits.byEnv(environmentUrl),
    queryFn: () => getEnvironmentBusinessUnits(environmentUrl, { pageSize: 500 }),
    enabled: !!environmentUrl,
  });

  const businessUnits = useMemo(
    () => buildTree((query.data?.data ?? []) as RawBusinessUnit[]),
    [query.data],
  );

  return {
    businessUnits,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
