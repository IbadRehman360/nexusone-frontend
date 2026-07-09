import { useMemo } from "react";
import type { EnrichedBackup, BackupSchedule } from "@/src/types/powerPlatform";

type HealthColor = "neutral" | "red" | "green";

export interface BackupStats {
  total: number;
  pending: number;
  health: { label: string; subtitle: string; color: HealthColor };
  cadence: string;
  nextRunShort: string;
  nextRunFull: string;
}

const CADENCE_LABEL: Record<string, string> = {
  "0 0 * * *": "Every day",
  "0 0 * * 0": "Every week",
  "0 0 1 * *": "Every month",
};

function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60_000);
  if (mins < 60) return diffMs >= 0 ? `in ${mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return diffMs >= 0 ? `in ${hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return diffMs >= 0 ? `in ${days}d` : `${days}d ago`;
}

/** Derives the summary stats shown in the Backups & Restore stat cards. */
export function useBackupStats(manualBackups: EnrichedBackup[], schedules: BackupSchedule[]): BackupStats {
  return useMemo(() => {
    const succeeded = manualBackups.filter((b) => b.bapStatus === "Succeeded").length;
    const failed = manualBackups.filter((b) => b.bapStatus === "Failed").length;
    const pending = manualBackups.filter((b) => b.bapStatus === "Pending").length;
    const total = manualBackups.length;

    const health: BackupStats["health"] =
      total === 0
        ? { label: "No backups", subtitle: "none created yet", color: "neutral" }
        : failed > 0
          ? { label: "Degraded", subtitle: `${failed} of ${total} failed`, color: "red" }
          : { label: "Healthy", subtitle: `${succeeded} of ${total} succeeded`, color: "green" };

    const schedule = schedules[0];
    const cadence = schedule ? CADENCE_LABEL[schedule.cronExpression] ?? schedule.cronExpression : "None";

    return {
      total,
      pending,
      health,
      cadence,
      nextRunShort: schedule ? relativeTime(schedule.nextRunAt) : "—",
      nextRunFull: schedule ? new Date(schedule.nextRunAt).toLocaleString() : "no schedule set",
    };
  }, [manualBackups, schedules]);
}
