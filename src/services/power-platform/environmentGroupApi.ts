import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { normalizeResponse } from "./environmentApi";
import { unwrap } from "../unwrap";
import type { EnvironmentGroup, EnvironmentGroupWithEnvironments } from "@/src/types/powerPlatform";

export interface EnvironmentGroupPayload {
  displayName: string;
  description?: string;
}

export const getEnvironmentGroups = async () => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENT_GROUPS.GET_ALL);
  return normalizeResponse<EnvironmentGroup>(response.data);
};

export const createEnvironmentGroup = async (payload: EnvironmentGroupPayload): Promise<EnvironmentGroup> => {
  const response = await apiClient.post(API_ROUTES.ENVIRONMENT_GROUPS.CREATE, payload);
  return unwrap<EnvironmentGroup>(response.data);
};

export const updateEnvironmentGroup = async (groupId: string, payload: EnvironmentGroupPayload): Promise<EnvironmentGroup> => {
  const response = await apiClient.patch(API_ROUTES.ENVIRONMENT_GROUPS.UPDATE(groupId), payload);
  return unwrap<EnvironmentGroup>(response.data);
};

export const deleteEnvironmentGroup = async (groupId: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.ENVIRONMENT_GROUPS.DELETE(groupId));
};

export const getEnvironmentGroupById = async (groupId: string): Promise<EnvironmentGroup> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENT_GROUPS.GET_BY_ID(groupId));
  return unwrap<EnvironmentGroup>(response.data);
};

export const getEnvironmentGroupEnvironments = async (groupId: string) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENT_GROUPS.GET_ENVIRONMENTS(groupId));
  return normalizeResponse(response.data);
};

export const getEnvironmentGroupsWithEnvironments = async (): Promise<EnvironmentGroupWithEnvironments[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENT_GROUPS.WITH_ENVIRONMENTS);
  return unwrap<EnvironmentGroupWithEnvironments[]>(response.data) ?? [];
};
