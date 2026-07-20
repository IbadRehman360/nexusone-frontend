"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { useBillingState, useSeatInfo } from "@/src/hooks/data/useBilling";
import { setSeats } from "@/src/services/billing/billingApi";
import { createSupportTicket } from "@/src/services/support/supportApi";
import type { SeatInfo } from "@/src/services/billing/billingApi";
import { formatDate } from "@/src/lib/utils/dateFormat";

const PAYMENT_TERMS_LABEL: Record<string, string> = {
  net_30: "NET-30",
  net_60: "NET-60",
  wire: "Wire transfer",
  ach: "ACH",
  custom: "Custom terms",
};

interface SeatCardProps {
  isOwner: boolean;
}

/** Lets the customer flag interest in a bulk/negotiated seat deal — creates a
 *  real support ticket (same Zoho-backed pipeline as the Support page) with
 *  their current usage pre-filled, so staff have context to act on without
 *  the customer having to explain their setup from scratch. Staff then set up
 *  the actual deal from Backoffice's existing "Set Up Custom Seat Deal" flow —
 *  this button only creates the signal, it doesn't negotiate or apply terms. */
function RequestSeatDealButton({ seats }: { seats: SeatInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await createSupportTicket({
        subject: "Custom seat deal request",
        description: `Currently using ${seats.used} of ${seats.total} seats (purchase ceiling ${seats.maxTotal}). Requesting a custom bulk/enterprise seat arrangement.`,
        priority: "Medium",
      });
      toast.success("Request sent", { description: "Our team will follow up about a custom seat arrangement." });
      setIsOpen(false);
    } catch (err) {
      toast.error("Couldn't send request", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="w-full">
        Request a custom seat deal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Request a custom seat deal?"
        subtitle="For bulk or negotiated pricing beyond the standard per-seat rate — our account team will follow up."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} loading={submitting}>
              Send request
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This opens a support ticket with your current usage ({seats.used} of {seats.total} seats) so our team has
          context. They&apos;ll reach out to discuss pricing and terms.
        </p>
      </Modal>
    </>
  );
}

export function SeatCard({ isOwner }: SeatCardProps) {
  const { seats, isLoading, refetch } = useSeatInfo();
  const { state } = useBillingState();
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  // Tracks which committed total `target` was last synced from — adjusted
  // during render (React's documented pattern for resetting derived state
  // from a prop) rather than in an effect, which would cause an extra
  // render pass on every load/refetch.
  const [syncedTotal, setSyncedTotal] = useState<number | null>(null);

  if (seats && seats.total !== syncedTotal) {
    setSyncedTotal(seats.total);
    setTarget(seats.total);
  }

  if (isLoading || !seats || target === null) {
    return <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-4 text-xs text-muted-foreground">Loading seats…</div>;
  }

  if (seats.billingMode === "managed") {
    const deal = seats.managedDeal;
    const dealPricePerSeat = deal && seats.pricePerSeatCents > 0 ? (seats.pricePerSeatCents / 100).toFixed(0) : null;
    const dealModuleFee = deal?.moduleFeeCents != null ? (deal.moduleFeeCents / 100).toFixed(0) : null;

    return (
      <div className="rounded-xl border border-(--custom-table-border) max-w-3xl bg-(--custom-table-header-bg) p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center shrink-0">
            <Users size={16} className="text-info-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Invite seats</h3>
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {seats.used} <span className="text-sm font-normal text-muted-foreground">of {seats.total} used</span>
        </p>

        {deal && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
            <div>
              <dt className="text-muted-foreground">Price per seat</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {dealPricePerSeat ? `$${dealPricePerSeat}/mo` : "Included in deal"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment terms</dt>
              <dd className="font-semibold text-foreground">{PAYMENT_TERMS_LABEL[deal.paymentTerms] ?? deal.paymentTerms}</dd>
            </div>
            {dealModuleFee && (
              <div>
                <dt className="text-muted-foreground">Module fee</dt>
                <dd className="font-semibold text-foreground tabular-nums">${dealModuleFee}/mo</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Deal effective since</dt>
              <dd className="font-semibold text-foreground">{formatDate(deal.effectiveStart)}</dd>
            </div>
          </dl>
        )}

        {deal?.notes && <p className="text-[11px] text-muted-foreground mt-3">{deal.notes}</p>}

        <p className="text-[11px] text-muted-foreground mt-3">
          Your seats are managed by your account team. Contact support to make changes.
        </p>
      </div>
    );
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
      toast.error("Couldn't update seats", { description: err instanceof Error ? err.message : "Please try again." });
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

          <div className="pt-1 border-t border-(--custom-table-border)">
            <p className="text-[11px] text-muted-foreground mt-3 mb-2">Need a larger, negotiated arrangement instead?</p>
            <RequestSeatDealButton seats={seats} />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">{isOwner ? "Seat management isn't available on this plan." : "Only the tenant Owner can manage seats."}</p>
      )}
      {isCapped && (
        <p className="text-[11px] text-muted-foreground mt-2">
          {state?.nexusStatus === "GRACE"
            ? `Seats are capped at ${seats.base} during your grace period. Purchase a module to add more.`
            : `Seats are capped at ${seats.base} during the preview. Purchase a module to add more.`}
        </p>
      )}
    </div>
  );
}
