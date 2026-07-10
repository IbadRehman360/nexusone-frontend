import { useMemo } from "react";
import { Database } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { AssetSection } from "../catalog/detail/assetDetailShared";
import { useDataSourceDetail, useScanRuleSets } from "@/src/hooks/data/usePurviewDataMap";
import type { ScanRuleSet } from "@/src/types/purview";
import { formatDateTime as formatShortDateTime } from "@/src/lib/utils/dateFormat";
import { isSucceededStatus } from "@/src/lib/utils/scanStatus";

interface DataSourceDetailPanelProps {
  sourceName: string | null;
  onClose: () => void;
}

function ChipRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            key={value}
            className="px-2 py-0.5 rounded-full text-[11px] bg-(--custom-table-bg) border border-(--custom-table-border) text-foreground/80"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScanRuleSetDetails({ ruleSet }: { ruleSet: ScanRuleSet | null }) {
  if (!ruleSet) return null;
  if (ruleSet.classificationRules.length === 0 && ruleSet.fileExtensions.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      <ChipRow label="Classification Rules" values={ruleSet.classificationRules} />
      <ChipRow label="File Extensions" values={ruleSet.fileExtensions} />
    </div>
  );
}

export function DataSourceDetailPanel({ sourceName, onClose }: DataSourceDetailPanelProps) {
  const { detail, isLoading } = useDataSourceDetail(sourceName);
  const { scanRuleSets } = useScanRuleSets();

  const ruleSetByName = useMemo(() => new Map(scanRuleSets.map((rs) => [rs.name, rs])), [scanRuleSets]);

  return (
    <SlideOver
      isOpen={!!sourceName}
      onClose={onClose}
      width="md"
      title={detail?.displayName ?? "Data Map"}
      subtitle={detail ? detail.sourceType : "Purview registered source"}
      icon={<Database size={14} className="text-info-400" />}
    >
      <div className="p-5 space-y-5">
        {isLoading && <p className="text-xs text-muted-foreground">Loading source details…</p>}

        {!isLoading && detail && (
          <>
            <AssetSection className="divide-y divide-(--custom-table-border)">
              <DetailRow label="Source Type" value={detail.sourceType} />
              <DetailRow label="Collection" value={detail.collectionId} />
              <DetailRow label="Registered On" value={formatShortDateTime(detail.registeredOn)} />
              <DetailRow label="Total Scans" value={detail.scansCount} />
            </AssetSection>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Scans ({detail.scans.length})</p>
              {detail.scans.length === 0 ? (
                <p className="text-xs text-muted-foreground">No scans configured for this source.</p>
              ) : (
                <div className="space-y-2">
                  {detail.scans.map((scan) => {
                    const ruleSet = ruleSetByName.get(scan.scanRuleSet) ?? null;
                    const isSuccess = isSucceededStatus(scan.lastRunStatus);
                    return (
                      <div key={scan.scanName} className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg) p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">{scan.scanName}</p>
                          <Badge variant={isSuccess ? "success" : "error"}>{scan.lastRunStatus}</Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">Rule set: {scan.scanRuleSet || "—"}</p>
                        <p className="text-[11px] text-muted-foreground">Last run: {formatShortDateTime(scan.lastRunTime)}</p>
                        <ScanRuleSetDetails ruleSet={ruleSet} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {!isLoading && !detail && sourceName && (
          <p className="text-xs text-muted-foreground">Could not load details for this source.</p>
        )}
      </div>
    </SlideOver>
  );
}
