import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export interface LicenseGateStep {
  title: string;
  description: string;
}

interface LicenseGateStateProps {
  title: string;
  description: string;
  steps?: LicenseGateStep[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Shown in place of a page/tab's data when the tenant lacks the license or
 * permission needed to load it (e.g. Entra ID P1/P2, Governance add-on).
 * `steps`, when provided, are numbered — mirrors the Purview Data Lineage
 * "how to unlock this" empty state.
 */
export function LicenseGateState({ title, description, steps, ctaLabel = "View licensing", ctaHref = "/dashboard/entra-id/licenses" }: LicenseGateStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-(--custom-table-border) bg-muted/30">
        <Lock size={26} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
      </div>

      {steps && steps.length > 0 && (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 text-left">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3 rounded-xl border border-(--custom-table-border) bg-card px-3.5 py-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info-400/15 text-[11px] font-semibold text-info-400">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{step.title}</p>
                <p className="text-[11px] text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 rounded-lg border border-(--custom-table-border) px-3.5 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/20 hover:text-foreground"
      >
        <Sparkles size={14} />
        {ctaLabel}
      </Link>
    </div>
  );
}
