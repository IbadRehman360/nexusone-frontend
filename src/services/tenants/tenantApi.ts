import apiClient from "../client";
import { TENANT_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  azureTenantId: string;
  plan: string;
  isActive: boolean;
  status: string;
}

export interface TenantMember {
  id: string;
  membershipId: string;
  email: string;
  fullName: string;
  role: string;
  roleCapabilities: string[];
  isActive: boolean;
  joinedAt: string | null;
  invitedAt: string | null;
  lastActiveAt: string | null;
}

export interface TenantRole {
  id: string;
  name: string;
  isPreset: boolean;
}

export const getTenants = async (): Promise<Tenant[]> => {
  const response = await apiClient.get(TENANT_ROUTES.GET_ALL);
  return unwrap<Tenant[]>(response.data) ?? [];
};

export const getTenantMembers = async (tenantId: string): Promise<TenantMember[]> => {
  const response = await apiClient.get(TENANT_ROUTES.MEMBERS(tenantId));
  return unwrap<TenantMember[]>(response.data) ?? [];
};

export const getTenantRoles = async (tenantId: string): Promise<TenantRole[]> => {
  const response = await apiClient.get(TENANT_ROUTES.ROLES(tenantId));
  return unwrap<TenantRole[]>(response.data) ?? [];
};

export const updateMemberRole = async (tenantId: string, userId: string, roleId: string): Promise<void> => {
  await apiClient.patch(TENANT_ROUTES.MEMBER(tenantId, userId), { roleId });
};

export const removeTenantMember = async (tenantId: string, userId: string): Promise<void> => {
  await apiClient.delete(TENANT_ROUTES.MEMBER(tenantId, userId));
};

export const initiateConsent = async (azureTenantId: string): Promise<{ authorizationUrl: string }> => {
  const response = await apiClient.post(TENANT_ROUTES.INITIATE_CONSENT, { azureTenantId });
  return unwrap<{ authorizationUrl: string }>(response.data);
};

export const completeConsent = async (state: string, azureTenantId: string): Promise<Tenant> => {
  const response = await apiClient.post(TENANT_ROUTES.COMPLETE_CONSENT, { state, azureTenantId });
  return unwrap<Tenant>(response.data);
};

/** Switching sets a fresh tenant-scoped httpOnly session cookie server-side — the caller should reload after this resolves. */
export const switchTenant = async (id: string): Promise<void> => {
  await apiClient.post(TENANT_ROUTES.SWITCH(id));
};
