import { Filter, ShieldAlert, Database } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { useClassificationUsage } from "@/src/hooks/data/usePurviewCatalog";
import { prettifyClassificationId } from "@/src/lib/utils/classificationName";
import { AssetSection } from "../catalog/detail/assetDetailShared";
import { CategoryBadge, ClassifierTypeBadge } from "./classificationBadges";
import type { AtlasSit } from "@/src/types/purview";

interface ClassificationDetailPanelProps {
  classification: AtlasSit | null;
  onClose: () => void;
  onSelectAsset: (guid: string) => void;
}

export function ClassificationDetailPanel({ classification, onClose, onSelectAsset }: ClassificationDetailPanelProps) {
  const { usage, isLoading } = useClassificationUsage(classification?.name ?? null);
  const assets = usage?.assets ?? [];

  return (
    <SlideOver
      isOpen={!!classification}
      onClose={onClose}
      width="md"
      title={classification ? classification.description || prettifyClassificationId(classification.name) : "Data Classification"}
      subtitle={classification?.name}
      icon={<Filter size={14} className="text-info-400" />}
    >
      {classification && (
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <CategoryBadge category={classification.category} />
            <ClassifierTypeBadge type={classification.type} />
          </div>
          {classification.description && (
            <p className="text-xs text-muted-foreground">{classification.description}</p>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} className="text-warning-400" />
              <p className="text-xs font-semibold text-foreground">
                Detected in {usage?.count ?? 0} asset{usage?.count === 1 ? "" : "s"}
              </p>
            </div>

            {isLoading && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-11 rounded-lg bg-muted/15 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && assets.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Not yet detected in any scanned asset. Run a Purview scan on a data source that contains this type for it to appear here.
              </p>
            )}

            {!isLoading && assets.length > 0 && (
              <AssetSection className="divide-y divide-(--custom-table-border)">
                {assets.map((asset) => (
                  <button
                    key={asset.guid}
                    onClick={() => onSelectAsset(asset.guid)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                  >
                    <Database size={14} className="text-info-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {asset.sourceName ? `${asset.typeName} · ${asset.sourceName}` : asset.typeName}
                      </p>
                    </div>
                  </button>
                ))}
              </AssetSection>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}
