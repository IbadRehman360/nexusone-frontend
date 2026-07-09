"use client";

import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Info, Clock, ArrowLeftRight, ListChecks, ExternalLink } from "lucide-react";

const RETENTION_PERIODS = [
  { label: "Production (Dynamics 365)", badge: "28d" },
  { label: "Production", badge: "7d" },
  { label: "Sandbox", badge: "7d" },
  { label: "Developer", badge: "7d" },
];

const SUPPORTED_TARGETS = [
  { source: "Production", target: "Sandbox" },
  { source: "Sandbox", target: "Sandbox" },
  { source: "Developer", target: "Sandbox, Developer" },
];

const PREREQUISITES = ["Region match", "Dataverse", "Capacity", "Customer-managed keys"];

const DOCS_URL = "https://learn.microsoft.com/en-us/power-platform/admin/backup-restore-environments";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-4">
      <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-(--custom-table-border)">
        <span className="text-info-400">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">{title}</span>
      </div>
      {children}
    </div>
  );
}

interface BackupInfoSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackupInfoSlideOver({ isOpen, onClose }: BackupInfoSlideOverProps) {
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Backup Information"
      subtitle="Retention periods & restore prerequisites"
      icon={<Info size={16} className="text-info-400" />}
      width="sm"
    >
      <div className="p-5 space-y-4">
        <Section icon={<Clock size={13} />} title="Backup periods">
          <div className="space-y-1">
            {RETENTION_PERIODS.map(({ label, badge }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <span className="text-xs text-foreground/75">{label}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-info/10 text-info-400 border border-info/20">{badge}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-2.5 pt-2.5 border-t border-border/20">
            Retention windows are set by Microsoft and cannot be extended. You can restore any point within the window.
          </p>
        </Section>

        <Section icon={<ArrowLeftRight size={13} />} title="Supported environments">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-border/20">
            <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide">Source type</span>
            <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide">Target type</span>
          </div>
          <div className="space-y-1">
            {SUPPORTED_TARGETS.map(({ source, target }) => (
              <div key={source} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <span className="text-xs text-foreground/75">{source}</span>
                <span className="text-xs text-muted-foreground">{target}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<ListChecks size={13} />} title="Restore prerequisites">
          <div className="space-y-1">
            {PREREQUISITES.map((label) => (
              <div key={label} className="py-1.5 border-b border-border/20 last:border-0">
                <span className="text-xs text-foreground/75">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-info-400 hover:text-info-400/80 transition-colors"
        >
          Learn more on Microsoft Learn
          <ExternalLink size={12} />
        </a>
      </div>
    </SlideOver>
  );
}
