import apiClient from "../client";
import { DATAVERSE_LOGS_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export interface ChangedAttribute {
  field: string;
  fieldDisplayName?: string;
  oldValue: string;
  newValue: string;
}

export interface DataverseLog {
  auditid: string;
  createdon: string;
  formattedDate?: string;
  userName: string;
  userEmail?: string;
  userType?: string;
  operationName: string;
  objectTypeName: string;
  objecttypecode: string;
  objectName?: string;
  operation: number;
  action: number;
  actionName?: string;
  description?: string;
  changedAttributes?: ChangedAttribute[];
  environmentUrl?: string;
  environmentName?: string;
  recordUrl?: string;
  category?: string;
  severity?: string;
  source?: string;
}

export interface DataverseLogsResponse {
  logs: DataverseLog[];
  pagination: { top: number; skip: number; hasMore: boolean };
  environment: { url: string; name: string };
}

export interface DataverseLogsFilters {
  environmentUrl: string;
  startDate?: string;
  endDate: string;
  top?: number;
  operation?: number;
  includeSystemAccess?: boolean;
}

export const getDataverseLogs = async (filters: DataverseLogsFilters): Promise<DataverseLogsResponse> => {
  const response = await apiClient.get("/dataverse-logs", { params: filters });
  return unwrap<DataverseLogsResponse>(response.data);
};
