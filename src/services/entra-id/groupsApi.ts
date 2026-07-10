import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { GroupListItem, EntraGroupDetail } from "@/src/types/groups";

export const fetchGroups = async (): Promise<GroupListItem[]> => {
  const response = await apiClient.get(API_ROUTES.GROUPS.GET_ALL);
  return unwrap<GroupListItem[]>(response.data) ?? [];
};

export const fetchGroupDetail = async (id: string): Promise<EntraGroupDetail | null> => {
  const response = await apiClient.get(API_ROUTES.GROUPS.GET_DETAIL(id));
  return unwrap<EntraGroupDetail | null>(response.data) ?? null;
};
