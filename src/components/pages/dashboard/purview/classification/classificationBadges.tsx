import { Badge } from "@/src/components/ui/display/Badge";
import type { ClassifierType } from "@/src/types/purview";

const CATEGORY_VARIANT: Record<string, "success" | "info" | "purple" | "error" | "neutral"> = {
  Financial: "success",
  Government: "info",
  Personal: "purple",
  Health: "error",
  Other: "neutral",
};

const TYPE_VARIANT: Record<ClassifierType, "info" | "purple"> = {
  "Built-in": "info",
  Custom: "purple",
};

export function CategoryBadge({ category }: { category: string }) {
  if (!category) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant={CATEGORY_VARIANT[category] ?? "neutral"}>{category}</Badge>;
}

export function ClassifierTypeBadge({ type }: { type: ClassifierType }) {
  return <Badge variant={TYPE_VARIANT[type]}>{type}</Badge>;
}
