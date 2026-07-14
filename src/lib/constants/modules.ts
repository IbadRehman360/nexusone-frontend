import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";
import type { ModuleConsentService } from "@/src/services/module-consent/moduleConsentApi";

/** Shared module-key → display-label map, used by HeaderStatusChip and WelcomeOnboardingModal. */
export const MODULE_LABELS: Record<string, string> = {
  entra: "Entra ID",
  pp: "Power Platform",
  purview: "Purview",
};

/** Module key -> the ServiceType the backend's module-consent endpoints expect. */
export const MODULE_TO_CONSENT_SERVICE: Record<SubscriptionModule, ModuleConsentService> = {
  entra: "ENTRA_ID",
  pp: "POWER_PLATFORM",
  purview: "PURVIEW",
};

// Fixed check order for the auto-connect chain — arbitrary but stable, so a
// customer who bought multiple modules always sees the same sequence.
const MODULE_CHAIN_ORDER: SubscriptionModule[] = ["entra", "pp", "purview"];

/**
 * First purchased-but-not-yet-connected module, in a fixed order — drives
 * the auto-consent chain (checkout success -> module-consent-callback)
 * so it knows what to redirect into next, or null when everything the
 * customer bought is already connected.
 */
export function nextUnconnectedModule(
  paidModules: string[],
  connectedModules: string[],
): SubscriptionModule | null {
  return (
    MODULE_CHAIN_ORDER.find(
      (m) => paidModules.includes(m) && !connectedModules.includes(m),
    ) ?? null
  );
}

/** e.g. ["entra","pp"], "on trial" -> "Entra ID & Power Platform on trial". */
export function formatModulesInPhase(modules: string[], suffix: string): string {
  const labels = modules.map((m) => MODULE_LABELS[m] ?? m);
  if (labels.length === 0) return "";
  if (labels.length === 1) return `${labels[0]} ${suffix}`;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]} ${suffix}`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]} ${suffix}`;
}
