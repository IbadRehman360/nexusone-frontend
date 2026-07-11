"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { useBusinessUnits } from "@/src/hooks/data/useBusinessUnits";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import { SAMPLE_PP_BUSINESS_UNITS } from "@/src/lib/sampleData/powerPlatform";
import { createBusinessUnit } from "@/src/services/power-platform/businessUnitApi";
import type { BusinessUnit } from "@/src/types/powerPlatform";
import { Users, ChevronRight, ChevronDown, Cloud, Plus } from "lucide-react";

type Row = BusinessUnit & { depth: number; hasChildren: boolean };

function idsWithChildren(units: BusinessUnit[]): string[] {
  return units.flatMap((u) =>
    (u.children?.length ?? 0) > 0 ? [u.businessUnitId, ...idsWithChildren(u.children!)] : [],
  );
}

function countAll(units: BusinessUnit[]): number {
  return units.reduce((sum, u) => sum + 1 + countAll(u.children ?? []), 0);
}

function visibleRows(units: BusinessUnit[], expanded: Set<string>, depth = 0): Row[] {
  return units.flatMap((u) => {
    const hasChildren = (u.children?.length ?? 0) > 0;
    const row: Row = { ...u, depth, hasChildren };
    if (hasChildren && expanded.has(u.businessUnitId)) {
      return [row, ...visibleRows(u.children!, expanded, depth + 1)];
    }
    return [row];
  });
}

function flattenForSelect(units: BusinessUnit[], depth = 0): { id: string; label: string }[] {
  return units.flatMap((u) => [
    { id: u.businessUnitId, label: `${"— ".repeat(depth)}${u.name}` },
    ...flattenForSelect(u.children ?? [], depth + 1),
  ]);
}

function buildNameMap(units: BusinessUnit[], map = new Map<string, string>()): Map<string, string> {
  for (const u of units) {
    map.set(u.businessUnitId, u.name);
    if (u.children?.length) buildNameMap(u.children, map);
  }
  return map;
}

export default function Page() {
  const { locked, lockedTooltip } = useModulePhase("pp");
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { businessUnits: realBusinessUnits, isLoading, error, refetch } = useBusinessUnits(locked ? "" : environmentUrl);
  const businessUnits = locked ? SAMPLE_PP_BUSINESS_UNITS : realBusinessUnits;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  // Default to fully expanded whenever the underlying tree changes (e.g. environment switch).
  useEffect(() => {
    setExpanded(new Set(idsWithChildren(businessUnits)));
  }, [businessUnits]);

  const rootCount = businessUnits.length;
  const totalCount = countAll(businessUnits);
  const childCount = totalCount - rootCount;
  const rows = visibleRows(businessUnits, expanded);
  const parentOptions = useMemo(() => flattenForSelect(businessUnits), [businessUnits]);
  const nameById = useMemo(() => buildNameMap(businessUnits), [businessUnits]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModal = () => {
    setNewName("");
    setNewParentId(businessUnits.find((bu) => !bu.parentBusinessUnitId)?.businessUnitId ?? parentOptions[0]?.id ?? "");
    setNameError("");
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (trimmed.length < 2 || trimmed.length > 160) {
      setNameError("Name must be 2-160 characters long");
      return;
    }
    if (!newParentId) return;

    setSubmitting(true);
    try {
      await createBusinessUnit({ environmentUrl, parentBusinessUnitId: newParentId, name: trimmed });
      toast.success("Business unit created", { description: `${trimmed} has been created successfully.` });
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      toast.error("Failed to create business unit", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Units"
        description="Business unit hierarchy for the selected environment."
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Business Units", icon: Users },
        ]}
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreateModal} disabled={!environmentUrl}>
            Create Business Unit
          </Button>
        }
        locked={locked}
        lockedTooltip={lockedTooltip}
      />

      <ModuleConnectBanner module="pp" />

      <DataTableMainHeader
        title={`Business Units (${totalCount})`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search business units…"
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
        filters={
          <>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set(idsWithChildren(businessUnits)))}>
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
              Collapse all
            </Button>
            <span className="text-xs text-muted-foreground">
              {rootCount} root · {childCount} children
            </span>
          </>
        }
      >
        <DataTable<Row>
          data={rows}
          keyExtractor={(unit) => unit.businessUnitId}
          loading={!locked && isLoading}
          error={locked ? undefined : error?.message}
          locked={locked}
          lockedTooltip={lockedTooltip}
          searchValue={searchQuery}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (_, unit) => (
                <div className="flex items-center gap-1.5" style={{ paddingLeft: unit.depth * 20 }}>
                  {unit.hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggle(unit.businessUnitId)}
                      className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expanded.has(unit.businessUnitId) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  ) : (
                    <span className="w-[18px] shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-foreground">{unit.name}</span>
                </div>
              ),
            },
            {
              key: "parentBusinessUnitId",
              header: "Type",
              render: (_, unit) => (
                <Badge variant={unit.parentBusinessUnitId ? "neutral" : "info"}>
                  {unit.parentBusinessUnitId ? "Child" : "Root"}
                </Badge>
              ),
            },
            {
              key: "parent",
              header: "Parent",
              hideOnMobile: true,
              render: (_, unit) => (
                <span className="text-xs text-muted-foreground">
                  {unit.parentBusinessUnitId ? (nameById.get(unit.parentBusinessUnitId) ?? "Unknown") : "— root unit —"}
                </span>
              ),
            },
            {
              key: "children",
              header: "Children",
              align: "center",
              render: (_, unit) => (
                <span className="text-xs font-medium text-foreground/80 tabular-nums">
                  {unit.children?.length ? unit.children.length : "—"}
                </span>
              ),
            },
          ]}
          emptyState={{
            icon: Users,
            title: "No business units found",
            description: "Business units will appear here once the environment is connected.",
          }}
        />
      </DataTableMainHeader>

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Business Unit"
        subtitle="New business units are created as children of the selected parent."
        icon={<Users size={16} className="text-info-400" />}
        onSubmit={handleCreate}
        submitDisabled={!newName.trim() || !newParentId}
        submitting={submitting}
      >
        <FormField label="Business Unit Name" required error={nameError} hint={!nameError ? "2-160 characters" : undefined}>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (nameError) setNameError("");
            }}
            placeholder="e.g. Sales Department"
            className={formInputClass(!!nameError)}
          />
        </FormField>
        <FormField label="Parent Business Unit" required>
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className={formInputClass()}
          >
            {parentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
      </CreateModal>
    </div>
  );
}
