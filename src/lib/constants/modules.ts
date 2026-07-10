/** Shared module-key → display-label map, used by HeaderStatusChip and WelcomeOnboardingModal. */
export const MODULE_LABELS: Record<string, string> = {
  entra: "Entra ID",
  pp: "Power Platform",
  purview: "Purview",
};

/** e.g. ["entra","pp"], "on trial" -> "Entra ID & Power Platform on trial". */
export function formatModulesInPhase(modules: string[], suffix: string): string {
  const labels = modules.map((m) => MODULE_LABELS[m] ?? m);
  if (labels.length === 0) return "";
  if (labels.length === 1) return `${labels[0]} ${suffix}`;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]} ${suffix}`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]} ${suffix}`;
}
