import { useState } from "react";
import { Table, User } from "lucide-react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { useCatalogAsset } from "@/src/hooks/data/usePurviewCatalog";
import { prettifyClassificationId } from "@/src/lib/utils/classificationName";
import type { AtlasAssetDetail } from "@/src/types/purview";
import { ASSET_TABS, AssetSection, ClassificationBadge, uniqueClassifications, type AssetTabKey } from "./detail/assetDetailShared";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { formatDateTime as formatShortDateTime } from "@/src/lib/utils/dateFormat";

interface AssetDetailPanelProps {
  guid: string | null;
  onClose: () => void;
}

function AssetOverviewTab({ asset, onNavigate }: { asset: AtlasAssetDetail; onNavigate: (tab: AssetTabKey) => void }) {
  const sensitiveColumnCount = asset.schema.filter((col) => col.classifications.length > 0).length;

  return (
    <div className="p-5 space-y-4">
      <AssetSection className="divide-y divide-(--custom-table-border)">
        <DetailRow label="Asset name" value={asset.name} />
        <DetailRow label="Type" value={<span className="font-mono text-xs">{asset.typeName}</span>} />
        {asset.owner && <DetailRow label="Owner" value={asset.owner} />}
        <DetailRow label="Columns" value={asset.schema.length} />
        <DetailRow label="Sensitive columns" value={sensitiveColumnCount} />
        <DetailRow label="Classifications" value={asset.classifications.length} />
        {asset.createTime && <DetailRow label="Created" value={formatShortDateTime(asset.createTime)} />}
        {asset.updateTime && <DetailRow label="Last modified" value={formatShortDateTime(asset.updateTime)} />}
        {asset.description && <DetailRow label="Description" value={asset.description} />}
      </AssetSection>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => onNavigate("schema")}>
          View schema
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => onNavigate("classifications")}>
          Classifications
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => onNavigate("contacts")}>
          Contacts
        </Button>
      </div>
    </div>
  );
}

function AssetSchemaTab({ asset }: { asset: AtlasAssetDetail }) {
  if (asset.schema.length === 0) {
    return <p className="p-5 text-xs text-muted-foreground">No schema available.</p>;
  }

  return (
    <div className="p-5">
      <AssetSection className="divide-y divide-(--custom-table-border)">
        {asset.schema.map((column) => {
          const labels = uniqueClassifications(column.classifications);
          const isSensitive = labels.length > 0;
          return (
            <div key={column.name} className={`px-4 py-3 ${isSensitive ? "bg-warning/5" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-foreground">{column.name}</span>
                <span className="text-[11px] font-mono text-muted-foreground">{column.typeName}</span>
              </div>
              {isSensitive && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <ClassificationBadge key={label} label={label} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </AssetSection>
    </div>
  );
}

function AssetClassificationsTab({ asset }: { asset: AtlasAssetDetail }) {
  if (asset.classifications.length === 0) {
    return <p className="p-5 text-xs text-muted-foreground">No classifications applied.</p>;
  }

  return (
    <div className="p-5">
      <AssetSection className="divide-y divide-(--custom-table-border)">
        {asset.classifications.map((id) => (
          <div key={id} className="flex items-center gap-2.5 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">{prettifyClassificationId(id)}</p>
              <p className="text-[10px] font-mono text-muted-foreground/70">{id}</p>
            </div>
          </div>
        ))}
      </AssetSection>
    </div>
  );
}

function AssetContactsTab({ asset }: { asset: AtlasAssetDetail }) {
  if (asset.contacts.length === 0) {
    return <p className="p-5 text-xs text-muted-foreground">No contacts assigned.</p>;
  }

  return (
    <div className="p-5">
      <AssetSection className="divide-y divide-(--custom-table-border)">
        {asset.contacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                <User size={13} className="text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{contact.name}</p>
                {contact.email && <p className="text-[11px] text-muted-foreground truncate">{contact.email}</p>}
              </div>
            </div>
            <Badge variant={contact.type === "Owner" ? "info" : "neutral"}>{contact.type}</Badge>
          </div>
        ))}
      </AssetSection>
    </div>
  );
}

export function AssetDetailPanel({ guid, onClose }: AssetDetailPanelProps) {
  const [tab, setTab] = useState<AssetTabKey>("overview");
  const { asset, isLoading } = useCatalogAsset(guid);

  return (
    <SlideOver
      isOpen={!!guid}
      onClose={() => {
        onClose();
        setTab("overview");
      }}
      width="md"
      title={asset?.name ?? "Data Catalog"}
      subtitle={asset ? `${asset.typeName} · ${asset.updateTime ? `Last modified ${formatShortDateTime(asset.updateTime)}` : "Data asset"}` : undefined}
      icon={<Table size={14} className="text-info-400" />}
    >
      <div>
        {isLoading && <p className="p-5 text-xs text-muted-foreground">Loading asset details…</p>}

        {!isLoading && !asset && guid && (
          <p className="p-5 text-xs text-muted-foreground">
            Could not load this asset&apos;s details. It may have been removed from the catalog, or Purview is temporarily unavailable.
          </p>
        )}

        {!isLoading && asset && (
          <>
            <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border)">
              <Tabs variant="pill" tabs={ASSET_TABS.map((t) => ({ id: t.key, label: t.label }))} activeTab={tab} onChange={setTab} />
            </div>

            {tab === "overview" && <AssetOverviewTab asset={asset} onNavigate={setTab} />}
            {tab === "schema" && <AssetSchemaTab asset={asset} />}
            {tab === "classifications" && <AssetClassificationsTab asset={asset} />}
            {tab === "contacts" && <AssetContactsTab asset={asset} />}
          </>
        )}
      </div>
    </SlideOver>
  );
}
