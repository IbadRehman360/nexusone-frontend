import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { ImportJob } from "@/src/types/powerPlatform";

export interface ImportTable {
  logicalName: string;
  entitySetName: string;
  displayName: string;
}

export interface ImportColumn {
  logicalName: string;
  displayName: string;
  type: string;
}

export interface ImportColumnMapping {
  column: string;
  target: string;
}

export interface RunImportPayload {
  environmentUrl: string;
  targetTable: string;
  targetLogicalName: string;
  fileName: string;
  csvContent: string;
  mapping: ImportColumnMapping[];
}

export const getImportTables = async (environmentUrl: string): Promise<ImportTable[]> => {
  const response = await apiClient.get(API_ROUTES.IMPORT.TABLES, { params: { environmentUrl } });
  return unwrap<{ tables: ImportTable[] }>(response.data)?.tables ?? [];
};

export const getImportColumns = async (environmentUrl: string, table: string): Promise<ImportColumn[]> => {
  const response = await apiClient.get(API_ROUTES.IMPORT.COLUMNS, { params: { environmentUrl, table } });
  return unwrap<{ columns: ImportColumn[] }>(response.data)?.columns ?? [];
};

export const runImport = async (payload: RunImportPayload): Promise<ImportJob> => {
  const response = await apiClient.post(API_ROUTES.IMPORT.RUN, payload);
  return unwrap<{ job: ImportJob }>(response.data).job;
};

export const getImportJobs = async (): Promise<ImportJob[]> => {
  const response = await apiClient.get(API_ROUTES.IMPORT.JOBS);
  return unwrap<{ jobs: ImportJob[] }>(response.data)?.jobs ?? [];
};
