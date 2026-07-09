import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import { normalizeResponse } from "./environmentApi";
import type { ComplianceOverview, ComplianceReport } from "@/src/types/powerPlatform";

export const fetchComplianceOverview = async (): Promise<ComplianceOverview> => {
  const response = await apiClient.get(API_ROUTES.COMPLIANCE.GET_OVERVIEW);
  return unwrap<ComplianceOverview>(response.data);
};

export const getLatestComplianceReport = async (environmentId: string): Promise<ComplianceReport> => {
  const response = await apiClient.get(API_ROUTES.COMPLIANCE.GET_LATEST(environmentId));
  return unwrap<ComplianceReport>(response.data);
};

export const runComplianceCheck = async (environmentId: string): Promise<ComplianceReport> => {
  const response = await apiClient.post(API_ROUTES.COMPLIANCE.RUN(environmentId));
  return unwrap<ComplianceReport>(response.data);
};

export const getComplianceHistory = async (environmentId: string, page = 1, pageSize = 20): Promise<ComplianceReport[]> => {
  const response = await apiClient.get(API_ROUTES.COMPLIANCE.GET_HISTORY(environmentId), { params: { page, page_size: pageSize } });
  return normalizeResponse<ComplianceReport>(response.data).data;
};
