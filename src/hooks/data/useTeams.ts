import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnvironmentsWithTeams } from "@/src/services/power-platform/environmentApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { Team } from "@/src/types/powerPlatform";

/** Raw shape returned by the backend (`environment-aggregator.service.ts#getEnvironmentsWithTeams`). */
interface RawEntraIdTeam {
  teamId: string;
  teamName: string;
  azureAdObjectId: string | null;
  securityGroupName: string;
  members: number;
  businessUnit: string;
  businessUnitId: string | null;
}

interface RawEnvironmentWithTeams {
  environmentDisplayName: string;
  environmentUrl: string;
  entraIdTeams: RawEntraIdTeam[];
}

function toTeam(raw: RawEntraIdTeam): Team {
  return {
    teamId: raw.teamId,
    name: raw.teamName,
    businessUnitId: raw.businessUnitId ?? undefined,
    businessUnitName: raw.businessUnit,
    memberCount: raw.members,
    azureAdObjectId: raw.azureAdObjectId ?? undefined,
    securityGroupName: raw.securityGroupName,
  };
}

export function useTeams(environmentUrl?: string) {
  const query = useQuery({
    queryKey: queryKeys.teams.all(environmentUrl),
    queryFn: () => getEnvironmentsWithTeams({ pageSize: 500 }),
  });

  const teams = useMemo(() => {
    const envs = (query.data?.data ?? []) as RawEnvironmentWithTeams[];
    const raw = environmentUrl
      ? (envs.find((e) => e.environmentUrl === environmentUrl)?.entraIdTeams ?? [])
      : envs.flatMap((e) => e.entraIdTeams ?? []);
    return raw.map(toTeam);
  }, [query.data, environmentUrl]);

  return {
    teams,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
