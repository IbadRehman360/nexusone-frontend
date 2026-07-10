import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { SensitivityLabel } from "@/src/types/purview";

export const fetchSensitivityLabels = async (): Promise<SensitivityLabel[]> => {
  const response = await apiClient.get(API_ROUTES.SENSITIVITY_LABELS);
  return unwrap<SensitivityLabel[]>(response.data) ?? [];
};
