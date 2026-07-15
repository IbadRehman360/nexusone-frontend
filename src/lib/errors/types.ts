/**
 * Shared shape of an API error as normalised by services/client.ts (Phase 11).
 * Every axios error is turned into a plain Error carrying these extra fields so
 * UI code can route on `errorCode` and surface `correlationId` to the user.
 */
export interface ApiError extends Error {
  status?: number;
  errorCode?: string;
  correlationId?: string;
  data?: unknown;
}

/** Narrow any thrown value to an ApiError-shaped Error. */
export function asApiError(error: unknown): ApiError {
  if (error instanceof Error) return error as ApiError;
  return new Error(
    typeof error === "string" ? error : "Something went wrong",
  ) as ApiError;
}
