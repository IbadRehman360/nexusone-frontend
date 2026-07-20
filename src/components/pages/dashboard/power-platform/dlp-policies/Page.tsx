"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { usePpDlpPolicies } from "@/src/hooks/data/usePpDlpPolicies";
import { getDlpPolicyDetail, deleteDlpPolicy, fetchAuditActivity } from "@/src/services/power-platform/ppGovernanceApi";
import { DlpPolicyDetailPanel } from "./DlpPolicyDetailPanel";
import { DlpPolicyModal } from "./DlpPolicyModal";
import { showApiError } from "@/src/lib/errors/showApiError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_DLP_POLICIES, SAMPLE_PP_DLP_ACTIVITY, SAMPLE_PP_DLP_POLICY_DETAILS } from "@/src/lib/sampleData/powerPlatform";
import type { PpDlpPolicySummary, PpDlpPolicyDetail, UnifiedAuditActivity } from "@/src/types/powerPlatform";
import { ShieldCheck, Cloud, Plus, FileClock, Pencil, Trash2 } from "lucide-react";

type TabId = "policies" | "activity";

function activityCategoryVariant(category: UnifiedAuditActivity["category"]): "info" | "warning" | "error" | "neutral" {
  if (category === "DLP") return "error";
  if (category === "SecurityCompliance") return "warning";
  if (category === "PowerPlatform" || category === "Dataverse") return "info";
  return "neutral";
}

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [tab, setTab] = useState<TabId>("policies");
  const [searchQuery, setSearchQuery] = useState("");
  const { policies: realPolicies, isLoading, error, refetch } = usePpDlpPolicies();
  const policies = locked ? SAMPLE_PP_DLP_POLICIES : realPolicies;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PpDlpPolicyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PpDlpPolicyDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PpDlpPolicySummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [realActivity, setRealActivity] = useState<UnifiedAuditActivity[]>([]);
  const [realActivityLoading, setRealActivityLoading] = useState(false);
  const activity = locked ? SAMPLE_PP_DLP_ACTIVITY : realActivity;
  const activityLoading = locked ? false : realActivityLoading;

  const loadDetail = async (id: string) => {
    if (locked) {
      setDetail(SAMPLE_PP_DLP_POLICY_DETAILS[id] ?? null);
      return;
    }
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await getDlpPolicyDetail(id);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRowClick = (policy: PpDlpPolicySummary) => {
    setSelectedId(policy.id);
    loadDetail(policy.id);
  };

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (id: string) => {
    if (locked) return;
    setDetailLoading(true);
    try {
      const d = await getDlpPolicyDetail(id);
      setEditingPolicy(d);
      setShowModal(true);
    } catch (err) {
      showApiError(err, { title: "Failed to load policy" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDlpPolicy(deleteTarget.id);
      toast.success("Policy deleted", { description: `${deleteTarget.name} has been deleted.` });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
      await refetch();
    } catch (err) {
      showApiError(err, { title: "Failed to delete policy" });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (tab !== "activity" || locked) return;
    let cancelled = false;
    setRealActivityLoading(true);
    fetchAuditActivity()
      .then((a) => { if (!cancelled) setRealActivity(a); })
      .catch(() => { if (!cancelled) setRealActivity([]); })
      .finally(() => { if (!cancelled) setRealActivityLoading(false); });
    return () => { cancelled = true; };
  }, [tab, locked]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="DLP Policies"
        description="Data loss prevention policies applied across your tenant."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "DLP Policies", icon: ShieldCheck },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenCreate}>
            New Policy
          </Button>
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      {tab === "policies" ? (
        <DataTableMainHeader
          title={`DLP Policies (${policies.length})`}
          tabs={
            <Tabs<TabId>
              variant="pill"
              activeTab={tab}
              onChange={setTab}
              tabs={[
                { id: "policies", label: "DLP Policies", icon: ShieldCheck },
                { id: "activity", label: "DLP Activity Log", icon: FileClock },
              ]}
            />
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search policies…"
        >
          <DataTable<PpDlpPolicySummary>
            data={policies}
            keyExtractor={(policy) => policy.id}
            loading={!locked && isLoading}
            error={locked || !error ? undefined : presentError(error)}
            locked={locked}
            lockedTooltip={lockedTooltip}
            searchValue={searchQuery}
            sortEnabled
            defaultSortField="name"
            defaultSortDir="asc"
            onRowClick={handleRowClick}
            columns={[
              {
                key: "name",
                header: "Policy Name",
                sortable: true,
                render: (_, policy) => (
                  <div>
                    <p className="text-xs font-semibold text-foreground">{policy.name}</p>
                    <p className="text-[11px] text-muted-foreground">Power Platform DLP</p>
                  </div>
                ),
              },
              {
                key: "isTenantWide",
                header: "Scope",
                render: (_, policy) => (
                  <Badge variant={policy.isTenantWide ? "info" : "neutral"}>
                    {policy.isTenantWide ? "All environments" : `${policy.environments.length} environment(s)`}
                  </Badge>
                ),
              },
              {
                key: "business",
                header: "Business",
                align: "center",
                render: (_, policy) => <span className="text-xs font-medium text-success-400 tabular-nums">{policy.connectorCounts.business}</span>,
              },
              {
                key: "nonBusiness",
                header: "Non-Business",
                align: "center",
                render: (_, policy) => <span className="text-xs font-medium text-warning-400 tabular-nums">{policy.connectorCounts.nonBusiness}</span>,
              },
              {
                key: "blocked",
                header: "Blocked",
                align: "center",
                render: (_, policy) => <span className="text-xs font-medium text-error-400 tabular-nums">{policy.connectorCounts.blocked}</span>,
              },
              {
                key: "lastModifiedTime",
                header: "Last Modified",
                hideOnMobile: true,
                render: (_, policy) => (
                  <span className="text-xs text-foreground/70 tabular-nums">
                    {policy.lastModifiedTime ? new Date(policy.lastModifiedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (_, policy) => (
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" leftIcon={<Pencil size={12} />} onClick={() => handleOpenEdit(policy.id)}>
                      Edit
                    </Button>
                    <Button variant="danger-outline" size="icon-sm" onClick={() => setDeleteTarget(policy)} aria-label={`Delete ${policy.name}`}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                ),
              },
            ]}
            emptyState={{
              icon: ShieldCheck,
              title: "No DLP policies found",
              description: "Create your first policy to govern connector usage.",
            }}
          />
        </DataTableMainHeader>
      ) : (
        <DataTableMainHeader
          title={`Activity (${activity.length})`}
          tabs={
            <Tabs<TabId>
              variant="pill"
              activeTab={tab}
              onChange={setTab}
              tabs={[
                { id: "policies", label: "DLP Policies", icon: ShieldCheck },
                { id: "activity", label: "DLP Activity Log", icon: FileClock },
              ]}
            />
          }
        >
          <DataTable<UnifiedAuditActivity>
            data={activity}
            keyExtractor={(a) => a.id}
            loading={activityLoading}
            sortEnabled
            defaultSortField="timestamp"
            defaultSortDir="desc"
            columns={[
              {
                key: "operation",
                header: "Operation",
                sortable: true,
                render: (_, a) => <span className="text-xs font-semibold text-foreground">{a.operation}</span>,
              },
              {
                key: "category",
                header: "Category",
                render: (_, a) => <Badge variant={activityCategoryVariant(a.category)}>{a.category}</Badge>,
              },
              {
                key: "user",
                header: "User",
                render: (_, a) => <span className="text-xs text-muted-foreground">{a.user}</span>,
              },
              {
                key: "policyName",
                header: "Policy",
                hideOnMobile: true,
                render: (_, a) => <span className="text-xs text-muted-foreground">{a.policyName ?? "—"}</span>,
              },
              {
                key: "timestamp",
                header: "When",
                sortable: true,
                render: (_, a) => (
                  <span className="text-xs text-foreground/70 tabular-nums">
                    {new Date(a.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })},{" "}
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                ),
              },
            ]}
            emptyState={{
              icon: FileClock,
              title: "No activity yet",
              description: "Power Platform and DLP governance events will appear here.",
            }}
          />
        </DataTableMainHeader>
      )}

      <DlpPolicyDetailPanel
        policyId={selectedId}
        detail={detail}
        loading={detailLoading}
        onClose={() => setSelectedId(null)}
        onEdit={handleOpenEdit}
        onDelete={() => {
          const p = policies.find((x) => x.id === selectedId);
          if (p) setDeleteTarget(p);
        }}
      />

      <DlpPolicyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        policy={editingPolicy}
        onSaved={() => {
          refetch();
          if (selectedId) loadDetail(selectedId);
        }}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete DLP Policy"
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
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
        </p>
      </Modal>
    </div>
  );
}
