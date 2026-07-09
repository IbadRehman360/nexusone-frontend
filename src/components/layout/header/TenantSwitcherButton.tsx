"use client";

import { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useTenants } from "@/src/hooks/data/useTenants";
import { TenantModal } from "./TenantModal";

export function TenantSwitcherButton() {
  const { currentTenant, isLoading } = useTenants();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 h-9 pl-1.5 pr-3 rounded-full bg-(--custom-table-bg) border border-(--custom-header-input-border) hover:border-info-400/40 hover:bg-info/5 transition-colors max-w-64 shadow-xs"
      >
        <span className="w-6 h-6 rounded-full bg-info/15 border border-info/25 flex items-center justify-center shrink-0">
          <Building2 size={12} className="text-info-400" />
        </span>
        <span className="text-xs font-semibold text-foreground truncate">{isLoading ? "Loading…" : currentTenant?.name ?? "Tenant"}</span>
        <ChevronDown size={12} className="text-muted-foreground/50 shrink-0" />
      </button>

      <TenantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
