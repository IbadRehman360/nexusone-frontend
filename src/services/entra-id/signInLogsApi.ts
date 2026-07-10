import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { SignInExportFormat, SignInLogFilters, SignInLogsPage } from "@/src/types/signInLogs";

function buildParams(filters: SignInLogFilters, cursor?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set("signInType", filters.signInType);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.user) params.set("user", filters.user);
  if (filters.app) params.set("app", filters.app);
  if (filters.ip) params.set("ip", filters.ip);
  if (filters.status) params.set("status", filters.status);
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (cursor) params.set("cursor", cursor);
  return params;
}

const EMPTY_PAGE: SignInLogsPage = { rows: [], nextCursor: null };

export const fetchSignInLogs = async (filters: SignInLogFilters, cursor?: string): Promise<SignInLogsPage> => {
  const params = buildParams(filters, cursor);
  const response = await apiClient.get(`${API_ROUTES.SIGN_IN_LOGS.GET_ALL}?${params.toString()}`, { timeout: 45_000 });
  return unwrap<SignInLogsPage>(response.data) ?? EMPTY_PAGE;
};

export const downloadSignInLogs = async (filters: SignInLogFilters, format: SignInExportFormat): Promise<Blob> => {
  const params = buildParams(filters);
  params.set("format", format);
  const response = await apiClient.get(`${API_ROUTES.SIGN_IN_LOGS.EXPORT}?${params.toString()}`, {
    responseType: "blob",
    timeout: 120_000,
  });
  return response.data as Blob;
};
