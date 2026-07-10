import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { SsprCatalog, SsprUserDetail, SsprConfig, SsprUsage } from "@/src/types/sspr";

const EMPTY_CATALOG: SsprCatalog = {
  items: [],
  stats: { status: "unknown", coveragePct: 0, registeredCount: 0, capableCount: 0, resetsThisMonth: 0, resetSuccessRate: 0, writeback: "unknown" },
};

export const fetchSsprCatalog = async (): Promise<SsprCatalog> => {
  const response = await apiClient.get(API_ROUTES.SSPR.GET_ALL, { timeout: 60_000 });
  return unwrap<SsprCatalog>(response.data) ?? EMPTY_CATALOG;
};

export const fetchSsprUserDetail = async (id: string): Promise<SsprUserDetail | null> => {
  const response = await apiClient.get(API_ROUTES.SSPR.GET_BY_ID(id), { timeout: 60_000 });
  return unwrap<SsprUserDetail | null>(response.data) ?? null;
};

const EMPTY_CONFIG: SsprConfig = {
  status: "unknown",
  scopeLabel: "Unknown",
  methodsRequiredNote: "",
  allowedMethods: [],
  writeback: { applicable: false, status: "unknown", source: "audit-derived" },
  portalDeepLink: "https://entra.microsoft.com",
};

export const fetchSsprConfig = async (): Promise<SsprConfig> => {
  const response = await apiClient.get(API_ROUTES.SSPR.CONFIG, { timeout: 60_000 });
  return unwrap<SsprConfig>(response.data) ?? EMPTY_CONFIG;
};

const EMPTY_USAGE: SsprUsage = {
  resetsOverTime: [],
  byWeek: [],
  topFailureReasons: [],
  byMethod: [],
  byMethodAvailable: false,
  resetVsUnlock: { resets: 0, unlocks: 0 },
  summary: { thisMonth: 0, succeeded: 0, failed: 0, successRatePct: 0 },
};

export const fetchSsprUsage = async (): Promise<SsprUsage> => {
  const response = await apiClient.get(API_ROUTES.SSPR.USAGE, { timeout: 60_000 });
  return unwrap<SsprUsage>(response.data) ?? EMPTY_USAGE;
};
