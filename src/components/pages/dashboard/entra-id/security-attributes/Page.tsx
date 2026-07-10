"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tag, Plus, Layers, Users, AppWindow, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { StatBox } from "@/src/components/ui/display/StatBox";
import { Loader } from "@/src/components/ui/feedback/Loader";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DtColumn } from "@/src/components/ui/display/DataTable/types";
import { useCsaAttributes, useCsaUsers, useCsaServicePrincipals, useCsaMutations } from "@/src/hooks/data/useSecurityAttributes";
import type { CsaAppType, CsaAttribute, CsaCategory, CsaPrincipal, CsaServicePrincipal, CsaTagValue, CsaUser, PrincipalKind, CreateAttributePayload } from "@/src/types/securityAttributes";

function hasValue(v: CsaTagValue): boolean {
  return v != null && !(Array.isArray(v) && v.length === 0);
}

function tagKeyFor(attr: CsaAttribute): string {
  return `${attr.attributeSetId}/${attr.name}`;
}

function computeCoverage(users: CsaUser[], attr: CsaAttribute): { have: number; total: number; pct: number } {
  const key = tagKeyFor(attr);
  const total = users.length;
  const have = users.filter((u) => hasValue(u.tags[key])).length;
  return { have, total, pct: total ? Math.round((have / total) * 100) : 0 };
}

function userToPrincipal(user: CsaUser): CsaPrincipal {
  return { id: user.id, kind: "user", title: user.name, subtitle: user.upn, meta: user.dept, initials: user.initials, tags: user.tags };
}

const APP_TYPE_LABELS: Record<CsaAppType, string> = { enterprise: "Enterprise", microsoft: "Microsoft", managed: "Managed identity" };

function spToPrincipal(sp: CsaServicePrincipal): CsaPrincipal {
  return { id: sp.id, kind: "servicePrincipal", title: sp.name, subtitle: sp.appId, meta: APP_TYPE_LABELS[sp.appType], initials: sp.initials, tags: sp.tags };
}

const USER_DOMAIN = { kind: "user" as PrincipalKind, noun: "user", nounPlural: "users", columnHeader: "User", metaHeader: "Department", searchPlaceholder: "Search users…" };
const APP_DOMAIN = { kind: "servicePrincipal" as PrincipalKind, noun: "application", nounPlural: "applications", columnHeader: "Application", metaHeader: "Type", searchPlaceholder: "Search applications…" };

const APP_TYPE_FILTERS: { value: CsaAppType | "all"; label: string }[] = [
  { value: "all", label: "All application types" },
  { value: "enterprise", label: "Enterprise applications" },
  { value: "microsoft", label: "Microsoft applications" },
  { value: "managed", label: "Managed identities" },
];

function coverageColor(pct: number): BadgeVariant {
  if (pct >= 85) return "success";
  if (pct >= 60) return "warning";
  return "error";
}

function CoverageBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? "bg-success-400" : pct >= 60 ? "bg-warning-400" : "bg-error-400";
  return (
    <div className="flex items-center gap-2 min-w-32">
      <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}%</span>
    </div>
  );
}

function TypePill({ attr }: { attr: CsaAttribute }) {
  const typeLabel = attr.type === "boolean" ? "Yes / No" : attr.type === "number" ? "Number" : "Text";
  const variant: BadgeVariant = attr.type === "text" ? "info" : attr.type === "number" ? "warning" : "purple";
  return (
    <Badge variant={variant}>
      {typeLabel}
      {attr.cardinality === "multi" ? " · multi" : ""}
      {attr.valueMode === "list" ? " · list" : " · free"}
    </Badge>
  );
}

// --- Catalog tab ---

type AttributeTreeRow =
  | { kind: "category"; id: string; category: CsaCategory }
  | { kind: "attribute"; id: string; attr: CsaAttribute };

function visibleAttributeRows(categories: CsaCategory[], expanded: Set<string>): AttributeTreeRow[] {
  return categories.flatMap((cat) => {
    const row: AttributeTreeRow = { kind: "category", id: cat.id, category: cat };
    if (!expanded.has(cat.id)) return [row];
    return [row, ...cat.attributes.map((attr): AttributeTreeRow => ({ kind: "attribute", id: `${cat.id}/${attr.id}`, attr }))];
  });
}

function AttributeDetailSlideOver({ attr, users, onClose }: { attr: CsaAttribute | null; users: CsaUser[]; onClose: () => void }) {
  const cov = attr ? computeCoverage(users, attr) : { have: 0, total: 0, pct: 0 };
  return (
    <SlideOver isOpen={!!attr} onClose={onClose} title={attr?.name} subtitle="Custom security attribute" icon={<Tag size={16} className="text-info-400" />} width="md">
      {attr && (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox label="Attribute set" value={attr.attributeSetId} />
            <StatBox label="Data type" value={<TypePill attr={attr} />} />
            <StatBox label="Tagged" value={`${cov.have} of ${cov.total} users`} />
            <StatBox label="Coverage" value={<Badge variant={coverageColor(cov.pct)}>{cov.pct}%</Badge>} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Allowed Values</p>
            {attr.valueMode === "list" && attr.options.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {attr.options.map((o) => (
                  <Badge key={o} variant="neutral">
                    {o}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Free {attr.type} entry — any value accepted.</p>
            )}
          </div>

          {attr.description && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Description</p>
              <p className="text-xs text-foreground/80">{attr.description}</p>
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}

// --- Principal (Users / Applications) shared tab ---

function getPrincipalTags(principal: CsaPrincipal, attributes: CsaAttribute[]): { label: string; value: string }[] {
  const tags: { label: string; value: string }[] = [];
  for (const attr of attributes) {
    const v = principal.tags[tagKeyFor(attr)];
    if (hasValue(v)) tags.push({ label: attr.name, value: Array.isArray(v) ? v.join(", ") : String(v) });
  }
  return tags;
}

function PrincipalDetailSlideOver({
  principal,
  categories,
  onClose,
  onAssign,
  onRemove,
}: {
  principal: CsaPrincipal | null;
  categories: CsaCategory[];
  onClose: () => void;
  onAssign: (id: string, setId: string, name: string, value: string, isCollection: boolean) => Promise<void>;
  onRemove: (id: string, setId: string, name: string, isCollection: boolean) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [selKey, setSelKey] = useState("");
  const [selVal, setSelVal] = useState("");
  const [busy, setBusy] = useState(false);

  const allAttrs = categories.flatMap((c) => c.attributes);
  const assigned = principal ? allAttrs.filter((a) => hasValue(principal.tags[tagKeyFor(a)])) : [];
  const unassigned = allAttrs.filter((a) => !assigned.includes(a));
  const selectedAttr = selKey ? allAttrs.find((a) => tagKeyFor(a) === selKey) : null;

  async function doAssign() {
    if (!selKey || !selVal || !selectedAttr || !principal) return;
    setBusy(true);
    try {
      await onAssign(principal.id, selectedAttr.attributeSetId, selectedAttr.name, selVal, selectedAttr.cardinality === "multi");
      setAdding(false);
      setSelKey("");
      setSelVal("");
    } finally {
      setBusy(false);
    }
  }

  async function doRemove(attr: CsaAttribute) {
    if (!principal) return;
    setBusy(true);
    try {
      await onRemove(principal.id, attr.attributeSetId, attr.name, attr.cardinality === "multi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SlideOver isOpen={!!principal} onClose={onClose} title={principal?.title} subtitle={principal?.subtitle} icon={<Tag size={16} className="text-info-400" />} width="md">
      {principal && (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox label={principal.kind === "user" ? "Department" : "Type"} value={principal.meta || "—"} />
            <StatBox label="Attributes assigned" value={assigned.length} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Security Attributes</p>
              {!adding && unassigned.length > 0 && (
                <Button variant="outline" size="sm" leftIcon={<Plus size={12} />} onClick={() => setAdding(true)}>
                  Assign
                </Button>
              )}
            </div>

            {assigned.length === 0 && !adding && <p className="text-xs text-muted-foreground">No attributes assigned yet.</p>}

            <div className="space-y-2">
              {assigned.map((attr) => {
                const key = tagKeyFor(attr);
                const value = principal.tags[key];
                return (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-lg bg-(--custom-table-bg) border border-(--custom-table-border) px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">{attr.attributeSetId}</p>
                      <p className="text-xs text-foreground">
                        <span className="text-muted-foreground">{attr.name}: </span>
                        <span className="font-semibold">{Array.isArray(value) ? value.join(", ") : String(value ?? "")}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => doRemove(attr)}
                      disabled={busy}
                      aria-label="Remove attribute"
                      className="text-muted-foreground hover:text-error-400 shrink-0"
                    >
                      <Plus size={14} className="rotate-45" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {adding && (
              <div className="mt-3 rounded-lg bg-(--custom-table-bg) border border-info/20 p-3.5 space-y-3">
                <FormField label="Attribute">
                  <select
                    value={selKey}
                    onChange={(e) => {
                      setSelKey(e.target.value);
                      setSelVal("");
                    }}
                    className={formInputClass()}
                  >
                    <option value="">Choose an attribute…</option>
                    {unassigned.map((a) => (
                      <option key={a.id} value={tagKeyFor(a)}>
                        {a.attributeSetId} › {a.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                {selectedAttr && (
                  <FormField label="Value">
                    {selectedAttr.valueMode === "list" ? (
                      <select value={selVal} onChange={(e) => setSelVal(e.target.value)} className={formInputClass()}>
                        <option value="">Choose…</option>
                        {selectedAttr.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={selVal}
                        onChange={(e) => setSelVal(selectedAttr.type === "number" ? e.target.value.replace(/[^0-9]/g, "") : e.target.value)}
                        placeholder={selectedAttr.type === "number" ? "Numbers only" : "Type a value"}
                        className={formInputClass()}
                      />
                    )}
                  </FormField>
                )}

                <div className="flex gap-2">
                  <Button size="sm" onClick={doAssign} disabled={!selKey || !selVal || busy} loading={busy}>
                    Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setSelKey("");
                      setSelVal("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}

function PrincipalsTable({
  principals,
  allAttrs,
  domain,
  loading,
  selectedIds,
  onToggleSelect,
  onRowClick,
}: {
  principals: CsaPrincipal[];
  allAttrs: CsaAttribute[];
  domain: { columnHeader: string; metaHeader: string; nounPlural: string };
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onRowClick: (p: CsaPrincipal) => void;
}) {
  const columns: DtColumn<CsaPrincipal>[] = [
    {
      key: "select",
      header: "",
      render: (_, p) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(p.id)}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(p.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-border accent-info cursor-pointer"
        />
      ),
    },
    {
      key: "title",
      header: domain.columnHeader,
      sortable: true,
      render: (_, p) => {
        const tags = getPrincipalTags(p, allAttrs);
        return (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.subtitle}</p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.slice(0, 4).map((t) => (
                  <span key={t.label} className="text-[10px] bg-muted/40 border border-(--custom-table-border) rounded px-1.5 py-0.5 text-muted-foreground">
                    {t.label}: <span className="text-foreground font-medium">{t.value}</span>
                  </span>
                ))}
                {tags.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{tags.length - 4}</span>}
              </div>
            )}
          </div>
        );
      },
    },
    { key: "meta", header: domain.metaHeader, hideOnMobile: true, render: (_, p) => <span className="text-xs text-muted-foreground">{p.meta || "—"}</span> },
  ];

  return (
    <DataTable<CsaPrincipal>
      data={principals}
      columns={columns}
      keyExtractor={(p) => p.id}
      className="border-0 rounded-none"
      loading={loading}
      pageSize={25}
      pageSizeOptions={[10, 25, 50, 100]}
      onRowClick={onRowClick}
      emptyState={{ icon: Users, title: `No ${domain.nounPlural} found`, description: "Nothing matches the current search and filters." }}
    />
  );
}

// --- Create attribute modal ---

function CreateAttributeModal({ isOpen, onClose, categories, onCreate }: { isOpen: boolean; onClose: () => void; categories: CsaCategory[]; onCreate: (payload: CreateAttributePayload) => Promise<void> }) {
  const [categoryId, setCategoryId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "number" | "boolean">("text");
  const [isCollection, setIsCollection] = useState(false);
  const [usePreDefined, setUsePreDefined] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [optInput, setOptInput] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setCategoryId("");
    setNewCatName("");
    setName("");
    setType("text");
    setIsCollection(false);
    setUsePreDefined(true);
    setOptions([]);
    setOptInput("");
    setDescription("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  const isBool = type === "boolean";
  const effectiveOptions = isBool ? ["Yes", "No"] : options;
  const effectiveUsePreDefined = isBool || usePreDefined;
  const isValid = Boolean((categoryId || newCatName.trim()) && name.trim() && (!effectiveUsePreDefined || effectiveOptions.length > 0));

  function addOption() {
    const v = optInput.trim();
    if (!v || options.includes(v)) return;
    if (type === "number" && /[^0-9.]/.test(v)) return;
    setOptions([...options, v]);
    setOptInput("");
  }

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onCreate({
        attributeSetId: categoryId || "__new",
        newAttributeSetName: !categoryId ? newCatName.trim() || undefined : undefined,
        name: name.trim(),
        type: type === "text" ? "String" : type === "number" ? "Integer" : "Boolean",
        isCollection,
        usePreDefinedValuesOnly: effectiveUsePreDefined,
        allowedValues: effectiveUsePreDefined && !isBool ? effectiveOptions : undefined,
        description: description.trim() || undefined,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreateModal isOpen={isOpen} onClose={handleClose} title="New Security Attribute" icon={<Tag size={16} className="text-info-400" />} onSubmit={handleSubmit} submitLabel="Create Attribute" submitDisabled={!isValid} submitting={submitting} size="lg">
      <FormField label="Attribute Set" required>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setNewCatName("");
          }}
          className={formInputClass()}
        >
          <option value="">Choose or create…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!categoryId && <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New attribute set name" className={`${formInputClass()} mt-2`} />}
      </FormField>

      <FormField label="Attribute Name" required hint="Cannot be changed after creation.">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Clearance Level" className={formInputClass()} />
      </FormField>

      <FormField label="Data Type" required hint="Permanent — cannot be changed after creation.">
        <div className="flex gap-2">
          {(["text", "number", "boolean"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${type === t ? "bg-info/10 border-info/40 text-foreground" : "bg-(--custom-table-bg) border-(--custom-table-border) text-muted-foreground hover:bg-muted/20"}`}
            >
              {t === "text" ? "Text" : t === "number" ? "Number" : "Yes / No"}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Values Per User" hint="Permanent — cannot be changed after creation.">
        <div className="flex gap-1.5 p-1 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg w-fit">
          {([false, true] as const).map((multi) => (
            <button
              key={String(multi)}
              type="button"
              onClick={() => setIsCollection(multi)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isCollection === multi ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              {multi ? "Multiple values" : "Single value"}
            </button>
          ))}
        </div>
      </FormField>

      {!isBool && (
        <FormField label="Allowed Values">
          <div className="flex gap-1.5 p-1 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg w-fit mb-3">
            {([true, false] as const).map((list) => (
              <button
                key={String(list)}
                type="button"
                onClick={() => setUsePreDefined(list)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${usePreDefined === list ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
              >
                {list ? "Fixed list" : `Free ${type} entry`}
              </button>
            ))}
          </div>

          {usePreDefined ? (
            <>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-7">
                {options.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No options yet — add at least one.</span>
                ) : (
                  options.map((o) => (
                    <span key={o} className="inline-flex items-center gap-1 text-xs bg-(--custom-table-bg) border border-(--custom-table-border) rounded-md pl-2.5 pr-1 py-1">
                      {o}
                      <button type="button" onClick={() => setOptions(options.filter((x) => x !== o))} className="text-muted-foreground hover:text-foreground ml-0.5">
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={optInput}
                  onChange={(e) => setOptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Add an option, press Enter…"
                  className={formInputClass()}
                />
                <Button size="sm" variant="outline" leftIcon={<Plus size={13} />} onClick={addOption} type="button">
                  Add
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Admins type values freely when assigning this attribute.</p>
          )}
        </FormField>
      )}

      <FormField label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note about this attribute" className={formInputClass()} rows={2} />
      </FormField>
    </CreateModal>
  );
}

// --- Bulk apply modal ---

function BulkApplyModal({
  isOpen,
  onClose,
  lockedKind,
  preselectedIds,
  userPrincipals,
  appPrincipals,
  categories,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  lockedKind?: PrincipalKind;
  preselectedIds: string[];
  userPrincipals: CsaPrincipal[];
  appPrincipals: CsaPrincipal[];
  categories: CsaCategory[];
  onSubmit: (payload: { targetType: PrincipalKind; targetIds: string[]; action: "apply" | "remove"; attributeSetId: string; attributeName: string; isCollection?: boolean; value?: string }) => Promise<{ updated: number; failed: number }>;
}) {
  const [kind, setKind] = useState<PrincipalKind>(lockedKind ?? "user");
  const [action, setAction] = useState<"apply" | "remove">("apply");
  const [attrKey, setAttrKey] = useState("");
  const [value, setValue] = useState("");
  const [applyToAll, setApplyToAll] = useState(preselectedIds.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(null);

  const principals = kind === "servicePrincipal" ? appPrincipals : userPrincipals;
  const nounPlural = kind === "servicePrincipal" ? "applications" : "users";
  const allAttrs = categories.flatMap((c) => c.attributes);
  const selectedAttr = attrKey ? allAttrs.find((a) => tagKeyFor(a) === attrKey) : null;
  const targetIds = applyToAll ? principals.map((p) => p.id) : preselectedIds;
  const isValid = attrKey !== "" && targetIds.length > 0 && (action === "remove" || value.trim() !== "");

  function handleClose() {
    setKind(lockedKind ?? "user");
    setAction("apply");
    setAttrKey("");
    setValue("");
    setApplyToAll(preselectedIds.length === 0);
    setResult(null);
    onClose();
  }

  async function handleSubmit() {
    if (!isValid || !selectedAttr) return;
    setSubmitting(true);
    try {
      const res = await onSubmit({
        targetType: kind,
        targetIds,
        action,
        attributeSetId: selectedAttr.attributeSetId,
        attributeName: selectedAttr.name,
        isCollection: selectedAttr.cardinality === "multi",
        value: action === "apply" ? value : undefined,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Apply Complete" size="md" variant="success">
        <div className="py-6 text-center space-y-3">
          <p className="text-3xl font-bold text-foreground">{result.updated}</p>
          <p className="text-sm text-muted-foreground">{nounPlural} updated</p>
          {result.failed > 0 && <p className="text-sm text-warning-400">{result.failed} failed</p>}
          <Button size="sm" onClick={handleClose} className="mt-2">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <CreateModal isOpen={isOpen} onClose={handleClose} title="Bulk Apply Attribute" icon={<Layers size={16} className="text-info-400" />} onSubmit={handleSubmit} submitLabel={action === "apply" ? "Apply to All" : "Remove From All"} submitDisabled={!isValid} submitting={submitting} size="lg">
      {!lockedKind && (
        <FormField label="Target Type">
          <div className="flex gap-1.5 p-1 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg w-fit">
            {(["user", "servicePrincipal"] as PrincipalKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${kind === k ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
              >
                {k === "user" ? "Users" : "Applications"}
              </button>
            ))}
          </div>
        </FormField>
      )}

      <FormField label="Audience">
        <div className="flex gap-1.5 p-1 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg w-fit">
          {preselectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setApplyToAll(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!applyToAll ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              Selected ({preselectedIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setApplyToAll(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${applyToAll ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            All {nounPlural} ({principals.length})
          </button>
        </div>
      </FormField>

      <FormField label="Action">
        <div className="flex gap-1.5 p-1 bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg w-fit">
          {(["apply", "remove"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${action === a ? "bg-info/10 text-info-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              {a === "apply" ? "Apply value" : "Remove value"}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Attribute" required>
        <select
          value={attrKey}
          onChange={(e) => {
            setAttrKey(e.target.value);
            setValue("");
          }}
          className={formInputClass()}
        >
          <option value="">Choose an attribute…</option>
          {allAttrs.map((a) => (
            <option key={a.id} value={tagKeyFor(a)}>
              {a.attributeSetId} › {a.name}
            </option>
          ))}
        </select>
      </FormField>

      {selectedAttr && action === "apply" && (
        <FormField label="Value" required>
          {selectedAttr.valueMode === "list" ? (
            <select value={value} onChange={(e) => setValue(e.target.value)} className={formInputClass()}>
              <option value="">Choose…</option>
              {selectedAttr.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={value}
              onChange={(e) => setValue(selectedAttr.type === "number" ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value)}
              placeholder={selectedAttr.type === "number" ? "Numeric value" : "Value to assign"}
              className={formInputClass()}
            />
          )}
        </FormField>
      )}

      <p className="text-xs text-muted-foreground">
        {targetIds.length} {nounPlural} will be affected.
      </p>
    </CreateModal>
  );
}

// --- Main page ---

type TabKey = "attributes" | "users" | "applications";

const TABS: { id: TabKey; label: string; icon: typeof Layers }[] = [
  { id: "attributes", label: "Attributes", icon: Layers },
  { id: "users", label: "Users", icon: Users },
  { id: "applications", label: "Applications", icon: AppWindow },
];

export default function Page() {
  const { categories, isLoading: loadingAttrs } = useCsaAttributes();
  const { users, isLoading: loadingUsers } = useCsaUsers();
  const { servicePrincipals, isLoading: loadingSps, error: errorSps } = useCsaServicePrincipals();
  const { createAttribute, assignAttribute, removeAttribute, assignSpAttribute, removeSpAttribute, bulkApply } = useCsaMutations();

  const [tab, setTab] = useState<TabKey>("attributes");
  const [search, setSearch] = useState("");
  const [appTypeFilter, setAppTypeFilter] = useState<CsaAppType | "all">("all");
  const [detailAttr, setDetailAttr] = useState<CsaAttribute | null>(null);
  const [detailPrincipal, setDetailPrincipal] = useState<CsaPrincipal | null>(null);
  const [modal, setModal] = useState<"create" | "bulk" | null>(null);
  const [bulkLockedKind, setBulkLockedKind] = useState<PrincipalKind | undefined>(undefined);
  const [bulkPreselected, setBulkPreselected] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const allAttrs = useMemo(() => categories.flatMap((c) => c.attributes), [categories]);
  const userPrincipals = useMemo(() => users.map(userToPrincipal), [users]);

  const appPrincipals = useMemo(() => {
    const source = appTypeFilter === "all" ? servicePrincipals : servicePrincipals.filter((sp) => sp.appType === appTypeFilter);
    return source.map(spToPrincipal);
  }, [servicePrincipals, appTypeFilter]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({ ...cat, attributes: cat.attributes.filter((a) => a.name.toLowerCase().includes(q) || a.options.some((o) => o.toLowerCase().includes(q))) }))
      .filter((cat) => cat.attributes.length > 0);
  }, [categories, search]);

  // Default to fully expanded whenever the catalog loads, or auto-expand categories matching a search.
  const [expandReset, setExpandReset] = useState<{ categories: typeof categories; search: string } | null>(null);
  if (expandReset?.categories !== categories || expandReset?.search !== search) {
    setExpandReset({ categories, search });
    setExpandedCategories(new Set(filteredCategories.map((cat) => cat.id)));
  }

  const attributeRows = useMemo(() => visibleAttributeRows(filteredCategories, expandedCategories), [filteredCategories, expandedCategories]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredUserPrincipals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return userPrincipals;
    return userPrincipals.filter((p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q));
  }, [userPrincipals, search]);

  const filteredAppPrincipals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appPrincipals;
    return appPrincipals.filter((p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q));
  }, [appPrincipals, search]);

  async function handleCreate(payload: CreateAttributePayload) {
    try {
      await createAttribute.mutateAsync(payload);
      toast.success("Attribute created", { description: `${payload.name} is now available for assignment.` });
    } catch (err) {
      toast.error("Failed to create attribute", { description: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  }

  function openBulk(kind: PrincipalKind | undefined, ids: string[] = []) {
    setBulkLockedKind(kind);
    setBulkPreselected(ids);
    setModal("bulk");
  }

  async function handleBulkSubmit(payload: { targetType: PrincipalKind; targetIds: string[]; action: "apply" | "remove"; attributeSetId: string; attributeName: string; isCollection?: boolean; value?: string }) {
    const res = await bulkApply.mutateAsync(payload);
    if (res.failed === 0) toast.success("Bulk apply complete", { description: `${res.updated} updated.` });
    else toast.error("Bulk apply completed with errors", { description: `${res.updated} updated, ${res.failed} failed.` });
    return res;
  }

  async function handleAssignUser(id: string, setId: string, name: string, value: string, isCollection: boolean) {
    try {
      await assignAttribute.mutateAsync({ userId: id, payload: { attributeSetId: setId, attributeName: name, value, isCollection } });
      toast.success("Attribute assigned");
    } catch (err) {
      toast.error("Failed to assign attribute", { description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function handleRemoveUser(id: string, setId: string, name: string, isCollection: boolean) {
    try {
      await removeAttribute.mutateAsync({ userId: id, setId, name, isCollection });
      toast.success("Attribute removed");
    } catch (err) {
      toast.error("Failed to remove attribute", { description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function handleAssignSp(id: string, setId: string, name: string, value: string, isCollection: boolean) {
    try {
      await assignSpAttribute.mutateAsync({ spId: id, payload: { attributeSetId: setId, attributeName: name, value, isCollection } });
      toast.success("Attribute assigned");
    } catch (err) {
      toast.error("Failed to assign attribute", { description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function handleRemoveSp(id: string, setId: string, name: string, isCollection: boolean) {
    try {
      await removeSpAttribute.mutateAsync({ spId: id, setId, name, isCollection });
      toast.success("Attribute removed");
    } catch (err) {
      toast.error("Failed to remove attribute", { description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  const isLoading = loadingAttrs || loadingUsers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Attributes"
        description="Define and assign Custom Security Attributes to Entra ID users and applications in your tenant."
        breadcrumbs={[{ label: "Entra ID", href: "/dashboard/entra-id", icon: ShieldCheck }, { label: "Security Attributes", icon: Tag }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Layers size={14} />} onClick={() => openBulk(tab === "users" ? "user" : tab === "applications" ? "servicePrincipal" : undefined)}>
              Bulk Apply
            </Button>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setModal("create")}>
              New Attribute
            </Button>
          </div>
        }
      />

      <Tabs
        variant="pill"
        tabs={TABS}
        activeTab={tab}
        onChange={(id) => {
          setTab(id);
          setSearch("");
        }}
      />

      <DataTableMainHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tab === "attributes" ? "Search attributes or values…" : tab === "users" ? "Search users…" : "Search applications…"}
        filters={
          tab === "attributes" ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setExpandedCategories(new Set(filteredCategories.map((cat) => cat.id)))}>
                Expand all
              </Button>
              <Button variant="outline" size="sm" onClick={() => setExpandedCategories(new Set())}>
                Collapse all
              </Button>
            </>
          ) : tab === "applications" ? (
            <Dropdown options={APP_TYPE_FILTERS} value={appTypeFilter} onChange={(v) => setAppTypeFilter(v as CsaAppType | "all")} variant="selected" />
          ) : undefined
        }
      >
        {isLoading ? (
          <Loader size="md" text="Loading…" className="py-16" />
        ) : (
          <>
            {tab === "attributes" && (
              <DataTable<AttributeTreeRow>
                data={attributeRows}
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    key: "name",
                    header: "Attribute",
                    render: (_, row) =>
                      row.kind === "category" ? (
                        <div className="flex items-center gap-1.5">
                          {expandedCategories.has(row.category.id) ? (
                            <ChevronDown size={13} className="shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight size={13} className="shrink-0 text-muted-foreground" />
                          )}
                          <span className="text-xs font-semibold text-foreground">{row.category.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pl-5">
                          <Tag size={13} className="text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-foreground">{row.attr.name}</span>
                        </div>
                      ),
                  },
                  {
                    key: "type",
                    header: "Type",
                    render: (_, row) => (row.kind === "attribute" ? <TypePill attr={row.attr} /> : <Badge variant="neutral">{row.category.attributes.length} {row.category.attributes.length === 1 ? "attribute" : "attributes"}</Badge>),
                  },
                  {
                    key: "coverage",
                    header: "Coverage",
                    render: (_, row) => (row.kind === "attribute" ? <CoverageBar pct={computeCoverage(users, row.attr).pct} /> : null),
                  },
                  {
                    key: "actions",
                    header: "",
                    align: "right",
                    render: (_, row) => (row.kind === "attribute" ? <ChevronRight size={14} className="text-muted-foreground/50" /> : null),
                  },
                ]}
                onRowClick={(row) => (row.kind === "category" ? toggleCategory(row.category.id) : setDetailAttr(row.attr))}
                emptyState={{
                  icon: Tag,
                  title: categories.length === 0 ? "No attributes defined" : "No attributes match your search",
                  description: categories.length === 0 ? "Create a Custom Security Attribute to start classifying your users." : "Try a different attribute name or value.",
                }}
              />
            )}

            {tab === "users" && (
              <>
                {selectedUserIds.length > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-(--custom-table-border) bg-info/5">
                    <span className="text-xs font-medium text-foreground">{selectedUserIds.length} selected</span>
                    <Button size="sm" onClick={() => openBulk("user", selectedUserIds)}>
                      Bulk apply to selection
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds([])} className="ml-auto">
                      Deselect all
                    </Button>
                  </div>
                )}
                <PrincipalsTable
                  principals={filteredUserPrincipals}
                  allAttrs={allAttrs}
                  domain={USER_DOMAIN}
                  loading={loadingUsers}
                  selectedIds={selectedUserIds}
                  onToggleSelect={(id) => setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
                  onRowClick={setDetailPrincipal}
                />
              </>
            )}

            {tab === "applications" && (
              <>
                {errorSps ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-foreground">Couldn&apos;t load applications</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">{errorSps.message}</p>
                  </div>
                ) : (
                  <>
                    {selectedAppIds.length > 0 && (
                      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-(--custom-table-border) bg-info/5">
                        <span className="text-xs font-medium text-foreground">{selectedAppIds.length} selected</span>
                        <Button size="sm" onClick={() => openBulk("servicePrincipal", selectedAppIds)}>
                          Bulk apply to selection
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAppIds([])} className="ml-auto">
                          Deselect all
                        </Button>
                      </div>
                    )}
                    <PrincipalsTable
                      principals={filteredAppPrincipals}
                      allAttrs={allAttrs}
                      domain={APP_DOMAIN}
                      loading={loadingSps}
                      selectedIds={selectedAppIds}
                      onToggleSelect={(id) => setSelectedAppIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
                      onRowClick={setDetailPrincipal}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </DataTableMainHeader>

      <AttributeDetailSlideOver attr={detailAttr} users={users} onClose={() => setDetailAttr(null)} />

      <PrincipalDetailSlideOver
        principal={detailPrincipal}
        categories={categories}
        onClose={() => setDetailPrincipal(null)}
        onAssign={detailPrincipal?.kind === "servicePrincipal" ? handleAssignSp : handleAssignUser}
        onRemove={detailPrincipal?.kind === "servicePrincipal" ? handleRemoveSp : handleRemoveUser}
      />

      <CreateAttributeModal isOpen={modal === "create"} onClose={() => setModal(null)} categories={categories} onCreate={handleCreate} />

      <BulkApplyModal
        isOpen={modal === "bulk"}
        onClose={() => setModal(null)}
        lockedKind={bulkLockedKind}
        preselectedIds={bulkPreselected}
        userPrincipals={userPrincipals}
        appPrincipals={appPrincipals}
        categories={categories}
        onSubmit={handleBulkSubmit}
      />
    </div>
  );
}
