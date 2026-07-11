import { ShieldAlert } from "lucide-react";
import { Badge } from "@/src/components/ui/display/Badge";
import { prettifyClassificationId } from "@/src/lib/utils/classificationName";

export type AssetTabKey = "overview" | "schema" | "classifications" | "contacts";

export const ASSET_TABS: { key: AssetTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "schema", label: "Schema" },
  { key: "classifications", label: "Classifications" },
  { key: "contacts", label: "Contacts" },
];

export function uniqueClassifications(raw: string[]): string[] {
  return [...new Set(raw.map(prettifyClassificationId))];
}

export function ClassificationBadge({ label }: { label: string }) {
  return (
    <Badge variant="warning">
      <ShieldAlert size={10} className="mr-1" />
      {label}
    </Badge>
  );
}

export function AssetSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 ${className}`}>
      {children}
    </div>
  );
}
