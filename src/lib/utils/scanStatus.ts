/** Canonical status classification for Purview ScanStatusRow.status strings — the backend returns free-text status values, so every consumer matches the same patterns rather than each re-deriving its own regex. */

export function isSucceededStatus(status: string): boolean {
  return /succeed|complet/i.test(status);
}

export function isFailedStatus(status: string): boolean {
  return /fail|error/i.test(status);
}

export function isRunningStatus(status: string): boolean {
  return /running|inprogress/i.test(status);
}

export function isQueuedStatus(status: string): boolean {
  return /queued|pending/i.test(status);
}

export function isCancelledStatus(status: string): boolean {
  return /cancel/i.test(status);
}

/** Text color token for a scan status — succeeded/failed/cancelled distinction used across tables. */
export function scanStatusTextColor(status: string): string {
  if (isSucceededStatus(status)) return "text-success-400";
  if (isFailedStatus(status)) return "text-error-400";
  if (isCancelledStatus(status)) return "text-warning-400";
  return "text-foreground/60";
}
