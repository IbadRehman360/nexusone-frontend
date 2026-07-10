/** Formats a millisecond duration as "Xm Ys" (or "Ys" under a minute). Used wherever a scan/job duration is displayed. */
export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
