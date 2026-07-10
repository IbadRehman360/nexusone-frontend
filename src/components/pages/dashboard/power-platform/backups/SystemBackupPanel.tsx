"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { DateSelect } from "@/src/components/ui/inputs/DateSelect";
import { SystemRestoreSlideOver } from "./SystemRestoreSlideOver";

// Microsoft's default backup retention window for non-managed environments.
const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { value: `${String(hour24).padStart(2, "0")}:${minute}`, label: `${hour12}:${minute} ${period}` };
});

const pad = (n: number) => String(n).padStart(2, "0");
const toDateVal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

interface SystemBackupPanelProps {
  environmentId: string;
  environmentName: string;
  canManage: boolean;
  isAnyRestoring: boolean;
  onRestored: () => void;
}

export function SystemBackupPanel({ environmentId, environmentName, canManage, isAnyRestoring, onRestored }: SystemBackupPanelProps) {
  const now = new Date();
  const minDate = new Date(now.getTime() - RETENTION_DAYS * MS_PER_DAY);

  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [confirming, setConfirming] = useState(false);

  const combined = selDate && selTime ? new Date(`${selDate}T${selTime}`) : null;
  const isValid = !!combined && !isNaN(combined.getTime()) && combined >= minDate && combined < now;

  function handleRestored() {
    setConfirming(false);
    setSelDate("");
    setSelTime("");
    onRestored();
  }

  return (
    <div className="p-6 space-y-5">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The retention period for this environment is <span className="font-medium text-foreground">{RETENTION_DAYS} days</span>.
        Select the point in time you&apos;d like to restore from to get started.
      </p>

      {canManage && environmentId ? (
        <div className="space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1.5 min-w-44">
              <label className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Select a date</label>
              <DateSelect value={selDate} onChange={setSelDate} min={toDateVal(minDate)} max={toDateVal(now)} />
            </div>
            <div className="space-y-1.5 min-w-44">
              <label className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Select a time</label>
              <Dropdown variant="plain" value={selTime} onChange={setSelTime} options={TIME_OPTIONS} placeholder="Select a time" />
            </div>
            <div className="space-y-1.5">
              <span aria-hidden className="block text-xs uppercase tracking-wide invisible">Action</span>
              <Button
                size="sm"
                onClick={() => setConfirming(true)}
                disabled={!isValid || isAnyRestoring}
                title={isAnyRestoring ? "A restore is already in progress" : undefined}
                rightIcon={<ArrowRight size={13} />}
              >
                Continue
              </Button>
            </div>
          </div>
          {selDate && selTime && !isValid && (
            <p className="text-[11px] text-error-400">Select a date and time within the last {RETENTION_DAYS} days.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 italic">Select an environment to restore from a system backup.</p>
      )}

      <SystemRestoreSlideOver
        isOpen={confirming}
        environmentId={environmentId}
        environmentName={environmentName}
        restorePointIso={combined ? combined.toISOString() : null}
        onClose={() => setConfirming(false)}
        onRestored={handleRestored}
      />
    </div>
  );
}
