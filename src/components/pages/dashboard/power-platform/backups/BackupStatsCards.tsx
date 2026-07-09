"use client";

import { Archive, ShieldCheck, Repeat, CalendarClock } from "lucide-react";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { BackupStats } from "@/src/hooks/data/useBackupStats";

interface BackupStatsCardsProps {
  stats: BackupStats;
  isLoading: boolean;
  hasEnvironment: boolean;
}

export function BackupStatsCards({ stats, isLoading, hasEnvironment }: BackupStatsCardsProps) {
  const loading = isLoading || !hasEnvironment;

  return (
    <StatsCarousel
      cards={[
        {
          title: "Total Backups",
          value: isLoading ? "—" : stats.total,
          subtitle: stats.pending > 0 ? `${stats.pending} pending` : "all backups",
          icon: Archive,
          color: "blue",
          isLoading: loading,
        },
        {
          title: "Backup Health",
          value: isLoading ? "—" : stats.health.label,
          subtitle: stats.health.subtitle,
          icon: ShieldCheck,
          color: stats.health.color,
          isLoading: loading,
        },
        {
          title: "Backup Schedule",
          value: isLoading ? "—" : stats.cadence,
          subtitle: stats.cadence === "None" ? "set one to automate" : "recurring cadence",
          icon: Repeat,
          color: "purple",
          isLoading: loading,
        },
        {
          title: "Next Scheduled",
          value: isLoading ? "—" : stats.nextRunShort,
          subtitle: stats.nextRunFull,
          icon: CalendarClock,
          color: "blue",
          isLoading: loading,
        },
      ]}
    />
  );
}
