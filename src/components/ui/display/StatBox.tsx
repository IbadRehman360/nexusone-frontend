export function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 font-medium">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
