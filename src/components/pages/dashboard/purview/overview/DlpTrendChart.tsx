"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DlpAlert } from "@/src/types/purview";

const TREND_DAYS = 30;
const MS_PER_DAY = 86_400_000;
const TICK_EVERY = 4;

interface DayBucket {
  label: string;
  high: number;
  medium: number;
  low: number;
}

function bucketAlertsByDay(alerts: DlpAlert[]): DayBucket[] {
  const map = new Map<string, DayBucket>();
  const now = Date.now();
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(now - i * MS_PER_DAY);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    map.set(key, { label: key, high: 0, medium: 0, low: 0 });
  }
  for (const alert of alerts) {
    const d = new Date(alert.detectedAt);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const bucket = map.get(key);
    if (!bucket) continue;
    if (alert.severity === "high") bucket.high++;
    else if (alert.severity === "medium") bucket.medium++;
    else bucket.low++;
  }
  return Array.from(map.values());
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-card border border-(--custom-table-border) rounded-lg px-3 py-2 shadow-xl text-[11px] min-w-35">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-(--custom-table-border) flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{total}</span>
      </div>
    </div>
  );
}

const SERIES = [
  { key: "high", label: "High severity", color: "rgb(var(--error-400))" },
  { key: "medium", label: "Medium", color: "rgb(var(--warning-400))" },
  { key: "low", label: "Low", color: "rgb(var(--info-400))" },
] as const;

export function DlpTrendChart({ alerts }: { alerts: DlpAlert[] }) {
  const data = bucketAlertsByDay(alerts);
  const hasData = alerts.length > 0;

  const totals = { high: 0, medium: 0, low: 0 };
  for (const a of alerts) {
    if (a.severity === "high") totals.high++;
    else if (a.severity === "medium") totals.medium++;
    else totals.low++;
  }

  const ticks = data.filter((_, i) => i % TICK_EVERY === 0).map((d) => d.label);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 text-[11px]">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold text-foreground ml-1">{totals[s.key]}</span>
          </div>
        ))}
        {!hasData && <span className="ml-auto text-[11px] text-muted-foreground">No incidents in last 30 days</span>}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "rgb(var(--border))" }} ticks={ticks} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: "rgb(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgb(var(--muted-foreground))", strokeDasharray: "3 3", fill: "transparent" }} />
          <Legend verticalAlign="bottom" height={28} iconType="plainline" wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
          {SERIES.filter((s) => totals[s.key] > 0).map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: s.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
