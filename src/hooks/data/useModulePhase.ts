import { useAuth } from "@/src/hooks/useAuth";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";
import { MODULE_LABELS } from "@/src/lib/constants/modules";

export type ModulePhase = "connected" | "trialing" | "locked";

/**
 * The single source of truth for a module's sample-vs-real state, driven by
 * `SubscriptionView.paidModules`/`connectedModules`/`moduleTrialGrants`:
 * - `connected` — completed Microsoft admin consent, real data, actions enabled.
 * - `trialing` — purchased (in `paidModules`) but not yet connected — still
 *   sample data, actions stay visually locked (see plan's scope decision —
 *   a genuinely-clickable action against sample data would either fake a
 *   write or silently fail with no real Graph/Dataverse connection behind
 *   it), but the tooltip and a `ModuleConnectBanner` steer the user to
 *   Connect instead of Purchase.
 * - `locked` — neither purchased nor connected (look-around window, or
 *   fully locked after it expires and ModuleGuard hasn't already hidden
 *   the page).
 *
 * `real`/`locked` are kept as booleans (in addition to `phase`) so existing
 * callers built against increment 1's `{ real, locked }` shape don't need to
 * change — `locked` is true for both `trialing` and `locked` phases.
 */
export function useModulePhase(module: SubscriptionModule): {
  phase: ModulePhase;
  real: boolean;
  locked: boolean;
  lockedTooltip: string | undefined;
} {
  const { user } = useAuth();
  const subscription = user?.subscription;
  const connected = subscription?.connectedModules?.includes(module) ?? false;
  const paid = subscription?.paidModules?.includes(module) ?? false;
  const everTrialed = subscription?.moduleTrialGrants?.includes(module) ?? false;

  const phase: ModulePhase = connected ? "connected" : paid ? "trialing" : "locked";
  const label = MODULE_LABELS[module] ?? module;

  const lockedTooltip =
    phase === "connected"
      ? undefined
      : phase === "trialing"
        ? "Connect your Microsoft tenant to unlock"
        : everTrialed
          ? `Purchase ${label} to unlock`
          : `Start a trial of ${label} to unlock`;

  return { phase, real: phase === "connected", locked: phase !== "connected", lockedTooltip };
}
