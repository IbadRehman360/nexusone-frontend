import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { CaSnapshotSummary, CaSnapshotDetail, CaSnapshotDiff, CaRestoreSummary } from "@/src/types/conditionalAccess";

export const fetchCaSnapshots = async (): Promise<CaSnapshotSummary[]> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.LIST);
  return unwrap<CaSnapshotSummary[]>(response.data) ?? [];
};

export const fetchCaSnapshot = async (id: string): Promise<CaSnapshotDetail | null> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.GET_BY_ID(id));
  return unwrap<CaSnapshotDetail | null>(response.data) ?? null;
};

const EMPTY_DIFF: CaSnapshotDiff = { fromSnapshotId: "", toSnapshotId: "", policies: [] };

export const fetchCaSnapshotDiff = async (from: string, to: string): Promise<CaSnapshotDiff> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.DIFF, { params: { from, to } });
  return unwrap<CaSnapshotDiff>(response.data) ?? EMPTY_DIFF;
};

export const createCaSnapshot = async (label?: string): Promise<CaSnapshotSummary> => {
  const response = await apiClient.post(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.CREATE, { label });
  return unwrap<CaSnapshotSummary>(response.data);
};

export const restoreCaSnapshot = async (id: string, policyId?: string): Promise<CaRestoreSummary> => {
  const response = await apiClient.post(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.RESTORE(id), { policyId });
  return unwrap<CaRestoreSummary>(response.data);
};

export const deleteCaSnapshot = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.CONDITIONAL_ACCESS_BACKUPS.DELETE(id));
};
