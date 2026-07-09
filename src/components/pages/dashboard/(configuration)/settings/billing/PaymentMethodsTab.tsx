"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { usePaymentMethods } from "@/src/hooks/data/useBilling";
import { createPortalSession, removePaymentMethod } from "@/src/services/billing/billingApi";
import type { PaymentMethodItem } from "@/src/services/billing/billingApi";
import { CreditCard, ExternalLink, X } from "lucide-react";

export function PaymentMethodsTab() {
  const { methods, isLoading, refetch } = usePaymentMethods();
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleManageInStripe = async () => {
    setOpeningPortal(true);
    try {
      const url = await createPortalSession();
      window.location.assign(url);
    } catch (err) {
      toast.error("Couldn't open billing portal", { description: err instanceof Error ? err.message : "Please try again." });
      setOpeningPortal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removePaymentMethod(deleteTarget.id);
      toast.success("Card removed");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      toast.error("Couldn't remove card", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">Adding, updating, and setting a default card is handled in Stripe's secure portal.</p>
      <DataTableMainHeader
        title="Payment methods"
        headerRight={
          <Button variant="outline" size="sm" leftIcon={<CreditCard size={13} />} rightIcon={<ExternalLink size={12} />} onClick={handleManageInStripe} loading={openingPortal}>
            Manage in Stripe
          </Button>
        }
      >
        <DataTable<PaymentMethodItem>
          data={methods}
          keyExtractor={(m) => m.id}
          loading={isLoading}
          columns={[
            {
              key: "brand",
              header: "Card",
              render: (_, m) => (
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded-sm bg-muted/30 border border-border/30 flex items-center justify-center shrink-0">
                    <CreditCard size={11} className="text-muted-foreground/70" />
                  </span>
                  <span className="text-xs font-medium text-foreground capitalize">
                    {m.brand} •••• {m.last4}
                  </span>
                  {m.isDefault && <Badge variant="info">Default</Badge>}
                </div>
              ),
            },
            {
              key: "cardholderName",
              header: "Cardholder",
              render: (_, m) => <span className="text-xs text-muted-foreground">{m.cardholderName ?? "—"}</span>,
            },
            {
              key: "expMonth",
              header: "Expires",
              render: (_, m) => <span className="text-xs text-foreground/70 tabular-nums">{m.expMonth}/{m.expYear}</span>,
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, m) => (
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(m)} aria-label="Remove card">
                  <X size={13} />
                </Button>
              ),
            },
          ]}
          emptyState={{
            icon: CreditCard,
            title: "No payment methods",
            description: "Cards saved to your Stripe account will appear here.",
          }}
        />
      </DataTableMainHeader>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove card"
        subtitle="This action cannot be undone."
        variant="danger"
        size="sm"
        loading={deleting}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} loading={deleting}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Remove {deleteTarget?.brand} •••• {deleteTarget?.last4}?
        </p>
      </Modal>
    </>
  );
}
