/**
 * Centralized, null-safe date/time formatting — every module previously
 * hand-rolled its own guarded `new Date(value)` + `Number.isNaN` +
 * `toLocaleDateString`/`toLocaleString` combo (15+ near-identical copies
 * across entra-id and purview). These four cover every format actually used.
 */

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "Jul 9, 2026". */
export function formatDate(value: string | null | undefined): string {
  const date = parse(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** e.g. "Jul 9, 2026, 11:47 PM". */
export function formatDateTime(value: string | null | undefined): string {
  const date = parse(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** e.g. "Jul 9, 11:47 PM" — omits the year, for recent-activity feeds where it's implied. */
export function formatActivityTime(value: string | null | undefined): string {
  const date = parse(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
