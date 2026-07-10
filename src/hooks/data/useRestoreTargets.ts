import { useMemo } from "react";
import { useEnvironments } from "./useEnvironments";

export interface RestoreTargetOption {
  value: string;
  label: string;
  name: string;
}

// Microsoft's supported source → target environment types for backup + restore.
// (PPAC enforces this — e.g. a Sandbox source can only restore to Sandbox, not
// Developer.) Keyed by the source environment's `environmentSku`/`type`.
const RESTORE_TARGET_TYPES_BY_SOURCE: Record<string, string[]> = {
  Production: ["Sandbox"],
  Sandbox: ["Sandbox"],
  Developer: ["Sandbox", "Developer"],
};

function validRestoreTargetTypes(sourceType: string | undefined): string[] {
  return RESTORE_TARGET_TYPES_BY_SOURCE[sourceType ?? ""] ?? [];
}

/**
 * Builds the list of valid restore-target environments for a given source.
 * Targets depend on the source environment's type (Microsoft's source→target
 * matrix — e.g. a Sandbox source restores only to Sandbox) and must have
 * Dataverse. The current environment is always offered (restore-in-place).
 */
export function useRestoreTargets(environmentId: string): { options: RestoreTargetOption[] } {
  const { environments } = useEnvironments();

  const options = useMemo<RestoreTargetOption[]>(() => {
    const sourceType = environments.find((e) => e.environmentId === environmentId)?.type;
    const allowedTargetTypes = validRestoreTargetTypes(sourceType);
    return environments
      .filter((e) => e.environmentId === environmentId || (allowedTargetTypes.includes(e.type ?? "") && e.hasDataverse))
      .map((e) => {
        const name = e.environmentDisplayName ?? e.displayName ?? e.environmentName;
        const isCurrent = e.environmentId === environmentId;
        return {
          value: e.environmentId,
          label: isCurrent ? `${name} (current)` : name,
          name,
        };
      });
  }, [environments, environmentId]);

  return { options };
}
