"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { useSupportTickets } from "@/src/hooks/data/useSupport";
import { TicketStatusBadge, TicketPriorityBadge } from "./TicketStatusBadge";
import { NewTicketModal } from "./NewTicketModal";
import { TicketDetailSlideOver } from "./TicketDetailSlideOver";
import type { SupportTicket } from "@/src/services/support/supportApi";
import { LifeBuoy, Plus } from "lucide-react";

export default function Page() {
  const { tickets, isLoading } = useSupportTickets();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Submit a ticket and track its status — our team typically responds within one business day."
        breadcrumbs={[{ label: "Support", icon: LifeBuoy }]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Ticket
          </Button>
        }
      />

      <DataTableMainHeader
        title={`Tickets (${tickets.length})`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets…"
      >
        <DataTable<SupportTicket>
          data={tickets}
          keyExtractor={(t) => t.id}
          loading={isLoading}
          searchValue={search}
          sortEnabled
          defaultSortField="createdTime"
          defaultSortDir="desc"
          onRowClick={(t) => setSelectedId(t.id)}
          columns={[
            {
              key: "subject",
              header: "Subject",
              sortable: true,
              render: (_, t) => (
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground/60 font-mono">{t.ticketNumber}</p>
                </div>
              ),
            },
            { key: "status", header: "Status", render: (_, t) => <TicketStatusBadge status={t.status} /> },
            { key: "priority", header: "Priority", render: (_, t) => <TicketPriorityBadge priority={t.priority} /> },
            {
              key: "createdTime",
              header: "Created",
              sortable: true,
              render: (_, t) => <span className="text-xs text-foreground/70 tabular-nums">{new Date(t.createdTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>,
            },
          ]}
          emptyState={{
            icon: LifeBuoy,
            title: "No tickets yet",
            description: "Submit a ticket if you need help — we typically respond within one business day.",
            action: { label: "New Ticket", icon: <Plus size={14} />, onClick: () => setShowCreate(true) },
          }}
        />
      </DataTableMainHeader>

      <NewTicketModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <TicketDetailSlideOver ticketId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
