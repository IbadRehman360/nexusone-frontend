import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  AssetFilters,
  AtlasAsset,
  AtlasAssetDetail,
  AtlasSit,
  ClassificationUsage,
} from "@/src/types/purview";

export const fetchCatalogAssets = async (filters: AssetFilters = {}): Promise<AtlasAsset[]> => {
  const params: Record<string, string> = {};
  if (filters.type && filters.type !== "all") params.type = filters.type;
  if (filters.source && filters.source !== "all") params.source = filters.source;
  const response = await apiClient.get(API_ROUTES.CATALOG.ASSETS, { params });
  return unwrap<AtlasAsset[]>(response.data) ?? [];
};

export const fetchCatalogAsset = async (guid: string): Promise<AtlasAssetDetail | null> => {
  const response = await apiClient.get(API_ROUTES.CATALOG.ASSET(guid));
  return unwrap<AtlasAssetDetail | null>(response.data) ?? null;
};

export const fetchCatalogClassificationTypes = async (category = "all"): Promise<AtlasSit[]> => {
  const params: Record<string, string> = {};
  if (category && category !== "all") params.category = category;
  const response = await apiClient.get(API_ROUTES.CATALOG.CLASSIFICATION_TYPES, { params });
  return unwrap<AtlasSit[]>(response.data) ?? [];
};

export const fetchClassificationUsage = async (name: string): Promise<ClassificationUsage | null> => {
  const response = await apiClient.get(API_ROUTES.CATALOG.CLASSIFICATION_USAGE, { params: { name } });
  return unwrap<ClassificationUsage | null>(response.data) ?? null;
};
