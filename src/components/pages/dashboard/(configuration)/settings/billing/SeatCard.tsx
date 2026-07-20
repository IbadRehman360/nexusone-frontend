"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { useBillingState, useSeatInfo } from "@/src/hooks/data/useBilling";
import { setSeats } from "@/src/services/billing/billingApi";
import { showApiError } from "@/src/lib/errors/showApiError";

interface SeatCardProps {
  isOwner: boolean;
}

export function SeatCard({ isOwner }: SeatCardProps) {
  const { seats, isLoading, refetch } = useSeatInfo();
  const { state } = useBillingState();
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState<number | null>(null);

  // Sync the staged target whenever the committed total changes (initial load, or after a successful mutation).
  useEffect(() => {
    if (seats) setTarget(seats.total);
  }, [seats?.total]);

  if (isLoading || !seats || target === null) {
    return <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-4 text-xs text-muted-foreground">Loading seats…</div>;
  }

  const displayUsed = seats.used;
  const displayTotal = target;
  const pct = displayTotal > 0 ? Math.min(100, Math.round((displayUsed / displayTotal) * 100)) : 0;
  const pricePerSeat = (seats.pricePerSeatCents / 100).toFixed(0);
  // During TRIAL or GRACE, seats are hard-capped at the free base allotment —
  // no paid add-ons before the tenant has actually purchased a module. Once
  // ACTIVE, the ceiling is seats.maxTotal (widens 5 per paid module), but
  // everything above the free base still has to be bought via `+`.
  const isCapped = state?.nexusStatus === "TRIAL" || state?.nexusStatus === "GRACE";
  const ceiling = isCapped ? seats.base : seats.maxTotal;
  const isAtCeiling = target >= ceiling;
  const floor = Math.max(seats.base, seats.used);
  const isDirty = target !== seats.total;
  const delta = target - seats.total;
  const chargeCents = seats.pricePerSeatCents * Math.abs(delta);
  const chargeDollars = (chargeCents / 100).toFixed(0);
  const extraSeats = ceiling - seats.base;

  const adjustTarget = (step: number) => {
    const next = target + step;
    if (next < floor || next > ceiling) return;
    setTarget(next);
  };

  const confirm = async () => {
    if (!isDirty || busy) return;
    setBusy(true);
    try {
      const { url } = await setSeats(target);
      if (url) {
        window.location.assign(url);
        return;
      }
      toast.success("Seats updated");
      await refetch();
    } catch (err) {
      showApiError(err, { title: "Couldn't update seats" });
      setTarget(seats.total);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-(--custom-table-border) max-w-3xl bg-(--custom-table-header-bg) p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center shrink-0">
          <Users size={16} className="text-info-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Invite seats</h3>
      </div>

      <p className="text-2xl font-bold text-foreground tabular-nums">
        {displayUsed} <span className="text-sm font-normal text-muted-foreground">of {displayTotal} used</span>
      </p>
      <div className="h-1.5 rounded-full bg-muted/30 mt-2 mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isDirty ? "bg-info/60" : "bg-info-400"}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">
        {seats.base} seats are free. Extra seats are ${pricePerSeat}/mo each, billed to your card.
      </p>

      {isOwner && seats.canManage ? (
        <div className="space-y-3">
          <div className="flex items-center gap-0.5 rounded-full border border-(--custom-table-border) bg-(--custom-table-bg) shrink-0 p-0.5 w-fit">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full bg-(--custom-table-header-bg) border-(--custom-table-border)"
              onClick={() => adjustTarget(-1)}
              disabled={busy || target <= floor}
              aria-label="Remove one extra seat"
            >
              <Minus size={12} />
            </Button>
            <span className="text-xs font-medium text-foreground whitespace-nowrap px-2 tabular-nums">
              {target - seats.base} extra
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full bg-(--custom-table-header-bg) border-(--custom-table-border)"
              onClick={() => adjustTarget(1)}
              disabled={busy || isAtCeiling}
              aria-label="Add one extra seat"
            >
              <Plus size={12} />
            </Button>
          </div>

          <Button size="sm" onClick={confirm} loading={busy} disabled={!isDirty} className="w-full">
            {!isDirty
              ? "No change"
              : delta > 0
                ? `Add ${delta} seat${delta === 1 ? "" : "s"} — +$${chargeDollars}/mo`
                : `Remove ${Math.abs(delta)} seat${Math.abs(delta) === 1 ? "" : "s"} — -$${chargeDollars}/mo`}
          </Button>

          {!isCapped && (
            <p className="text-[11px] text-muted-foreground">
              You can purchase up to {extraSeats} extra seat{extraSeats === 1 ? "" : "s"} with your current modules — buy another module to raise this limit.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">{isOwner ? "Seat management isn't available on this plan." : "Only the tenant Owner can manage seats."}</p>
      )}
      {isCapped && (
        <p className="text-[11px] text-muted-foreground mt-2">
          {state?.nexusStatus === "GRACE"
            ? `Seats are capped at ${seats.base} during your grace period. Purchase a module to add more.`
            : `Seats are capped at ${seats.base} during the trial. Purchase a module to add more.`}
        </p>
      )}
    </div>
  );
}
