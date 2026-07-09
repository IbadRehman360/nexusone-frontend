import { Calendar, History, RotateCcw } from "lucide-react";
import type { TabItem } from "@/src/components/ui/navigation/Tabs";

export type BackupTabId = "schedule" | "system" | "history";

export const BACKUP_TABS: TabItem<BackupTabId>[] = [
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "system", label: "System Backup", icon: History },
  { id: "history", label: "Restore History", icon: RotateCcw },
];
