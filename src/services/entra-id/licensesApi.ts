import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  LicenseSummary,
  UserLicenseSummary,
  UserActivitySummary,
  CostAnalysis,
  UserLicenseDetail,
  AssignLicensePayload,
  RevokeLicensePayload,
} from "@/src/types/licenses";

export const fetchLicenses = async (): Promise<LicenseSummary[]> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_ALL);
  return unwrap<LicenseSummary[]>(response.data) ?? [];
};

export const fetchLicenseUsers = async (): Promise<UserLicenseSummary[]> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_USERS);
  return unwrap<UserLicenseSummary[]>(response.data) ?? [];
};

export const fetchLicenseUsage = async (): Promise<UserActivitySummary[]> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_USAGE);
  return unwrap<UserActivitySummary[]>(response.data) ?? [];
};

const EMPTY_COST_ANALYSIS: CostAnalysis = {
  summary: { totalMonthlySpend: 0, totalAnnualSpend: 0, totalWastedMonthly: 0, totalPotentialSavings: 0, currency: "USD" },
  licenses: [],
  users: [],
  waste: [],
  meta: { generatedAt: "", priceSource: "hardcoded" },
};

export const fetchLicenseCosts = async (): Promise<CostAnalysis> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_COSTS);
  return unwrap<CostAnalysis>(response.data) ?? EMPTY_COST_ANALYSIS;
};

export const fetchUserLicenseDetail = async (userId: string): Promise<UserLicenseDetail[]> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_USER_DETAIL(userId));
  return unwrap<UserLicenseDetail[]>(response.data) ?? [];
};

export const assignLicense = async (payload: AssignLicensePayload): Promise<void> => {
  await apiClient.post(API_ROUTES.LICENSES.ASSIGN, payload);
};

export const revokeLicense = async (payload: RevokeLicensePayload): Promise<void> => {
  await apiClient.delete(API_ROUTES.LICENSES.REVOKE, { data: payload });
};
