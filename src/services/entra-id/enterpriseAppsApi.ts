import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  EnterpriseAppCatalog,
  EnterpriseAppDetail,
  AccessTabData,
  SsoTabData,
  PermissionsTabData,
  SignInLogRow,
} from "@/src/types/enterpriseApps";

export const fetchEnterpriseAppCatalog = async (): Promise<EnterpriseAppCatalog> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.GET_ALL);
  return unwrap<EnterpriseAppCatalog>(response.data) ?? { apps: [], stats: { total: 0, ssoConfigured: 0, needsAttention: 0, disabled: 0 } };
};

export const fetchEnterpriseAppOverview = async (id: string): Promise<EnterpriseAppDetail | null> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.GET_BY_ID(id));
  return unwrap<EnterpriseAppDetail | null>(response.data) ?? null;
};

export const fetchEnterpriseAppAccess = async (id: string): Promise<AccessTabData> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.ACCESS(id));
  return unwrap<AccessTabData>(response.data) ?? { assignments: [], owners: [], appRoles: [] };
};

export const fetchEnterpriseAppSso = async (id: string): Promise<SsoTabData> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.SSO(id));
  return unwrap<SsoTabData>(response.data) ?? { mode: "none", certificates: [], replyUrls: [] };
};

export const fetchEnterpriseAppPermissions = async (id: string): Promise<PermissionsTabData> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.PERMISSIONS(id));
  return unwrap<PermissionsTabData>(response.data) ?? { rows: [], total: 0, adminConsented: 0, highPrivilege: 0 };
};

export const fetchEnterpriseAppActivity = async (id: string, appId: string): Promise<SignInLogRow[]> => {
  const response = await apiClient.get(API_ROUTES.ENTERPRISE_APPS.ACTIVITY(id), { params: { appId } });
  return unwrap<SignInLogRow[]>(response.data) ?? [];
};
