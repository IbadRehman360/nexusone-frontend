import { useState } from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import type { DlpAlert } from "@/src/types/purview";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { AssetSection } from "../catalog/detail/assetDetailShared";
import { formatDateTime } from "@/src/lib/utils/dateFormat";
import { SeverityCell, StatusPill, resolvePolicyName } from "./dlpShared";

type DlpTabKey = "overview" | "detections" | "policy";

interface DlpAlertDetailPanelProps {
  alert: DlpAlert | null;
  onClose: () => void;
}

export function DlpAlertDetailPanel({ alert, onClose }: DlpAlertDetailPanelProps) {
  const [tab, setTab] = useState<DlpTabKey>("overview");
  const detail = alert?.detail;
  const detectionCount = detail?.sensitiveInfoTypes.length ?? 0;

  return (
    <SlideOver
      isOpen={!!alert}
      onClose={() => {
        onClose();
        setTab("overview");
      }}
      width="md"
      title={alert?.displayName ?? "DLP Alerts"}
      subtitle="Microsoft Purview · DLP incident"
      icon={<ShieldAlert size={14} className="text-error-400" />}
    >
      {alert && (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border)">
            <Tabs
              variant="pill"
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "detections", label: `Detections (${detectionCount})` },
                { id: "policy", label: "Policy" },
              ]}
              activeTab={tab}
              onChange={setTab}
            />
          </div>

          {tab === "overview" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <SeverityCell severity={alert.severity} />
                <StatusPill status={alert.status} />
                <span className="text-[11px] text-muted-foreground">{formatDateTime(alert.detectedAt)}</span>
              </div>

              {detail?.whatHappened && <p className="text-xs text-muted-foreground">{detail.whatHappened}</p>}

              <AssetSection className="divide-y divide-(--custom-table-border)">
                <DetailRow label="Location" value={alert.location} />
                <DetailRow label="DLP policy matched" value={resolvePolicyName(alert)} />
                <DetailRow label="User(s)" value={alert.users.length > 0 ? alert.users.join(", ") : "—"} />
                <DetailRow label="Alert ID" value={<span className="font-mono text-[11px]">{alert.id}</span>} />
                <DetailRow label="Events" value={detail?.eventCount ?? "—"} />
              </AssetSection>

              {alert.portalUrl && (
                <a
                  href={alert.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-info-400 hover:underline"
                >
                  View in Microsoft Purview
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {tab === "detections" && (
            <div className="p-5">
              {!detail || detail.sensitiveInfoTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sensitive information types detected.</p>
              ) : (
                <AssetSection className="divide-y divide-(--custom-table-border)">
                  {detail.sensitiveInfoTypes.map((sit) => (
                    <div key={sit.name} className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{sit.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {sit.count} match{sit.count === 1 ? "" : "es"}
                        {sit.confidence != null && ` · ${sit.confidence}% conf.`}
                      </p>
                    </div>
                  ))}
                </AssetSection>
              )}
            </div>
          )}

          {tab === "policy" && (
            <div className="p-5 space-y-4">
              <AssetSection className="divide-y divide-(--custom-table-border)">
                <DetailRow label="Policy" value={resolvePolicyName(alert)} />
                <DetailRow label="Matched rule" value={detail?.ruleName || "—"} />
                <DetailRow label="Actions taken" value={detail?.actions.length ? detail.actions.join(", ") : "—"} />
              </AssetSection>

              {detail && detail.recipients.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Recipients</p>
                  <AssetSection className="divide-y divide-(--custom-table-border)">
                    {detail.recipients.map((recipient) => (
                      <div key={recipient} className="px-4 py-2.5 text-xs text-foreground/80">{recipient}</div>
                    ))}
                  </AssetSection>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}
