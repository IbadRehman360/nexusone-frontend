"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { usePPDelegations } from "@/src/hooks/data/usePPDelegations";
import { useUsers } from "@/src/hooks/data/useUsers";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_DELEGATIONS } from "@/src/lib/sampleData/powerPlatform";
import { revokeDelegation } from "@/src/services/power-platform/ppDelegationApi";
import { CreateDelegationModal } from "./CreateDelegationModal";
import { showApiError } from "@/src/lib/errors/showApiError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import type { PPDelegation } from "@/src/types/powerPlatform";
import { CalendarCheck, Cloud, Plus, Ban } from "lucide-react";

const STATUS_COLOR: Record<PPDelegation["status"], string> = {
  active: "text-success-400",
  pending: "text-warning-400",
  expired: "text-muted-foreground",
  revoked: "text-error-400",
};

const STATUS_DOT: Record<PPDelegation["status"], string> = {
  active: "bg-success-400",
  pending: "bg-warning-400",
  expired: "bg-muted-foreground/50",
  revoked: "bg-error-400",
};

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { delegations: realDelegations, isLoading, error, refetch } = usePPDelegations(locked ? "" : environmentUrl);
  const delegations = locked ? SAMPLE_PP_DELEGATIONS : realDelegations;
  const { users } = useUsers(locked ? "" : environmentUrl);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<PPDelegation | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeDelegation(revokeTarget.id);
      toast.success("Delegation revoked", { description: "Original roles have been restored." });
      setRevokeTarget(null);
      await refetch();
    } catch (err) {
      showApiError(err, { title: "Failed to revoke delegation" });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delegations"
        description="Temporary role delegations granted within this environment."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Delegations", icon: CalendarCheck },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)} disabled={!environmentUrl}>
            Create Delegation
          </Button>
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Delegations (${delegations.length})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search delegations…"
        headerRight={
          locked ? (
            <Dropdown
              value="sample-env-prod"
              onChange={() => {}}
              disabled
              options={[{ value: "sample-env-prod", label: "Contoso Production" }]}
            />
          ) : (
            <EnvironmentSelect value={environmentUrl} onChange={setEnvironmentUrl} />
          )
        }
      >
        <DataTable<PPDelegation>
          data={delegations}
          keyExtractor={(d) => d.id}
          loading={!locked && isLoading}
          error={locked || !error ? undefined : presentError(error)}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          columns={[
            {
              key: "delegatorName",
              header: "Delegating From",
              render: (_, d) => (
                <div>
                  <p className="text-xs font-semibold text-foreground">{d.delegatorName ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground">{d.delegatorEmail}</p>
                </div>
              ),
            },
            {
              key: "delegateeName",
              header: "Delegated To",
              render: (_, d) => (
                <div>
                  <p className="text-xs font-semibold text-foreground">{d.delegateeName ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground">{d.delegateeEmail}</p>
                </div>
              ),
            },
            {
              key: "roles",
              header: "Roles",
              render: (_, d) => (
                <span className="text-xs text-foreground/80">{(d.delegatedRoleNames ?? []).join(", ") || "—"}</span>
              ),
            },
            {
              key: "period",
              header: "Period",
              render: (_, d) => (
                <span className="text-xs text-foreground/70 tabular-nums">
                  {new Date(d.startDate).toLocaleDateString()} → {new Date(d.endDate).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "expires",
              header: "Expires",
              render: (_, d) => {
                if (d.status !== "active") {
                  return <span className="text-xs text-muted-foreground tabular-nums">{new Date(d.endDate).toLocaleDateString()}</span>;
                }
                const remaining = daysUntil(d.endDate);
                const soon = remaining <= 3;
                return (
                  <span className={`text-xs font-medium tabular-nums ${soon ? "text-warning-400" : "text-foreground/70"}`}>
                    {remaining <= 0 ? "Expires today" : `Expires in ${remaining}d`}
                  </span>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              render: (_, d) => (
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLOR[d.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[d.status]}`} />
                  {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, d) =>
                d.status === "active" ? (
                  <Button variant="danger-outline" size="sm" leftIcon={<Ban size={13} />} onClick={() => setRevokeTarget(d)}>
                    Revoke
                  </Button>
                ) : null,
            },
          ]}
          emptyState={{
            icon: CalendarCheck,
            title: "No delegations found",
            description: "Delegations for this environment will appear here.",
            action: environmentUrl ? { label: "Create Delegation", icon: <Plus size={14} />, onClick: () => setShowCreateModal(true) } : undefined,
          }}
        />
      </DataTableMainHeader>

      <CreateDelegationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        environmentUrl={environmentUrl}
        users={users}
        onCreated={refetch}
      />

      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Delegation"
        subtitle="This will immediately restore the delegatee's original roles."
        variant="danger"
        size="sm"
        loading={revoking}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRevokeTarget(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevoke} loading={revoking}>
              Revoke
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Revoke the delegation from <span className="font-semibold">{revokeTarget?.delegatorName}</span> to{" "}
          <span className="font-semibold">{revokeTarget?.delegateeName}</span>?
        </p>
      </Modal>
    </div>
  );
}
