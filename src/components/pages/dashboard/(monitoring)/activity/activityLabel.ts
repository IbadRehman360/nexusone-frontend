/**
 * Turns a raw audit `action` code into a human-friendly, past-tense label for
 * the Activity Log UI — e.g. `CREATE_ENVIRONMENT_GROUP` → "Created environment
 * group", `login_sso` → "Signed in (SSO)", `INITIATE_MODULE_CONSENT_FAILED` →
 * "Initiated module consent — failed".
 *
 * The raw code stays the stable identifier (kept in the row's title tooltip and
 * the CSV export for support/greppability); this is purely how we render it to
 * a person. Codes are free-form across the codebase, so this leans on a generic
 * rule (past-tense the leading verb, lower-case the rest) plus a small set of
 * special cases that don't fit that shape.
 */

// Past-tense forms for the leading verb so the log reads as things that
// happened, not imperatives. Unknown verbs fall back to a capitalized as-is.
const VERB_PAST: Record<string, string> = {
  create: "Created",
  update: "Updated",
  edit: "Edited",
  delete: "Deleted",
  remove: "Removed",
  add: "Added",
  assign: "Assigned",
  unassign: "Unassigned",
  revoke: "Revoked",
  grant: "Granted",
  cancel: "Cancelled",
  initiate: "Initiated",
  complete: "Completed",
  start: "Started",
  stop: "Stopped",
  export: "Exported",
  import: "Imported",
  recheck: "Rechecked",
  resend: "Resent",
  retry: "Retried",
  change: "Changed",
  enable: "Enabled",
  disable: "Disabled",
  reset: "Reset",
  invite: "Invited",
  accept: "Accepted",
  approve: "Approved",
  reject: "Rejected",
  restore: "Restored",
  run: "Ran",
  sync: "Synced",
  switch: "Switched",
  transfer: "Transferred",
  connect: "Connected",
  disconnect: "Disconnected",
  trigger: "Triggered",
  register: "Registered",
  bulk: "Bulk-applied",
};

// Domain acronyms that must stay upper-cased instead of being lower-cased as a
// normal word (e.g. `Create DLP policy` → "Created DLP policy", not "…dlp…").
const ACRONYMS = new Set([
  "dlp", "csa", "ca", "sso", "mfa", "pim", "sspr", "api", "url", "dns",
  "rbac", "spn", "ip", "2fa", "totp", "d365", "bap",
]);

function renderWord(word: string): string {
  const lower = word.toLowerCase();
  return ACRONYMS.has(lower) ? lower.toUpperCase() : lower;
}

// Whole-code overrides for actions that don't fit the "verb + noun" shape.
const SPECIAL_CASES: Record<string, string> = {
  login_sso: "Signed in (SSO)",
  login: "Signed in",
  logout: "Signed out",
  mfa_verify: "Verified 2FA",
  mfa_setup: "Set up 2FA",
};

export function formatActivityAction(action: string): string {
  if (!action) return "Activity";

  const failed = /_failed$/i.test(action);
  const base = failed ? action.replace(/_failed$/i, "") : action;

  const key = base.toLowerCase();
  let label: string;

  if (SPECIAL_CASES[key]) {
    label = SPECIAL_CASES[key];
  } else {
    const words = base.split(/[_\s]+/).filter(Boolean);
    if (words.length === 0) return "Activity";
    const [first, ...rest] = words;
    const firstLower = first.toLowerCase();
    const head =
      VERB_PAST[firstLower] ??
      (ACRONYMS.has(firstLower)
        ? firstLower.toUpperCase()
        : firstLower.charAt(0).toUpperCase() + firstLower.slice(1));
    label = [head, ...rest.map(renderWord)].join(" ");
  }

  return failed ? `${label} — failed` : label;
}
