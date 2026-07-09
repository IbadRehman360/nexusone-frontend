"use client";

import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { useInvoices } from "@/src/hooks/data/useBilling";
import type { InvoiceItem } from "@/src/services/billing/billingApi";
import { FileText, Download, Receipt } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "neutral"> = {
  paid: "success",
  open: "warning",
  uncollectible: "error",
  void: "neutral",
  draft: "neutral",
};

function fmtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function InvoicesTab() {
  const { invoices, isLoading } = useInvoices(20);

  return (
    <DataTableMainHeader title={`Recent invoices (${invoices.length})`}>
      <DataTable<InvoiceItem>
        data={invoices}
        keyExtractor={(inv) => inv.id}
        loading={isLoading}
        sortEnabled
        defaultSortField="created"
        defaultSortDir="desc"
        columns={[
          {
            key: "number",
            header: "Invoice",
            render: (_, inv) => (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <FileText size={12} className="text-muted-foreground/60" />
                {inv.number ?? inv.id}
              </span>
            ),
          },
          {
            key: "periodStart",
            header: "Billing period",
            render: (_, inv) => (
              <span className="text-xs text-foreground/70 tabular-nums">
                {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (_, inv) => <Badge variant={STATUS_VARIANT[inv.status ?? ""] ?? "neutral"}>{inv.status ?? "—"}</Badge>,
          },
          {
            key: "amountPaid",
            header: "Amount",
            sortable: true,
            render: (_, inv) => (
              <span className="text-xs font-medium text-foreground tabular-nums">
                {(inv.amountPaid / 100).toLocaleString(undefined, { style: "currency", currency: inv.currency.toUpperCase() })}
              </span>
            ),
          },
          {
            key: "created",
            header: "Date",
            sortable: true,
            render: (_, inv) => <span className="text-xs text-foreground/70 tabular-nums">{fmtDate(inv.created)}</span>,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (_, inv) => {
              const href = inv.invoicePdf ?? inv.hostedInvoiceUrl;
              if (!href) return null;
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex text-muted-foreground/60 hover:text-foreground transition-colors" aria-label="Download invoice">
                  <Download size={14} />
                </a>
              );
            },
          },
        ]}
        emptyState={{
          icon: Receipt,
          title: "No invoices yet",
          description: "Invoices from your subscription will appear here.",
        }}
      />
    </DataTableMainHeader>
  );
}
