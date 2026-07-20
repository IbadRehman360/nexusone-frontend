import { reportErrorTicket, type ReportErrorResult } from "@/src/services/support/supportApi";

/**
 * Reports a user-hit error to support via the dedicated report-error endpoint,
 * which per-tenant-dedups by error code (so the same bug doesn't create
 * duplicate tickets) and embeds the reference (correlation) id + error code so
 * staff can trace exactly what broke. Attaches only non-sensitive diagnostic
 * context — reference id, error code, friendly message, what the user was
 * doing, and the page URL — NEVER tokens, passwords, or payload data. The
 * tenant + user are inferred server-side from the session.
 */
export interface ReportErrorContext {
  correlationId?: string;
  errorCode?: string;
  /** Short description of what the user was doing when it broke. */
  whatHappened?: string;
  /** The friendly message the user saw, for context. */
  errorMessage?: string;
}

export async function reportError(ctx: ReportErrorContext): Promise<ReportErrorResult> {
  return reportErrorTicket({
    correlationId: ctx.correlationId,
    errorCode: ctx.errorCode,
    errorMessage: ctx.errorMessage,
    whatHappened: ctx.whatHappened,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });
}
