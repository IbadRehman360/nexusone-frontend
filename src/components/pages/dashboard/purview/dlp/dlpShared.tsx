import { Badge } from "@/src/components/ui/display/Badge";
import type { DlpAlert, DlpSeverity, DlpStatus } from "@/src/types/purview";
import { DLP_SEVERITY_DOT, DLP_SEVERITY_LABELS, DLP_STATUS_VARIANT, DLP_STATUS_LABELS } from "./dlpConstants";

export function SeverityCell({ severity }: { severity: DlpSeverity }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${DLP_SEVERITY_DOT[severity]}`} />
      <span className="text-xs text-foreground/80">{DLP_SEVERITY_LABELS[severity]}</span>
    </span>
  );
}

export function StatusPill({ status }: { status: DlpStatus }) {
  return <Badge variant={DLP_STATUS_VARIANT[status]}>{DLP_STATUS_LABELS[status]}</Badge>;
}

export function resolvePolicyName(alert: DlpAlert): string {
  return alert.detail?.policyName?.trim() || "—";
}

const WORKLOAD_MAP: Record<string, string> = {
  exchangeonline: "Exchange",
  exchange: "Exchange",
  sharepointonline: "SharePoint",
  sharepoint: "SharePoint",
  onedrive: "OneDrive",
  teams: "Microsoft Teams",
};

export function cleanWorkload(location: string): string {
  const lower = location.toLowerCase();
  for (const [key, label] of Object.entries(WORKLOAD_MAP)) {
    if (lower.includes(key)) return label;
  }
  return location || "Microsoft 365";
}
