"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Building2, Plus } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { getTenants, switchTenant, type Tenant } from "@/src/services/tenants/tenantApi";
import { ConnectTenantModal } from "./ConnectTenantModal";

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TenantModal({ isOpen, onClose }: TenantModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getTenants()
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSwitch = async (tenant: Tenant) => {
    if (tenant.id === user?.currentTenantId) return;
    setSwitchingId(tenant.id);
    try {
      await switchTenant(tenant.id);
      queryClient.clear();
      window.location.reload();
    } catch (err) {
      toast.error("Failed to switch tenant", { description: err instanceof Error ? err.message : "Please try again." });
      setSwitchingId(null);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Switch tenant" subtitle="Microsoft tenants connected to your account" size="sm">
        <div className="space-y-1.5">
          {loading ? (
            <p className="text-xs text-muted-foreground px-1 py-3">Loading tenants…</p>
          ) : tenants.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1 py-3">No tenants found.</p>
          ) : (
            tenants.map((tenant) => {
              const isCurrent = tenant.id === user?.currentTenantId;
              return (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => handleSwitch(tenant)}
                  disabled={switchingId !== null}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                    isCurrent ? "border-info-400/40 bg-info/10" : "border-(--custom-table-border) hover:bg-muted/15"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-info/15 border border-info/25 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-info-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{tenant.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {tenant.domain} · {tenant.plan}
                    </p>
                  </div>
                  {switchingId === tenant.id ? (
                    <span className="text-[11px] text-muted-foreground shrink-0">Switching…</span>
                  ) : isCurrent ? (
                    <Check size={15} className="text-info-400 shrink-0" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="pt-3 mt-1 border-t border-(--custom-table-border)">
          <Button variant="outline" size="sm" className="w-full justify-center" leftIcon={<Plus size={13} />} onClick={() => setShowConnect(true)}>
            Connect another tenant…
          </Button>
        </div>
      </Modal>

      <ConnectTenantModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </>
  );
}
