import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { BackupListResponse, EnrichedBackup, BackupSchedule, BackupDetail, RestoreRun } from "@/src/types/powerPlatform";

export const fetchBackups = async (environmentId: string): Promise<BackupListResponse> => {
  const response = await apiClient.get(API_ROUTES.BACKUPS.LIST, { params: { environmentId } });
  return unwrap<BackupListResponse>(response.data);
};

export const createBackup = async (environmentId: string, environmentName: string, notes?: string) => {
  const response = await apiClient.post(API_ROUTES.BACKUPS.CREATE, { environmentId, environmentName, notes });
  return unwrap<{ runId: string; bapBackupId: string }>(response.data);
};

export const restoreBackup = async (backup: EnrichedBackup, environmentId: string, targetEnvironmentName: string) => {
  if (backup.runId) {
    const response = await apiClient.post(API_ROUTES.BACKUPS.RESTORE(backup.runId), { targetEnvironmentName });
    return unwrap(response.data);
  }
  const response = await apiClient.post(API_ROUTES.BACKUPS.RESTORE_BAP(backup.bapBackupId), { environmentId, targetEnvironmentName });
  return unwrap(response.data);
};

export const deleteBackup = async (backup: EnrichedBackup, environmentId: string) => {
  if (backup.runId) {
    await apiClient.delete(API_ROUTES.BACKUPS.DELETE(backup.runId));
    return;
  }
  await apiClient.delete(API_ROUTES.BACKUPS.DELETE_BAP(backup.bapBackupId), { data: { environmentId } });
};

export const listBackupSchedules = async (environmentId: string): Promise<BackupSchedule[]> => {
  const response = await apiClient.get(API_ROUTES.BACKUPS.SCHEDULES_LIST, { params: { environmentId } });
  return unwrap<{ schedules: BackupSchedule[] }>(response.data)?.schedules ?? [];
};

export const createBackupSchedule = async (environmentId: string, environmentName: string, cronExpression: string): Promise<BackupSchedule> => {
  const response = await apiClient.post(API_ROUTES.BACKUPS.SCHEDULE_CREATE, { environmentId, environmentName, cronExpression });
  return unwrap<BackupSchedule>(response.data);
};

export const deleteBackupSchedule = async (id: string) => {
  await apiClient.delete(API_ROUTES.BACKUPS.SCHEDULE_DELETE(id));
};

export const fetchBackupDetail = async (bapBackupId: string, environmentId: string): Promise<BackupDetail> => {
  const response = await apiClient.get(API_ROUTES.BACKUPS.DETAIL(bapBackupId), { params: { environmentId } });
  return unwrap<BackupDetail>(response.data);
};

export const systemRestore = async (environmentId: string, restorePointDateTime: string, targetEnvironmentName: string) => {
  const response = await apiClient.post(API_ROUTES.BACKUPS.SYSTEM_RESTORE, { environmentId, restorePointDateTime, targetEnvironmentName });
  return unwrap<{ initiated: boolean; restorePointDateTime: string; restoreRunId: string }>(response.data);
};

export const listRestores = async (environmentId: string): Promise<RestoreRun[]> => {
  const response = await apiClient.get(API_ROUTES.BACKUPS.RESTORES_LIST, { params: { environmentId } });
  return unwrap<{ restores: RestoreRun[] }>(response.data)?.restores ?? [];
};

export const syncBackupStatus = async (runId: string) => {
  const response = await apiClient.post(API_ROUTES.BACKUPS.SYNC(runId));
  return unwrap<{ synced: boolean }>(response.data);
};
