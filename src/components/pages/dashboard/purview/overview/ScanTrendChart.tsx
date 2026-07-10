"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ScanStatusRow } from "@/src/types/purview";
import { isSucceededStatus, isFailedStatus } from "@/src/lib/utils/scanStatus";

interface DayBucket {
  label: string;
  succeeded: number;
  failed: number;
  assets: number;
}

function bucketByDay(rows: ScanStatusRow[]): DayBucket[] {
  const map = new Map<string, DayBucket>();
  for (const row of rows) {
    const d = new Date(row.timestamp);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const isSuccess = isSucceededStatus(row.status);
    const isFail = isFailedStatus(row.status);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { label: key, succeeded: isSuccess ? 1 : 0, failed: isFail ? 1 : 0, assets: row.assetsDiscovered });
    } else {
      if (isSuccess) existing.succeeded++;
      if (isFail) existing.failed++;
      existing.assets += row.assetsDiscovered;
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const [am, ad] = a.label.split("/").map(Number);
    const [bm, bd] = b.label.split("/").map(Number);
    return am !== bm ? am - bm : ad - bd;
  });
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-(--custom-table-border) rounded-lg px-3 py-2 shadow-xl text-[11px] min-w-30">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ScanTrendChart({ scanStatuses }: { scanStatuses: ScanStatusRow[] }) {
  if (scanStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-[12px] text-muted-foreground">
        No scan history available yet.
      </div>
    );
  }

  const data = bucketByDay(scanStatuses);
  const totalSucceeded = data.reduce((s, d) => s + d.succeeded, 0);
  const totalFailed = data.reduce((s, d) => s + d.failed, 0);
  const totalAssets = data.reduce((s, d) => s + d.assets, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-info-600" />
          <span className="text-muted-foreground">Succeeded</span>
          <span className="font-semibold text-foreground ml-1">{totalSucceeded}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-error-400" />
          <span className="text-muted-foreground">Failed</span>
          <span className="font-semibold text-foreground ml-1">{totalFailed}</span>
        </div>
        {totalAssets > 0 && (
          <div className="ml-auto text-muted-foreground">{totalAssets.toLocaleString()} assets discovered</div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }} barCategoryGap="50%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "rgb(var(--border))" }} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: "rgb(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgb(var(--muted) / 0.5)" }} />
          <Bar dataKey="succeeded" name="Succeeded" stackId="a" barSize={32} fill="rgb(var(--info-600))" />
          <Bar dataKey="failed" name="Failed" stackId="a" barSize={32} fill="rgb(var(--error-400))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
