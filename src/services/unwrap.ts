/**
 * The backend wraps every response as { success, message, data }
 * (NestJS's ApiResponse.success() helper). Use this wherever a service
 * function needs a single object/value back (not a list — normalizeResponse
 * in environmentApi.ts already handles the list-shaped variants).
 */
export function unwrap<T>(payload: unknown): T {
  const obj = payload as { success?: boolean; data?: T } | null | undefined;
  if (obj && typeof obj === "object" && "data" in obj) {
    return obj.data as T;
  }
  return payload as T;
}
