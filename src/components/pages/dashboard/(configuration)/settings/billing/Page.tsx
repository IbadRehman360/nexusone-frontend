"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { useAuth } from "@/src/hooks/useAuth";
import { useBillingState } from "@/src/hooks/data/useBilling";
import { StatusBanner, computeDisplayState } from "./StatusBanner";
import { PlansSection } from "./PlansSection";
import { SeatCard } from "./SeatCard";
import { InvoicesTab } from "./InvoicesTab";
import { PaymentMethodsTab } from "./PaymentMethodsTab";
import { Sparkle, LayoutDashboard, Receipt, CreditCard } from "lucide-react";

type BillingTab = "overview" | "invoices" | "payment";

const TABS = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "invoices" as const, label: "Invoices", icon: Receipt },
  { id: "payment" as const, label: "Payment methods", icon: CreditCard },
];

export default function Page() {
  const { user } = useAuth();
  const { state, isLoading } = useBillingState();
  const [activeTab, setActiveTab] = useState<BillingTab>("overview");
  const isOwner = user?.tenantRole === "Owner";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plan"
        description="Manage your NexusOne subscription, modules, and invite quota."
        breadcrumbs={[{ label: "Billing", icon: Sparkle }]}
      />

      <div className="flex items-center justify-between gap-4">
        <Tabs<BillingTab> variant="pill" tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "overview" && state && <StatusBanner displayState={computeDisplayState(state)} state={state} isOwner={isOwner} />}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-8 text-center">Loading billing…</p>
      ) : !state ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No subscription found for this tenant.</p>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="space-y-4">
              <PlansSection isOwner={isOwner} paidModules={state.paidModules ?? []} modulesInTrial={state.modulesInTrial ?? []} />
              <SeatCard isOwner={isOwner} />
            </div>
          )}

          {activeTab === "invoices" && <InvoicesTab />}
          {activeTab === "payment" && <PaymentMethodsTab />}
        </>
      )}
    </div>
  );
}
