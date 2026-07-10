import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  AtlasConnector,
  ConnectorFilters,
  DataMapCollection,
  DataSourceDetail,
  ScanRuleSet,
  ScanStatusRow,
  AtlasCatalogStats,
} from "@/src/types/purview";

export const fetchCatalogConnectors = async (filters: ConnectorFilters = {}): Promise<AtlasConnector[]> => {
  const params: Record<string, string> = {};
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.sourceType && filters.sourceType !== "all") params.sourceType = filters.sourceType;
  const response = await apiClient.get(API_ROUTES.CATALOG.CONNECTORS, { params });
  return unwrap<AtlasConnector[]>(response.data) ?? [];
};

export const fetchCatalogConnectorDetail = async (name: string): Promise<DataSourceDetail | null> => {
  const response = await apiClient.get(API_ROUTES.CATALOG.CONNECTOR_DETAIL(name));
  return unwrap<DataSourceDetail | null>(response.data) ?? null;
};

export const fetchCatalogStats = async (): Promise<AtlasCatalogStats | null> => {
  const response = await apiClient.get(API_ROUTES.CATALOG.STATS);
  return unwrap<AtlasCatalogStats | null>(response.data) ?? null;
};

export const fetchDataMapCollections = async (): Promise<DataMapCollection[]> => {
  const response = await apiClient.get(API_ROUTES.DATA_MAP.COLLECTIONS);
  return unwrap<DataMapCollection[]>(response.data) ?? [];
};

export const fetchScanRuleSets = async (): Promise<ScanRuleSet[]> => {
  const response = await apiClient.get(API_ROUTES.DATA_MAP.SCAN_RULE_SETS);
  return unwrap<ScanRuleSet[]>(response.data) ?? [];
};

export const fetchScanStatuses = async (): Promise<ScanStatusRow[]> => {
  const response = await apiClient.get(API_ROUTES.SCAN_STATUSES);
  return unwrap<ScanStatusRow[]>(response.data) ?? [];
};
