import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  AppRegistrationCatalog,
  AppRegistrationOverview,
  CredentialsTabData,
  PermissionsTabData,
  AuthenticationTabData,
  ExposedApiTabData,
  RolesAdminsTabData,
} from "@/src/types/appRegistrations";

export const fetchAppRegistrationCatalog = async (): Promise<AppRegistrationCatalog> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.GET_ALL);
  return unwrap<AppRegistrationCatalog>(response.data) ?? { apps: [], stats: { total: 0, secretsExpiringSoon: 0, expiredCredentials: 0, noOwner: 0 } };
};

export const fetchAppRegistrationOverview = async (id: string): Promise<AppRegistrationOverview | null> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.GET_BY_ID(id));
  return unwrap<AppRegistrationOverview | null>(response.data) ?? null;
};

export const fetchAppRegistrationCredentials = async (id: string): Promise<CredentialsTabData> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.CREDENTIALS(id));
  return unwrap<CredentialsTabData>(response.data) ?? { secrets: [], certificates: [] };
};

export const fetchAppRegistrationPermissions = async (id: string): Promise<PermissionsTabData> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.PERMISSIONS(id));
  return unwrap<PermissionsTabData>(response.data) ?? { delegated: [], application: [], total: 0, granted: 0, highRisk: 0 };
};

export const fetchAppRegistrationAuthentication = async (id: string): Promise<AuthenticationTabData> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.AUTHENTICATION(id));
  return (
    unwrap<AuthenticationTabData>(response.data) ?? {
      redirectGroups: [],
      logoutUrl: null,
      implicitAccessToken: false,
      implicitIdToken: false,
      signInAudience: null,
      audience: "single",
    }
  );
};

export const fetchAppRegistrationExposedApi = async (id: string): Promise<ExposedApiTabData> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.EXPOSED_API(id));
  return unwrap<ExposedApiTabData>(response.data) ?? { identifierUris: [], scopes: [], appRoles: [] };
};

export const fetchAppRegistrationRolesAdmins = async (id: string): Promise<RolesAdminsTabData> => {
  const response = await apiClient.get(API_ROUTES.APP_REGISTRATIONS.ROLES_ADMINS(id));
  return unwrap<RolesAdminsTabData>(response.data) ?? { spObjectId: null, accessible: true, assignments: [] };
};
