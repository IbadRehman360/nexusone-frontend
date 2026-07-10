import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { DlpAlert } from "@/src/types/purview";

export const fetchDlpAlerts = async (): Promise<DlpAlert[]> => {
  const response = await apiClient.get(API_ROUTES.DLP);
  return unwrap<DlpAlert[]>(response.data) ?? [];
};
