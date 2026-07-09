"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, ShieldCheck } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { listPpConnectors, createDlpPolicy, updateDlpPolicy } from "@/src/services/power-platform/ppGovernanceApi";
import type {
  PpConnectorCatalogItem,
  PpDlpPolicyDetail,
  DlpConnectorClassification,
  UpsertDlpPolicyPayload,
} from "@/src/types/powerPlatform";

interface DlpPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: PpDlpPolicyDetail | null;
  onSaved: () => void;
}

const DEFAULT_OPTIONS = [
  { value: "Business", label: "Business (allow, restricted)" },
  { value: "Non-Business", label: "Non-Business (allow, unrestricted)" },
  { value: "Blocked", label: "Blocked (deny)" },
];

const SCOPE_OPTIONS = [
  { value: "AllEnvironments", label: "All environments" },
  { value: "OnlyEnvironments", label: "Only selected environments" },
  { value: "ExceptEnvironments", label: "Except selected environments" },
];

const CLASSIFICATION_TO_DEFAULT: Record<DlpConnectorClassification, UpsertDlpPolicyPayload["defaultConnectorsClassification"]> = {
  Business: "General",
  "Non-Business": "Confidential",
  Blocked: "Blocked",
};

const VISIBLE_CONNECTOR_LIMIT = 60;

export function DlpPolicyModal({ isOpen, onClose, policy, onSaved }: DlpPolicyModalProps) {
  const { environments } = useEnvironments();
  const isEdit = !!policy;

  const [displayName, setDisplayName] = useState("");
  const [defaultClassification, setDefaultClassification] = useState<DlpConnectorClassification>("Business");
  const [scope, setScope] = useState<UpsertDlpPolicyPayload["environmentType"]>("AllEnvironments");
  const [selectedEnvIds, setSelectedEnvIds] = useState<Set<string>>(new Set());

  const [connectors, setConnectors] = useState<PpConnectorCatalogItem[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const [connectorSearch, setConnectorSearch] = useState("");
  const [overrides, setOverrides] = useState<Map<string, DlpConnectorClassification>>(new Map());

  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(policy?.name ?? "");
    setDefaultClassification("Business");
    setScope((policy?.environmentType as UpsertDlpPolicyPayload["environmentType"]) ?? "AllEnvironments");
    setSelectedEnvIds(new Set((policy?.environments ?? []).map((e) => e.id)));
    setConnectorSearch("");
    setNameError("");
    setOverrides(new Map((policy?.connectors ?? []).map((c) => [c.name, c.classification])));

    let cancelled = false;
    setConnectorsLoading(true);
    listPpConnectors()
      .then((c) => { if (!cancelled) setConnectors(c); })
      .catch(() => { if (!cancelled) setConnectors([]); })
      .finally(() => { if (!cancelled) setConnectorsLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, policy]);

  const filteredConnectors = useMemo(() => {
    const q = connectorSearch.trim().toLowerCase();
    const all = q ? connectors.filter((c) => c.displayName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : connectors;
    return all.slice(0, VISIBLE_CONNECTOR_LIMIT);
  }, [connectors, connectorSearch]);

  const setConnectorClassification = (connectorName: string, classification: DlpConnectorClassification) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      if (classification === defaultClassification) next.delete(connectorName);
      else next.set(connectorName, classification);
      return next;
    });
  };

  const toggleEnv = (id: string) => {
    setSelectedEnvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit = !!displayName.trim() && (scope === "AllEnvironments" || selectedEnvIds.size > 0);

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      setNameError("Policy name is required");
      return;
    }
    if (scope !== "AllEnvironments" && selectedEnvIds.size === 0) return;

    const business = connectors.filter((c) => overrides.get(c.name) === "Business").map((c) => ({ id: c.name, name: c.displayName }));
    const nonBusiness = connectors.filter((c) => overrides.get(c.name) === "Non-Business").map((c) => ({ id: c.name, name: c.displayName }));
    const blocked = connectors.filter((c) => overrides.get(c.name) === "Blocked").map((c) => ({ id: c.name, name: c.displayName }));

    const payload: UpsertDlpPolicyPayload = {
      displayName: displayName.trim(),
      defaultConnectorsClassification: CLASSIFICATION_TO_DEFAULT[defaultClassification],
      businessConnectors: business,
      nonBusinessConnectors: nonBusiness,
      blockedConnectors: blocked,
      environments: scope === "AllEnvironments" ? [] : Array.from(selectedEnvIds),
      environmentType: scope,
    };

    setSubmitting(true);
    try {
      if (isEdit && policy) {
        await updateDlpPolicy(policy.id, payload);
        toast.success("Policy updated", { description: `${displayName} has been updated.` });
      } else {
        await createDlpPolicy(payload);
        toast.success("Policy created", { description: `${displayName} has been created.` });
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(isEdit ? "Failed to update policy" : "Failed to create policy", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const classificationFor = (connectorName: string) => overrides.get(connectorName) ?? defaultClassification;

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit DLP Policy" : "New DLP Policy"}
      icon={<ShieldCheck size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Save changes" : "Create policy"}
      submitDisabled={!canSubmit}
      submitting={submitting}
      size="xl"
    >
      <FormField label="Policy name" required error={nameError}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); setNameError(""); }}
          placeholder="e.g. Protect Dataverse data"
          className={formInputClass(!!nameError)}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Default classification">
          <Dropdown
            variant="plain"
            value={defaultClassification}
            onChange={(v) => setDefaultClassification(v as DlpConnectorClassification)}
            options={DEFAULT_OPTIONS}
          />
        </FormField>
        <FormField label="Scope">
          <Dropdown
            variant="plain"
            value={scope}
            onChange={(v) => setScope(v as UpsertDlpPolicyPayload["environmentType"])}
            options={SCOPE_OPTIONS}
          />
        </FormField>
      </div>

      {scope !== "AllEnvironments" && (
        <FormField label="Environments" required hint="Pick the environments this policy applies to">
          <div className="flex flex-wrap gap-2">
            {environments.map((env) => {
              const active = selectedEnvIds.has(env.environmentId);
              return (
                <button
                  key={env.environmentId}
                  type="button"
                  onClick={() => toggleEnv(env.environmentId)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active ? "border-info-400 bg-info/10 text-info-400" : "border-border/50 text-foreground/80 hover:border-border"
                  }`}
                >
                  {env.environmentDisplayName ?? env.displayName ?? env.environmentName}
                </button>
              );
            })}
          </div>
        </FormField>
      )}

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">Connector classification</label>
        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={connectorSearch}
            onChange={(e) => setConnectorSearch(e.target.value)}
            placeholder="Search connectors (e.g. Dataverse, SQL, Twitter)…"
            className={formInputClass() + " pl-8"}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Connectors not changed here inherit the default classification. Showing {filteredConnectors.length} of {connectors.length}.
        </p>

        {connectorsLoading ? (
          <p className="text-xs text-muted-foreground">Loading connectors…</p>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y divide-border/30 border border-(--custom-table-border) rounded-lg">
            {filteredConnectors.map((c) => {
              const current = classificationFor(c.name);
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-sm text-foreground truncate">{c.displayName}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {(["Business", "Non-Business", "Blocked"] as DlpConnectorClassification[]).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setConnectorClassification(c.name, cls)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                          current === cls
                            ? cls === "Business"
                              ? "border-success-400/40 bg-success/10 text-success-400"
                              : cls === "Non-Business"
                                ? "border-border/60 bg-muted/30 text-foreground"
                                : "border-error-400/40 bg-error/10 text-error-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CreateModal>
  );
}
