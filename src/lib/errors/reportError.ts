import { createSupportTicket } from "@/src/services/support/supportApi";
import { getCurrentTenantId } from "@/src/lib/tenantContext";

/**
 * Files a support ticket for a user-reported error (Phase 11 "Report this
 * issue"), reusing the existing Zoho-backed support API. Attaches only
 * non-sensitive diagnostic context — correlationId, tenant, URL, timestamp,
 * and what the user was doing — NEVER tokens, passwords, or payload data.
 */
export interface ReportErrorContext {
  correlationId?: string;
  /** Short description of what the user was doing when it broke. */
  whatHappened?: string;
  /** The technical/user-facing message, for context. */
  errorMessage?: string;
}

export async function reportError(ctx: ReportErrorContext): Promise<void> {
  const tenantId = getCurrentTenantId();
  const url = typeof window !== "undefined" ? window.location.href : "unknown";

  const description = [
    ctx.whatHappened ? `What I was doing: ${ctx.whatHappened}` : null,
    ctx.errorMessage ? `Error: ${ctx.errorMessage}` : null,
    ctx.correlationId ? `Reference ID: ${ctx.correlationId}` : null,
    tenantId ? `Tenant: ${tenantId}` : null,
    `URL: ${url}`,
    `Time: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ref = ctx.correlationId ? ` [${ctx.correlationId.slice(0, 8)}]` : "";

  await createSupportTicket({
    subject: `Reported issue${ref}`,
    description,
    priority: "High",
  });
}
