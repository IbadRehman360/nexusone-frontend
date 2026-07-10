/**
 * A single label/value row, meant to be stacked inside a bordered box
 * (`rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4`)
 * — each row's own bottom border acts as the divider between rows.
 */
export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--custom-table-border) py-2 last:border-0 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 wrap-break-word text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
