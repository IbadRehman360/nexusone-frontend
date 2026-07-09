"use client";

import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Button } from "@/src/components/ui/inputs/Button";
import { operationConfigFor } from "./operationConfig";
import type { DataverseLog } from "@/src/services/dataverseLogs/dataverseLogsApi";
import { History, ExternalLink, ArrowRight } from "lucide-react";

interface LogDetailSlideOverProps {
  log: DataverseLog | null;
  onClose: () => void;
}

export function LogDetailSlideOver({ log, onClose }: LogDetailSlideOverProps) {
  const cfg = log ? operationConfigFor(log.operation) : null;

  return (
    <SlideOver
      isOpen={!!log}
      onClose={onClose}
      title={log?.objectTypeName}
      subtitle={log?.objectName ?? "Dataverse audit record"}
      icon={<History size={16} className="text-info-400" />}
      width="md"
    >
      {!log || !cfg ? null : (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox label="Operation" value={<Badge variant={cfg.badgeVariant}><cfg.icon size={11} className="mr-1 -ml-0.5 inline" />{cfg.label}</Badge>} />
            <StatBox label="Entity" value={log.objectTypeName} />
            <StatBox label="User" value={log.userName} />
            <StatBox label="Time" value={new Date(log.createdon).toLocaleString()} />
          </div>

          {log.userEmail && (
            <StatBox label="User email" value={log.userEmail} />
          )}

          {log.description && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Summary</p>
              <p className="text-xs text-foreground">{log.description}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Changes {log.changedAttributes && log.changedAttributes.length > 0 ? `(${log.changedAttributes.length})` : ""}
            </p>
            {!log.changedAttributes || log.changedAttributes.length === 0 ? (
              <p className="text-xs text-muted-foreground/60">No field changes recorded for this event.</p>
            ) : (
              <div className="space-y-2">
                {log.changedAttributes.map((c, i) => (
                  <div key={`${c.field}-${i}`} className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5">{c.fieldDisplayName ?? c.field}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex-1 min-w-0 truncate text-error-400/90 line-through">{c.oldValue || "—"}</span>
                      <ArrowRight size={12} className="text-muted-foreground/50 shrink-0" />
                      <span className="flex-1 min-w-0 truncate text-success-400">{c.newValue || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {log.recordUrl && (
            <Button variant="outline" size="sm" className="w-full justify-center" rightIcon={<ExternalLink size={13} />} onClick={() => window.open(log.recordUrl, "_blank")}>
              View Record in Dataverse
            </Button>
          )}
        </div>
      )}
    </SlideOver>
  );
}
