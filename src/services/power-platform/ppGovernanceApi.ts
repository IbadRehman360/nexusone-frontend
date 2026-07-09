import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  PpDlpPolicySummary,
  PpDlpPolicyDetail,
  PpConnectorCatalogItem,
  UpsertDlpPolicyPayload,
  UnifiedAuditActivity,
} from "@/src/types/powerPlatform";

export const fetchPpDlpPolicies = async (): Promise<PpDlpPolicySummary[]> => {
  const response = await apiClient.get(API_ROUTES.PP_GOVERNANCE.DLP_POLICIES);
  return unwrap<PpDlpPolicySummary[]>(response.data) ?? [];
};

export const getDlpPolicyDetail = async (policyName: string): Promise<PpDlpPolicyDetail> => {
  const response = await apiClient.get(API_ROUTES.PP_GOVERNANCE.DLP_POLICY_DETAIL(policyName));
  return unwrap<PpDlpPolicyDetail>(response.data);
};

export const listPpConnectors = async (): Promise<PpConnectorCatalogItem[]> => {
  const response = await apiClient.get(API_ROUTES.PP_GOVERNANCE.CONNECTORS);
  return unwrap<PpConnectorCatalogItem[]>(response.data) ?? [];
};

export const createDlpPolicy = async (payload: UpsertDlpPolicyPayload): Promise<PpDlpPolicyDetail> => {
  const response = await apiClient.post(API_ROUTES.PP_GOVERNANCE.DLP_POLICIES, payload);
  return unwrap<PpDlpPolicyDetail>(response.data);
};

export const updateDlpPolicy = async (policyName: string, payload: UpsertDlpPolicyPayload): Promise<PpDlpPolicyDetail> => {
  const response = await apiClient.patch(API_ROUTES.PP_GOVERNANCE.DLP_POLICY_DETAIL(policyName), payload);
  return unwrap<PpDlpPolicyDetail>(response.data);
};

export const deleteDlpPolicy = async (policyName: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.PP_GOVERNANCE.DLP_POLICY_DETAIL(policyName));
};

export const fetchAuditActivity = async (category?: string): Promise<UnifiedAuditActivity[]> => {
  const response = await apiClient.get(API_ROUTES.PP_GOVERNANCE.AUDIT_ACTIVITY, {
    params: category && category !== "all" ? { category } : undefined,
  });
  return unwrap<UnifiedAuditActivity[]>(response.data) ?? [];
};
