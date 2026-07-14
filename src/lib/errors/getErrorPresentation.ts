import { asApiError } from "./types";

/**
 * Translates a raw error into what the user should see (Phase 11). Routes on the
 * backend's stable `errorCode` (see backend error-codes.ts), falling back to
 * HTTP status. Microsoft Graph failures get tailored copy per the plan: rate
 * limiting, permission, and Microsoft-side outages read differently from
 * our-side errors. `retryable` tells the UI whether to offer "Try again".
 */
export type ErrorSeverity = "error" | "warning" | "info";

export interface ErrorPresentation {
  title: string;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  correlationId?: string;
}

export function getErrorPresentation(error: unknown): ErrorPresentation {
  const err = asApiError(error);
  const base = { correlationId: err.correlationId };

  switch (err.errorCode) {
    // ── Microsoft Graph ────────────────────────────────────────────────────
    case "RATE_LIMITED":
      return {
        ...base,
        title: "Microsoft 365 is busy",
        message: "Too many requests right now. Please try again shortly.",
        severity: "warning",
        retryable: true,
      };
    case "MS_API_ERROR":
      return {
        ...base,
        title: "Microsoft 365 is having issues",
        message:
          "This is a problem on Microsoft's end, not yours. Please try again in a few minutes.",
        severity: "warning",
        retryable: true,
      };
    case "MS_FORBIDDEN":
      return {
        ...base,
        title: "Permission needed in Microsoft 365",
        message:
          "Ask your Microsoft 365 administrator to grant this permission. Retrying won't help until then.",
        severity: "error",
        retryable: false,
      };
    case "AZURE_TOKEN_EXPIRED":
    case "CONSENT_REVOKED":
    case "SHARED_APP_CONSENT_REQUIRED":
      return {
        ...base,
        title: "Reconnect Microsoft 365",
        message:
          "Your Microsoft 365 connection needs to be refreshed or re-approved by an admin.",
        severity: "error",
        retryable: false,
      };

    // ── Auth / access ────────────────────────────────────────────────────────
    case "UNAUTHENTICATED":
    case "TOKEN_EXPIRED":
    case "TOKEN_INVALID":
      return {
        ...base,
        title: "Your session expired",
        message: "Please sign in again to continue.",
        severity: "error",
        retryable: false,
      };
    case "CAPABILITY_DENIED":
    case "PLATFORM_ADMIN_REQUIRED":
      return {
        ...base,
        title: "You don't have access",
        message: "You don't have permission to do this. Contact your administrator if you need it.",
        severity: "error",
        retryable: false,
      };

    // ── Input / conflict ─────────────────────────────────────────────────────
    case "VALIDATION_FAILED":
      return {
        ...base,
        title: "Please check your input",
        message: err.message || "Some of the details provided aren't valid.",
        severity: "error",
        retryable: false,
      };
    case "CONFLICT":
      return {
        ...base,
        title: "That already exists",
        message: err.message || "This conflicts with something that already exists.",
        severity: "error",
        retryable: false,
      };
  }

  // ── Fall back to HTTP status ───────────────────────────────────────────────
  const status = err.status ?? 0;
  if (status === 0) {
    return {
      ...base,
      title: "Connection problem",
      message: "We couldn't reach the server. Check your connection and try again.",
      severity: "warning",
      retryable: true,
    };
  }
  if (status >= 500) {
    return {
      ...base,
      title: "Something went wrong on our end",
      message: "An unexpected error occurred. Please try again — if it keeps happening, report it.",
      severity: "error",
      retryable: true,
    };
  }
  return {
    ...base,
    title: "Something went wrong",
    message: err.message || "Please try again.",
    severity: "error",
    retryable: false,
  };
}
