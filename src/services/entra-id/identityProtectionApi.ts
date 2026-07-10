import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { IdpQueue, IdpUserDetail, IdpSocQueue } from "@/src/types/identityProtection";

const EMPTY_QUEUE: IdpQueue = {
  items: [],
  stats: { high: 0, medium: 0, low: 0, riskySignIns: 0, unremediated24h: 0, confirmedCompromised: 0 },
  insights: { insights: [], exposurePercent: 0, highRisk: 0, unremediated: 0 },
  idpLicensed: true,
};

export const fetchIdpQueue = async (): Promise<IdpQueue> => {
  const response = await apiClient.get(API_ROUTES.IDENTITY_PROTECTION.QUEUE, { timeout: 60_000 });
  return unwrap<IdpQueue>(response.data) ?? EMPTY_QUEUE;
};

export const fetchIdpUser = async (id: string): Promise<IdpUserDetail | null> => {
  const response = await apiClient.get(API_ROUTES.IDENTITY_PROTECTION.USER(id), { timeout: 60_000 });
  return unwrap<IdpUserDetail | null>(response.data) ?? null;
};

const EMPTY_SOC_QUEUE: IdpSocQueue = { tenants: [], items: [] };

export const fetchIdpSocQueue = async (tenantIds: string[]): Promise<IdpSocQueue> => {
  const response = await apiClient.post(API_ROUTES.IDENTITY_PROTECTION.COMPARE, { tenantIds });
  return unwrap<IdpSocQueue>(response.data) ?? EMPTY_SOC_QUEUE;
};
