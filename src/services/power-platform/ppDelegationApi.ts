import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { PPDelegation } from "@/src/types/powerPlatform";

export const getPPDelegations = async (environmentUrl: string, status?: string): Promise<PPDelegation[]> => {
  const response = await apiClient.get(API_ROUTES.PP_DELEGATIONS.LIST, {
    params: { environmentUrl, ...(status && status !== "all" && { status }) },
  });
  return unwrap<PPDelegation[]>(response.data) ?? [];
};

export interface DelegatorRole {
  roleId: string;
  roleName: string;
}

export const getDelegatorRoles = async (environmentUrl: string, userId: string): Promise<DelegatorRole[]> => {
  const response = await apiClient.get(API_ROUTES.PP_DELEGATIONS.USER_ROLES, {
    params: { environmentUrl, userId },
  });
  const data = unwrap<{ rolesList: DelegatorRole[] }>(response.data);
  return data?.rolesList ?? [];
};

export interface CreateDelegationPayload {
  environmentUrl: string;
  delegatorId: string;
  delegateeId: string;
  roleIds: string[];
  startDate: string;
  endDate: string;
  reason?: string;
}

export const createDelegation = async (payload: CreateDelegationPayload) => {
  const response = await apiClient.post(API_ROUTES.PP_DELEGATIONS.CREATE, payload);
  return unwrap(response.data);
};

export const revokeDelegation = async (id: string) => {
  const response = await apiClient.delete(API_ROUTES.PP_DELEGATIONS.REVOKE(id));
  return unwrap(response.data);
};
