import type { DlpAlert } from "@/src/types/purview";

/**
 * Curated sample DLP alerts — Purview's ONLY per-tenant-consent-dependent
 * data path (see purview.service.ts). Every other Purview page (data-map,
 * catalog, classification, sensitivity, governance, cost-billing,
 * integrations) is backed by NexusOne-owned Azure resources, not per-tenant
 * consent, and must NOT be gated by module-connection status — those stay
 * exactly as they are regardless of whether this module is "connected."
 */
export const SAMPLE_DLP_ALERTS: DlpAlert[] = [
  {
    id: "sample-dlp-1",
    displayName: "Credit card number shared externally",
    severity: "high",
    status: "new",
    detectedAt: "2026-07-08T14:32:00Z",
    users: ["priya.natarajan@contoso.com"],
    location: "Exchange",
  },
  {
    id: "sample-dlp-2",
    displayName: "US SSN detected in shared file",
    severity: "medium",
    status: "inProgress",
    detectedAt: "2026-07-05T09:14:00Z",
    users: ["marcus.webb@contoso.com"],
    location: "SharePoint",
  },
  {
    id: "sample-dlp-3",
    displayName: "Bulk download of confidential-labeled files",
    severity: "low",
    status: "resolved",
    detectedAt: "2026-06-29T18:02:00Z",
    users: ["avery.chen@contoso.com"],
    location: "OneDrive",
  },
];
