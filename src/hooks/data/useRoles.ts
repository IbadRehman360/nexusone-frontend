import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnvironmentRoles } from "@/src/services/power-platform/environmentApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { Role } from "@/src/types/powerPlatform";

/** Raw shape returned by the backend (`environments.service.ts#getEnvironmentRoles` → `TransformedRole`). */
interface RawRole {
  id: string;
  name: string;
  businessUnit: string;
  businessUnitId: string | null;
}

function toRole(raw: RawRole): Role {
  return {
    roleId: raw.id,
    roleName: raw.name,
    businessUnitId: raw.businessUnitId ?? undefined,
    businessUnitName: raw.businessUnit,
  };
}

export function useRoles(environmentUrl: string) {
  const query = useQuery({
    queryKey: queryKeys.roles.byEnv(environmentUrl),
    queryFn: () => getEnvironmentRoles(environmentUrl, undefined, { pageSize: 500 }),
    enabled: !!environmentUrl,
  });

  const roles = useMemo(
    () => ((query.data?.data ?? []) as RawRole[]).map(toRole),
    [query.data],
  );

  return {
    roles,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
