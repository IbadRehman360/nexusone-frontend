"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_ENVIRONMENT_GROUPS } from "@/src/lib/sampleData/powerPlatform";
import { createEnvironmentGroup, updateEnvironmentGroup, deleteEnvironmentGroup } from "@/src/services/power-platform/environmentGroupApi";
import type { EnvironmentGroupWithEnvironments } from "@/src/types/powerPlatform";
import { Layers2, Cloud, Plus, Settings2, Trash2 } from "lucide-react";

interface GroupFormState {
  displayName: string;
  description: string;
}

const emptyForm: GroupFormState = { displayName: "", description: "" };

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { groups: realGroups, isLoading, error, refetch } = useEnvironmentGroups();
  const groups = locked ? SAMPLE_PP_ENVIRONMENT_GROUPS : realGroups;
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<GroupFormState>(emptyForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [manageGroup, setManageGroup] = useState<EnvironmentGroupWithEnvironments | null>(null);
  const [manageForm, setManageForm] = useState<GroupFormState>(emptyForm);
  const [manageSubmitting, setManageSubmitting] = useState(false);

  const [deleteGroup, setDeleteGroup] = useState<EnvironmentGroupWithEnvironments | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const openCreateModal = () => {
    setCreateForm(emptyForm);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    const displayName = createForm.displayName.trim();
    if (!displayName) return;
    setCreateSubmitting(true);
    try {
      await createEnvironmentGroup({ displayName, description: createForm.description.trim() || undefined });
      toast.success("Group created", { description: `${displayName} has been created successfully.` });
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      toast.error("Failed to create group", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openManageModal = (group: EnvironmentGroupWithEnvironments) => {
    setManageForm({ displayName: group.displayName, description: group.description ?? "" });
    setManageGroup(group);
  };

  const handleManageSave = async () => {
    if (!manageGroup) return;
    const displayName = manageForm.displayName.trim();
    if (!displayName) return;
    setManageSubmitting(true);
    try {
      await updateEnvironmentGroup(manageGroup.id, { displayName, description: manageForm.description.trim() || undefined });
      toast.success("Group updated", { description: `${displayName} has been updated.` });
      setManageGroup(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to update group", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setManageSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteGroup) return;
    setDeleteSubmitting(true);
    try {
      await deleteEnvironmentGroup(deleteGroup.id);
      toast.success("Group deleted", { description: `${deleteGroup.displayName} has been deleted.` });
      setDeleteGroup(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to delete group", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environment Groups"
        description="Organize environments into logical groups."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Environment Groups", icon: Layers2 },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreateModal}>
            Create Group
          </Button>
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Environment Groups (${groups.length})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search groups…"
      >
        <DataTable<EnvironmentGroupWithEnvironments>
          data={groups}
          keyExtractor={(group) => group.id}
          loading={!locked && isLoading}
          error={locked ? undefined : error?.message}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          sortEnabled
          defaultSortField="displayName"
          defaultSortDir="asc"
          columns={[
            {
              key: "displayName",
              header: "Group",
              sortable: true,
              render: (_, group) => (
                <span className="text-xs font-semibold text-foreground">{group.displayName}</span>
              ),
            },
            {
              key: "description",
              header: "Description",
              hideOnMobile: true,
              render: (_, group) => (
                <span className="text-xs text-muted-foreground">
                  {group.description || "No description"}
                </span>
              ),
            },
            {
              key: "environments",
              header: "Environments",
              align: "center",
              render: (_, group) => (
                <span className="text-xs font-medium text-foreground/80">{group.environments.length}</span>
              ),
            },
            {
              key: "createdAt",
              header: "Created",
              sortable: true,
              hideOnMobile: true,
              render: (value) => (
                <span className="text-xs text-foreground/70 tabular-nums">
                  {value ? new Date(value as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, group) => (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Settings2 size={13} />} onClick={() => openManageModal(group)}>
                    Manage
                  </Button>
                  <Button variant="danger-outline" size="icon-sm" onClick={() => setDeleteGroup(group)} aria-label={`Delete ${group.displayName}`}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              ),
            },
          ]}
          emptyState={{
            icon: Layers2,
            title: "No environment groups yet",
            description: "Create your first group to organise environments logically.",
            action: { label: "Create Group", icon: <Plus size={14} />, onClick: openCreateModal },
          }}
        />
      </DataTableMainHeader>

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Environment Group"
        subtitle="Groups let you organise environments logically."
        icon={<Layers2 size={16} className="text-info-400" />}
        onSubmit={handleCreate}
        submitDisabled={!createForm.displayName.trim()}
        submitting={createSubmitting}
      >
        <FormField label="Group Name" required>
          <input
            type="text"
            value={createForm.displayName}
            onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="e.g. Production Environments"
            className={formInputClass()}
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={createForm.description}
            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
            rows={3}
            className={formInputClass() + " resize-none"}
          />
        </FormField>
      </CreateModal>

      <CreateModal
        isOpen={!!manageGroup}
        onClose={() => setManageGroup(null)}
        title="Manage Environment Group"
        subtitle={manageGroup ? `Editing "${manageGroup.displayName}"` : undefined}
        icon={<Settings2 size={16} className="text-info-400" />}
        onSubmit={handleManageSave}
        submitLabel="Save Changes"
        submitDisabled={!manageForm.displayName.trim()}
        submitting={manageSubmitting}
      >
        <FormField label="Group Name" required>
          <input
            type="text"
            value={manageForm.displayName}
            onChange={(e) => setManageForm((f) => ({ ...f, displayName: e.target.value }))}
            className={formInputClass()}
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={manageForm.description}
            onChange={(e) => setManageForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className={formInputClass() + " resize-none"}
          />
        </FormField>
      </CreateModal>

      <Modal
        isOpen={!!deleteGroup}
        onClose={() => setDeleteGroup(null)}
        title="Delete Environment Group"
        subtitle="This action cannot be undone."
        variant="danger"
        size="sm"
        loading={deleteSubmitting}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteGroup(null)} disabled={deleteSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} loading={deleteSubmitting}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Are you sure you want to delete <span className="font-semibold">{deleteGroup?.displayName}</span>? Environments in this group will not be deleted, only the grouping.
        </p>
      </Modal>
    </div>
  );
}
