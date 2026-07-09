"use client";

import { cn } from "@/src/lib/utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/** Reusable on/off toggle for form fields (e.g. "Add Dataverse", "Managed Environment"). */
export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-info border-info" : "bg-muted border-border",
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );

  if (!label) return track;

  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>}
      </span>
      {track}
    </label>
  );
}

export default Switch;
