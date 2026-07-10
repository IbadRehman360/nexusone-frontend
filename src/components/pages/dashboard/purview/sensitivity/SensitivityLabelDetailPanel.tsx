import { Tag } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import type { SensitivityLabel } from "@/src/types/purview";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { AssetSection } from "../catalog/detail/assetDetailShared";
import { formatAppliesTo, labelColor } from "./sensitivityShared";

interface SensitivityLabelDetailPanelProps {
  label: SensitivityLabel | null;
  onClose: () => void;
}

export function SensitivityLabelDetailPanel({ label, onClose }: SensitivityLabelDetailPanelProps) {
  return (
    <SlideOver
      isOpen={!!label}
      onClose={onClose}
      width="md"
      title={label?.name ?? "Sensitivity Labels"}
      subtitle={label ? label.tooltip || label.description || "Microsoft Information Protection label" : undefined}
      icon={<Tag size={14} style={{ color: labelColor(label?.color ?? "") }} />}
    >
      {label && (
        <div className="p-5 space-y-5">
          <AssetSection className="divide-y divide-(--custom-table-border)">
            <DetailRow label="Name" value={label.name} />
            <DetailRow
              label="Color"
              value={
                label.color ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: labelColor(label.color) }} />
                    <span className="font-mono text-xs">{label.color}</span>
                  </span>
                ) : (
                  "Default"
                )
              }
            />
            <DetailRow label="Priority" value={label.priority} />
            <DetailRow label="Status" value={label.isActive ? "Active" : "Inactive"} />
            <DetailRow label="Applies to" value={formatAppliesTo(label.appliesTo)} />
            <DetailRow label="Sub-labels" value={label.subLabels.length} />
          </AssetSection>

          {(label.tooltip || label.description) && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Description</p>
              <p className="text-xs text-muted-foreground">{label.tooltip || label.description}</p>
            </div>
          )}

          {label.subLabels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Sub-labels ({label.subLabels.length})</p>
              <AssetSection className="divide-y divide-(--custom-table-border)">
                {label.subLabels.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: labelColor(sub.color) }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{sub.name}</p>
                        {(sub.tooltip || sub.description) && (
                          <p className="text-[11px] text-muted-foreground truncate">{sub.tooltip || sub.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={sub.isActive ? "success" : "neutral"}>{sub.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
              </AssetSection>
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}
