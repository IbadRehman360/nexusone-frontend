import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnvironmentsWithUsers } from "@/src/services/power-platform/environmentApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { PPUser } from "@/src/types/powerPlatform";

/** Raw shape returned by the backend (`environment-aggregator.service.ts#getEnvironmentsWithUsers`). */
interface RawUser {
  id: string;
  fullname: string;
  domainname: string;
  businessUnit: string;
  roles: string[];
  teams: string[];
  isdisabled: boolean;
}

interface RawEnvironmentWithUsers {
  environmentUrl: string;
  users: RawUser[];
}

function toPPUser(raw: RawUser): PPUser {
  return {
    userId: raw.id,
    fullName: raw.fullname,
    email: raw.domainname,
    businessUnitName: raw.businessUnit,
    roles: (raw.roles ?? []).map((name) => ({ roleId: name, roleName: name })),
    enabled: !raw.isdisabled,
  };
}

export function useUsers(environmentUrl?: string) {
  const query = useQuery({
    queryKey: queryKeys.users.all(environmentUrl),
    queryFn: () => getEnvironmentsWithUsers({ pageSize: 500 }),
  });

  const users = useMemo(() => {
    const envs = (query.data?.data ?? []) as RawEnvironmentWithUsers[];
    const raw = environmentUrl
      ? (envs.find((e) => e.environmentUrl === environmentUrl)?.users ?? [])
      : envs.flatMap((e) => e.users ?? []);
    return raw.map(toPPUser);
  }, [query.data, environmentUrl]);

  return {
    users,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
