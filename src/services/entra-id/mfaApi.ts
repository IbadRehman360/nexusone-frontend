import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { MfaCatalog, MfaUserDetail, MfaPosture, MfaPolicyHealth } from "@/src/types/mfa";

const EMPTY_CATALOG: MfaCatalog = {
  items: [],
  stats: { coveragePct: 0, registeredCount: 0, inScopeCount: 0, weakFactorOnlyCount: 0, adminsAtRiskCount: 0, legacyAuthBlocked: null },
};

export const fetchMfaCatalog = async (): Promise<MfaCatalog> => {
  const response = await apiClient.get(API_ROUTES.MFA.GET_ALL, { timeout: 60_000 });
  return unwrap<MfaCatalog>(response.data) ?? EMPTY_CATALOG;
};

export const fetchMfaUserDetail = async (id: string): Promise<MfaUserDetail | null> => {
  const response = await apiClient.get(API_ROUTES.MFA.GET_BY_ID(id), { timeout: 60_000 });
  return unwrap<MfaUserDetail | null>(response.data) ?? null;
};

const EMPTY_POSTURE: MfaPosture = {
  methodStrength: [],
  adoptionOverTime: [],
  adoptionAvailable: false,
  failedPromptsOverTime: [],
  failedPromptsAvailable: false,
  summary: { coveragePct: 0, strongPct: 0, weakCount: 0, noneCount: 0 },
};

export const fetchMfaPosture = async (): Promise<MfaPosture> => {
  const response = await apiClient.get(API_ROUTES.MFA.POSTURE, { timeout: 60_000 });
  return unwrap<MfaPosture>(response.data) ?? EMPTY_POSTURE;
};

const EMPTY_POLICY: MfaPolicyHealth = {
  enforcingPolicies: [],
  enforcedCount: 0,
  reportOnlyCount: 0,
  excludedUserCount: 0,
  legacyAuthBlocked: false,
  gaps: { enforced: 0, reportOnly: 0, excluded: 0 },
  graphHealthy: false,
  portalDeepLink: "https://entra.microsoft.com",
  enforcementNote: "",
};

export const fetchMfaPolicy = async (): Promise<MfaPolicyHealth> => {
  const response = await apiClient.get(API_ROUTES.MFA.POLICY, { timeout: 60_000 });
  return unwrap<MfaPolicyHealth>(response.data) ?? EMPTY_POLICY;
};
