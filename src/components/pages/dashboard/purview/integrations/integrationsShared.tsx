import type { IntegrationService } from "@/src/types/purview";

export const INTEGRATION_STATUS_DOT: Record<IntegrationService["status"], string> = {
  healthy: "bg-success-400",
  degraded: "bg-warning-400",
  unavailable: "bg-error-400",
  unconfigured: "bg-muted-foreground",
};

export const INTEGRATION_STATUS_LABELS: Record<IntegrationService["status"], string> = {
  healthy: "Connected",
  degraded: "Partial",
  unavailable: "Unavailable",
  unconfigured: "Not set up",
};

export function StatusCell({ status }: { status: IntegrationService["status"] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${INTEGRATION_STATUS_DOT[status]}`} />
      <span className="text-xs text-foreground/80">{INTEGRATION_STATUS_LABELS[status]}</span>
    </span>
  );
}

const NAME_ABBREVIATION: Record<string, string> = {
  purview: "PV",
  "log-analytics": "LA",
  adf: "ADF",
  "power-bi": "PBI",
  defender: "DEF",
};

export function ServiceAbbreviation({ name }: { name: string }) {
  const abbr = NAME_ABBREVIATION[name] ?? name.slice(0, 2).toUpperCase();
  return (
    <span className="w-8 h-8 rounded-lg bg-(--custom-table-bg) border border-(--custom-table-border) flex items-center justify-center text-[10px] font-bold text-foreground/70 shrink-0">
      {abbr}
    </span>
  );
}
