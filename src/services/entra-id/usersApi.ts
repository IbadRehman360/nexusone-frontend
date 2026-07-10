import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { EntraUser, EntraUserGroup, EntraUserAppAssignment, EntraUserOwnedObject } from "@/src/types/entraUsers";

export const fetchUsers = async (): Promise<EntraUser[]> => {
  const response = await apiClient.get(API_ROUTES.ENTRA_USERS.GET_ALL, { params: { page_size: 500 } });
  const page = unwrap<{ data: EntraUser[] }>(response.data);
  const users = page?.data;
  return Array.isArray(users) ? users : [];
};

export const fetchUserById = async (id: string): Promise<EntraUser | null> => {
  const response = await apiClient.get(API_ROUTES.ENTRA_USERS.GET_BY_ID(id));
  return unwrap<EntraUser | null>(response.data) ?? null;
};

export const fetchUserGroups = async (id: string): Promise<EntraUserGroup[]> => {
  const response = await apiClient.get(API_ROUTES.ENTRA_USERS.GROUPS(id));
  return unwrap<EntraUserGroup[]>(response.data) ?? [];
};

export const fetchUserAppAssignments = async (id: string): Promise<EntraUserAppAssignment[]> => {
  const response = await apiClient.get(API_ROUTES.ENTRA_USERS.APP_ASSIGNMENTS(id));
  const rows = unwrap<EntraUserAppAssignment[]>(response.data) ?? [];
  const seen = new Set<string>();
  return rows.filter((row) => (seen.has(row.resourceId) ? false : (seen.add(row.resourceId), true)));
};

export const fetchUserOwnedObjects = async (id: string): Promise<EntraUserOwnedObject[]> => {
  const response = await apiClient.get(API_ROUTES.ENTRA_USERS.OWNED_OBJECTS(id));
  return unwrap<EntraUserOwnedObject[]>(response.data) ?? [];
};
