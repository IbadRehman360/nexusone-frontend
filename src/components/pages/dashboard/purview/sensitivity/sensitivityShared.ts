import type { SensitivityLabel } from "@/src/types/purview";

export function flattenLabels(labels: SensitivityLabel[]): SensitivityLabel[] {
  return labels.flatMap((label) => [label, ...label.subLabels]);
}

export function formatAppliesTo(appliesTo: string[]): string {
  if (appliesTo.length === 0) return "Not specified";
  return appliesTo.map((value) => value.charAt(0).toUpperCase() + value.slice(1)).join(", ");
}

export function labelColor(color: string): string {
  return color || "rgb(var(--accent-indigo-600))";
}
