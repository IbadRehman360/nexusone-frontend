"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { useSeatInfo } from "@/src/hooks/data/useBilling";
import { setSeats } from "@/src/services/billing/billingApi";

interface SeatCardProps {
  isOwner: boolean;
}

export function SeatCard({ isOwner }: SeatCardProps) {
  const { seats, isLoading, refetch } = useSeatInfo();
  const [busy, setBusy] = useState(false);

  if (isLoading || !seats) {
    return <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-4 text-xs text-muted-foreground">Loading seats…</div>;
  }

  const pct = seats.total > 0 ? Math.min(100, Math.round((seats.used / seats.total) * 100)) : 0;
  const pricePerSeat = (seats.pricePerSeatCents / 100).toFixed(0);

  const handleChange = async (delta: number) => {
    const next = seats.total + delta;
    if (next < seats.base || next < seats.used) return;
    setBusy(true);
    try {
      const { url } = await setSeats(next);
      if (url) {
        window.location.assign(url);
        return;
      }
      toast.success("Seats updated");
      await refetch();
    } catch (err) {
      toast.error("Couldn't update seats", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} className="text-muted-foreground/70" />
        <h3 className="text-sm font-semibold text-foreground">Invite seats</h3>
      </div>

      <p className="text-2xl font-bold text-foreground tabular-nums">
        {seats.used} <span className="text-sm font-normal text-muted-foreground">of {seats.total} used</span>
      </p>
      <div className="h-1.5 rounded-full bg-muted/30 mt-2 mb-4 overflow-hidden">
        <div className="h-full bg-info-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">
        {seats.base} seats are free. Extra seats are ${pricePerSeat}/mo each, billed to your card.
      </p>

      {isOwner && seats.canManage && (
        <div className="flex items-center gap-1 rounded-full border border-border/40 shrink-0 pl-1 w-fit">
          <Button variant="ghost" size="icon-sm" onClick={() => handleChange(-1)} disabled={busy || seats.total <= Math.max(seats.base, seats.used)} aria-label="Remove one extra seat">
            <Minus size={13} />
          </Button>
          <span className="text-xs font-medium text-foreground whitespace-nowrap px-1 tabular-nums">
            {seats.purchased} extra seat{seats.purchased === 1 ? "" : "s"}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => handleChange(1)} disabled={busy} aria-label="Add one extra seat">
            <Plus size={13} />
          </Button>
        </div>
      )}
    </div>
  );
}
