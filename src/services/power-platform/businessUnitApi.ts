import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { BusinessUnit } from "@/src/types/powerPlatform";

export interface CreateBusinessUnitPayload {
  environmentUrl: string;
  parentBusinessUnitId: string;
  name: string;
}

export const createBusinessUnit = async (payload: CreateBusinessUnitPayload): Promise<BusinessUnit> => {
  const response = await apiClient.post(API_ROUTES.BUSINESS_UNITS.CREATE, payload);
  return unwrap<BusinessUnit>(response.data);
};
