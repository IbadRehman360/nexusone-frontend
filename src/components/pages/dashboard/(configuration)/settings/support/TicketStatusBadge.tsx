import { Badge } from "@/src/components/ui/display/Badge";
import type { TicketStatus, TicketPriority } from "@/src/services/support/supportApi";

const STATUS_VARIANT: Record<TicketStatus, "success" | "warning" | "error" | "info" | "neutral"> = {
  Open: "info",
  "On Hold": "warning",
  Escalated: "error",
  Closed: "neutral",
};

const STATUS_DOT: Record<string, string> = {
  success: "bg-success-400",
  warning: "bg-warning-400",
  error: "bg-error-400",
  info: "bg-info-400",
  neutral: "bg-muted-foreground",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const variant = STATUS_VARIANT[status] ?? "neutral";
  return (
    <Badge variant={variant}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${STATUS_DOT[variant]}`} />
      {status}
    </Badge>
  );
}

const PRIORITY_VARIANT: Record<TicketPriority, "success" | "warning" | "error" | "info"> = {
  Low: "success",
  Medium: "info",
  High: "warning",
  Urgent: "error",
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority | null }) {
  if (!priority) return <span className="text-xs text-muted-foreground/50">—</span>;
  return <Badge variant={PRIORITY_VARIANT[priority] ?? "neutral"}>{priority}</Badge>;
}
