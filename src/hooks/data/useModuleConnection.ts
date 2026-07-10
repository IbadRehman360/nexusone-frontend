import { useAuth } from "@/src/hooks/useAuth";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";

/**
 * Tri-state module-connection signal.
 *
 * - `connected` — Microsoft admin consent completed, real data flows.
 *   Pages should gate their data SOURCE on this alone: `!connected` means
 *   show sample data, covering BOTH a bare trial (never purchased, no
 *   consent possible yet) and a purchased-but-not-yet-connected module —
 *   neither state has real access, so neither should hit real APIs.
 * - `paid` — real purchase, not trial-only.
 * - `needsConnect` (`paid && !connected`) — gates the Connect BANNER only,
 *   never the data source. We only ask for consent after a real purchase
 *   (never during a bare trial), so a trial-only tenant sees sample data
 *   with no banner nagging them to connect something they haven't bought.
 */
export function useModuleConnection(module: SubscriptionModule) {
  const { user } = useAuth();
  const paid = user?.subscription?.paidModules?.includes(module) ?? false;
  const connected = user?.subscription?.connectedModules?.includes(module) ?? false;
  return {
    paid,
    connected,
    needsConnect: paid && !connected,
  };
}
