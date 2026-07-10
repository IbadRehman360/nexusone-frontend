import { useQuery } from "@tanstack/react-query";
import {
  fetchCatalogAssets,
  fetchCatalogAsset,
  fetchCatalogClassificationTypes,
  fetchClassificationUsage,
} from "@/src/services/purview/catalogApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { AssetFilters } from "@/src/types/purview";

export function useCatalogAssets(filters: AssetFilters = {}) {
  const { type = "all", source = "all" } = filters;
  const query = useQuery({
    queryKey: queryKeys.purviewCatalog.assets(type, source),
    queryFn: () => fetchCatalogAssets({ type, source }),
  });

  const assets = query.data ?? [];
  return {
    assets,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useCatalogAsset(guid: string | null) {
  const query = useQuery({
    queryKey: queryKeys.purviewCatalog.asset(guid ?? ""),
    queryFn: () => (guid ? fetchCatalogAsset(guid) : Promise.resolve(null)),
    enabled: !!guid,
  });

  const asset = query.data ?? null;
  return {
    asset,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCatalogClassificationTypes(category = "all") {
  const query = useQuery({
    queryKey: queryKeys.purviewCatalog.classificationTypes(category),
    queryFn: () => fetchCatalogClassificationTypes(category),
  });

  const classifiers = query.data ?? [];
  return {
    classifiers,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useClassificationUsage(name: string | null) {
  const query = useQuery({
    queryKey: queryKeys.purviewCatalog.classificationUsage(name ?? ""),
    queryFn: () => (name ? fetchClassificationUsage(name) : Promise.resolve(null)),
    enabled: !!name,
  });

  const usage = query.data ?? null;
  return {
    usage,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
