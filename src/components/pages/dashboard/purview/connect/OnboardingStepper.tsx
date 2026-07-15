"use client";

import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";

export interface OnboardingStep {
  id: string;
  label: string;
}

interface OnboardingStepperProps {
  steps: OnboardingStep[];
  currentStepId: string;
  // Every step before the current one — shown with a green checkmark.
  completedStepIds: Set<string>;
  // Unused now (every completed step renders the same green check) — kept
  // as an accepted prop so callers that still pass it don't need updating.
  verifiedStepIds?: Set<string>;
}

/** Left-nav step list for the Purview connect wizard — plain numbered circles
 * that fill in as steps complete, current step highlighted. No animation, no
 * external stepper library — small enough to hand-roll with this app's own
 * theme tokens rather than pull in a dependency for four steps. */
export function OnboardingStepper({
  steps,
  currentStepId,
  completedStepIds,
}: OnboardingStepperProps) {
  return (
    <nav className="space-y-1">
      {steps.map((step, i) => {
        const isCurrent = step.id === currentStepId;
        const isDone = completedStepIds.has(step.id);
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              isCurrent && "bg-info/10",
            )}
          >
            <span
              className={cn(
                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold",
                isDone
                  ? "bg-success/15 text-success-400"
                  : isCurrent
                    ? "bg-info-400 text-white"
                    : "bg-(--custom-table-bg) border border-(--custom-table-border) text-muted-foreground",
              )}
            >
              {isDone ? <Check size={12} /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium truncate",
                isCurrent ? "text-info-400" : isDone ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
