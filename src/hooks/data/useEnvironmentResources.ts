import { useQuery } from "@tanstack/react-query";
import {
  getEnvironmentApps,
  getEnvironmentFlows,
  getEnvironmentPages,
  getEnvironmentTables,
  getEnvironmentD365Apps,
} from "@/src/services/power-platform/resourcesApi";

export function useEnvironmentApps(environmentId: string) {
  const query = useQuery({
    queryKey: ["environment-apps", environmentId],
    queryFn: () => getEnvironmentApps(environmentId),
    enabled: !!environmentId,
  });
  return { apps: query.data ?? [], isLoading: query.isLoading, error: query.error as Error | null };
}

export function useEnvironmentFlows(environmentId: string) {
  const query = useQuery({
    queryKey: ["environment-flows", environmentId],
    queryFn: () => getEnvironmentFlows(environmentId),
    enabled: !!environmentId,
  });
  return { flows: query.data ?? [], isLoading: query.isLoading, error: query.error as Error | null };
}

export function useEnvironmentPages(environmentId: string) {
  const query = useQuery({
    queryKey: ["environment-pages", environmentId],
    queryFn: () => getEnvironmentPages(environmentId),
    enabled: !!environmentId,
  });
  return { pages: query.data ?? [], isLoading: query.isLoading, error: query.error as Error | null };
}

export function useEnvironmentTables(environmentId: string, environmentUrl: string) {
  const query = useQuery({
    queryKey: ["environment-tables", environmentId, environmentUrl],
    queryFn: () => getEnvironmentTables(environmentId, environmentUrl),
    enabled: !!environmentId && !!environmentUrl,
  });
  return { tables: query.data ?? [], isLoading: query.isLoading, error: query.error as Error | null };
}

export function useEnvironmentD365Apps(environmentId: string) {
  const query = useQuery({
    queryKey: ["environment-d365", environmentId],
    queryFn: () => getEnvironmentD365Apps(environmentId),
    enabled: !!environmentId,
  });
  return { apps: query.data ?? [], isLoading: query.isLoading, error: query.error as Error | null };
}
