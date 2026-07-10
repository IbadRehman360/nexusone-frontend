/**
 * Sign-in Logs types — mirrors sign-in-logs.types.ts DTOs exactly.
 */

export type SignInTab = "interactive" | "nonInteractive" | "servicePrincipal" | "managedIdentity";

export type SignInStatus = "success" | "failure" | "interrupted";

/** Flattened row returned by GET /entra-id/sign-in-logs. */
export interface SignInLogRow {
  id: string;
  createdDateTime: string;
  userPrincipalName: string | null;
  userDisplayName: string | null;
  appDisplayName: string | null;
  resourceDisplayName: string | null;
  ipAddress: string | null;
  clientApp: string | null;
  correlationId: string | null;
  conditionalAccessStatus: string | null;
  city: string | null;
  countryOrRegion: string | null;
  location: string | null;
  browser: string | null;
  operatingSystem: string | null;
  status: SignInStatus;
  errorCode: number;
  failureReason: string | null;
}

/** One page returned by GET /entra-id/sign-in-logs. */
export interface SignInLogsPage {
  rows: SignInLogRow[];
  nextCursor: string | null;
}

export type SignInExportFormat = "csv" | "json";

export type SignInDateRange = "24h" | "7d" | "30d";

/** Server-side filters (everything except cursor, which the hook owns). */
export interface SignInLogFilters {
  signInType: SignInTab;
  startDate?: string;
  endDate?: string;
  user?: string;
  app?: string;
  ip?: string;
  status?: SignInStatus;
  pageSize?: number;
}
