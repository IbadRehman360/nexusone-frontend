import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { EntraTierInfo } from "@/src/types/licenses";

const FREE_TIER: EntraTierInfo = { tier: "free", hasP1: false, hasP2: false };

export const fetchEntraTier = async (): Promise<EntraTierInfo> => {
  const response = await apiClient.get(API_ROUTES.LICENSES.GET_TIER);
  return unwrap<EntraTierInfo>(response.data) ?? FREE_TIER;
};
