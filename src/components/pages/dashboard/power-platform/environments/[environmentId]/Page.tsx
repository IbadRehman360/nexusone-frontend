"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_ENVIRONMENTS } from "@/src/lib/sampleData/powerPlatform";
import { updateEnvironment } from "@/src/services/power-platform/environmentApi";
import { Globe, Cloud, ArrowLeft, Save } from "lucide-react";

export default function Page() {
  const params = useParams<{ environmentId: string }>();
  const router = useRouter();
  const { locked, lockedTooltip } = useModulePhase("pp");
  const { environments: realEnvironments, isLoading: realIsLoading, refetch } = useEnvironments();
  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const isLoading = locked ? false : realIsLoading;
  const environment = environments.find((env) => env.environmentId === params.environmentId);

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (environment) {
      setDisplayName(environment.environmentDisplayName ?? environment.displayName ?? "");
      setDescription("");
    }
  }, [environment]);

  const handleSave = async () => {
    if (locked || !environment || !displayName.trim()) return;
    setSubmitting(true);
    try {
      await updateEnvironment(environment.environmentId, {
        displayName: displayName.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Environment updated");
      await refetch();
    } catch (err) {
      toast.error("Failed to update environment", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground px-1">Loading environment…</div>;
  }

  if (!environment) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mb-3 flex justify-center">
          <div className="p-3 rounded-xl bg-muted/20">
            <Globe size={22} className="text-muted-foreground/50" />
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">Environment not found</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          This environment may have been deleted or you don&apos;t have access to it.
        </p>
        <Button size="sm" className="mt-4" onClick={() => router.push("/dashboard/power-platform/environments")}>
          Back to Environments
        </Button>
      </div>
    );
  }

  const name = environment.environmentDisplayName ?? environment.displayName ?? environment.environmentName;

  return (
    <div className="space-y-6">
      <PageHeader
        title={name}
        description="Manage environment details."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Environments", href: "/dashboard/power-platform/environments", icon: Globe },
          { label: name },
        ]}
        action={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push("/dashboard/power-platform/environments")}>
            Back
          </Button>
        }
      />

      <ModuleConnectBanner module="pp" />

      <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <Badge variant="info">{environment.type ?? "—"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Region</p>
            <p className="text-xs font-medium text-foreground">{environment.region ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">State</p>
            <p className={`text-xs font-medium ${environment.state && ["ready", "succeeded"].includes(environment.state.toLowerCase()) ? "text-success-400" : "text-muted-foreground"}`}>
              {environment.state ?? "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Dataverse</p>
            <p className="text-xs font-medium text-foreground">{environment.hasDataverse ? "Yes" : "No"}</p>
          </div>
        </div>
        {environment.environmentUrl && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Environment URL</p>
            <p className="text-xs font-mono text-foreground/80 break-all">{environment.environmentUrl}</p>
          </div>
        )}
      </div>

      <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5" title={locked ? lockedTooltip : undefined}>
        <h2 className="text-sm font-semibold text-foreground mb-4">Edit</h2>
        <div className={locked ? "space-y-4 max-w-lg opacity-50 pointer-events-none cursor-not-allowed" : "space-y-4 max-w-lg"} aria-disabled={locked || undefined}>
          <FormField label="Display Name" required>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={formInputClass()}
            />
          </FormField>
          <FormField label="Description" hint="Optional">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={formInputClass() + " resize-none"}
            />
          </FormField>
          <Button size="sm" leftIcon={<Save size={14} />} onClick={handleSave} disabled={locked || !displayName.trim()} loading={submitting}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
