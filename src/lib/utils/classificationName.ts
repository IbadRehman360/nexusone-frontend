/**
 * Turns a raw Purview classification / SIT id into a readable Title Case name,
 * preserving the full path so region-specific types stay distinct
 * (e.g. MICROSOFT.FINANCIAL.US.BANK_ACCOUNT_NUMBER ->
 * "Financial Us Bank Account Number", vs the AUSTRALIA variant).
 */
export function prettifyClassificationId(id: string): string {
  return id
    .replace(/^MICROSOFT\./, "")
    .replace(/[._]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
