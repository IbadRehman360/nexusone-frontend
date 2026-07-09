"use client";

import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Button } from "@/src/components/ui/inputs/Button";
import { ShieldCheck, Pencil, Trash2 } from "lucide-react";
import type { PpDlpPolicyDetail } from "@/src/types/powerPlatform";

interface DlpPolicyDetailPanelProps {
  policyId: string | null;
  detail: PpDlpPolicyDetail | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: () => void;
}

export function DlpPolicyDetailPanel({ policyId, detail, loading, onClose, onEdit, onDelete }: DlpPolicyDetailPanelProps) {
  return (
    <SlideOver
      isOpen={!!policyId}
      onClose={onClose}
      title={detail?.name}
      subtitle="Power Platform DLP policy"
      icon={<ShieldCheck size={16} className="text-info-400" />}
      width="md"
    >
      {loading || !detail ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading policy detail…</p>
      ) : (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox label="Policy name" value={detail.name} />
            <StatBox label="Scope" value={detail.isTenantWide ? "All environments" : `${detail.environments.length} environment(s)`} />
            <StatBox label="Created" value={detail.createdTime ? new Date(detail.createdTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"} />
            <StatBox label="Last modified" value={detail.lastModifiedTime ? new Date(detail.lastModifiedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Covered Environments</p>
            {detail.isTenantWide ? (
              <Badge variant="info">All environments</Badge>
            ) : detail.environments.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {detail.environments.map((env) => (
                  <Badge key={env.id} variant="info">{env.name}</Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Connector Rules</p>
            <p className="text-xs text-muted-foreground mb-2">
              Only connectors listed below are restricted. Everything else stays in the default group and can be used freely.
            </p>
            {detail.connectors.length === 0 ? (
              <span className="text-xs text-muted-foreground">No explicit connector overrides.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {detail.connectors.map((c) => (
                  <Badge key={c.name} variant={c.classification === "Blocked" ? "error" : c.classification === "Business" ? "success" : "warning"}>
                    {c.classification} · {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button variant="danger-outline" size="sm" leftIcon={<Trash2 size={13} />} onClick={onDelete}>
              Delete
            </Button>
            <Button size="sm" leftIcon={<Pencil size={13} />} onClick={() => onEdit(detail.id)}>
              Edit policy
            </Button>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
