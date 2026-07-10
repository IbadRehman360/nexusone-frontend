"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Switch } from "@/src/components/ui/inputs/Switch";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { createEnvironment, type CreateEnvironmentPayload } from "@/src/services/power-platform/environmentApi";
import type { PowerPlatformEnvironment } from "@/src/types/powerPlatform";
import { Globe, Cloud, Plus, Settings2 } from "lucide-react";

const ENVIRONMENT_SKU = ["Sandbox", "Production", "Trial", "Developer"] as const;
const ENVIRONMENT_REGIONS = [
  { value: "unitedstates", label: "United States" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "australia", label: "Australia" },
  { value: "india", label: "India" },
  { value: "japan", label: "Japan" },
  { value: "canada", label: "Canada" },
  { value: "unitedkingdom", label: "United Kingdom" },
  { value: "france", label: "France" },
  { value: "germany", label: "Germany" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "switzerland", label: "Switzerland" },
  { value: "norway", label: "Norway" },
  { value: "korea", label: "Korea" },
  { value: "southamerica", label: "South America" },
];

const emptyCreateForm: CreateEnvironmentPayload = {
  displayName: "",
  location: "unitedstates",
  environmentSku: "Developer",
  description: "",
  addDataverse: false,
  isManaged: false,
};

/** Plain colored status text — no pill/background per design (only "Type" gets a Badge). */
function StatusText({ state }: { state?: string }) {
  const isReady = !!state && ["ready", "succeeded"].includes(state.toLowerCase());
  return (
    <span className={`text-xs font-medium ${isReady ? "text-success-400" : "text-muted-foreground"}`}>
      {state ?? "Unknown"}
    </span>
  );
}

export default function Page() {
  const { environments, isLoading, error, refetch } = useEnvironments();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEnvironmentPayload>(emptyCreateForm);
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    const displayName = createForm.displayName.trim();
    if (!displayName) return;
    setSubmitting(true);
    try {
      await createEnvironment({ ...createForm, displayName, description: createForm.description?.trim() || undefined });
      toast.success("Environment creation started", { description: `${displayName} is being provisioned.` });
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      toast.error("Failed to create environment", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environments"
        description="Dataverse and Power Platform environments in your tenant."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Environments", icon: Globe },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreateModal}>
            Create Environment
          </Button>
        }
      />

      <DataTableMainHeader title={`Environments (${environments.length})`}>
        <DataTable<PowerPlatformEnvironment>
          data={environments}
          keyExtractor={(env) => env.environmentId}
          loading={isLoading}
          error={error?.message}
          sortEnabled
          defaultSortField="environmentDisplayName"
          defaultSortDir="asc"
          columns={[
            {
              key: "environmentDisplayName",
              header: "Name",
              sortable: true,
              render: (_, env) => (
                <span className="text-xs font-semibold text-foreground">
                  {env.environmentDisplayName ?? env.displayName ?? env.environmentName}
                </span>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (_, env) => <Badge variant="info">{env.type ?? "—"}</Badge>,
            },
            {
              key: "region",
              header: "Region",
              render: (_, env) => <span className="text-xs text-muted-foreground">{env.region ?? "—"}</span>,
            },
            {
              key: "state",
              header: "State",
              render: (_, env) => <StatusText state={env.state} />,
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (_, env) => (
                <Link href={`/dashboard/power-platform/environments/${env.environmentId}`}>
                  <Button variant="outline" size="sm" leftIcon={<Settings2 size={13} />}>
                    Manage
                  </Button>
                </Link>
              ),
            },
          ]}
          emptyState={{
            icon: Globe,
            title: "No environments found",
            description: "Environments will appear here once connected to your Microsoft tenant.",
            action: { label: "Create Environment", icon: <Plus size={14} />, onClick: openCreateModal },
          }}
        />
      </DataTableMainHeader>

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Environment"
        subtitle="Provision a new Power Platform environment."
        icon={<Globe size={16} className="text-info-400" />}
        onSubmit={handleCreate}
        submitDisabled={!createForm.displayName.trim()}
        submitting={submitting}
        size="lg"
      >
        <FormField label="Display Name" required>
          <input
            type="text"
            value={createForm.displayName}
            onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="e.g. HR Production Environment"
            className={formInputClass()}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Type" required>
            <select
              value={createForm.environmentSku}
              onChange={(e) => setCreateForm((f) => ({ ...f, environmentSku: e.target.value }))}
              className={formInputClass()}
            >
              {ENVIRONMENT_SKU.map((sku) => (
                <option key={sku} value={sku}>{sku}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Region" required>
            <select
              value={createForm.location}
              onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
              className={formInputClass()}
            >
              {ENVIRONMENT_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={createForm.description}
            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the purpose of this environment…"
            rows={3}
            className={formInputClass() + " resize-none"}
          />
        </FormField>

        <div className="space-y-3 pt-1">
          <Switch
            label="Add Dataverse"
            checked={!!createForm.addDataverse}
            onChange={(checked) => setCreateForm((f) => ({ ...f, addDataverse: checked }))}
          />
          <Switch
            label="Managed Environment"
            checked={!!createForm.isManaged}
            onChange={(checked) => setCreateForm((f) => ({ ...f, isManaged: checked }))}
          />
        </div>
      </CreateModal>
    </div>
  );
}
