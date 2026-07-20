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

/** Narrow any thrown value to an ApiError-shaped Error.
 *
 * Anything can be thrown in JS — an Error, a string, a plain object, `undefined`.
 * This guarantees a well-formed ApiError out the other side so no downstream
 * code has to defensively re-check. When a non-Error object happens to carry
 * `errorCode`/`correlationId`/`status` (e.g. a serialized error that lost its
 * prototype), those are preserved so presentation can still route on them. */
export function asApiError(error: unknown): ApiError {
  if (error instanceof Error) return error as ApiError;

  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    const message =
      typeof obj.message === "string" ? obj.message : "Something went wrong";
    const apiError = new Error(message) as ApiError;
    if (typeof obj.errorCode === "string") apiError.errorCode = obj.errorCode;
    if (typeof obj.correlationId === "string")
      apiError.correlationId = obj.correlationId;
    if (typeof obj.status === "number") apiError.status = obj.status;
    return apiError;
  }

  return new Error(
    typeof error === "string" && error ? error : "Something went wrong",
  ) as ApiError;
}
