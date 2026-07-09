"use client";

import { useEffect } from "react";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";

interface EnvironmentSelectProps {
  value: string;
  onChange: (environmentUrl: string) => void;
}

/**
 * Shared environment picker for pages scoped to a single Dataverse
 * environment (Business Units, Teams, Users, Roles, Delegations, Backups,
 * Import). Auto-selects the first environment once the list loads.
 */
export function EnvironmentSelect({ value, onChange }: EnvironmentSelectProps) {
  const { environments, isLoading } = useEnvironments();

  useEffect(() => {
    if (!value && environments.length > 0) {
      onChange(environments[0].environmentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments]);

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      disabled={isLoading || environments.length === 0}
      placeholder={isLoading ? "Loading environments…" : "No environments"}
      options={environments.map((env) => ({
        value: env.environmentUrl,
        label: env.environmentDisplayName ?? env.displayName ?? env.environmentName,
      }))}
    />
  );
}
