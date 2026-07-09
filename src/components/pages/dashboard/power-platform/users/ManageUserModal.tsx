"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Building2, Search } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { useRoles } from "@/src/hooks/data/useRoles";
import { updateUserRoles, changeUserBusinessUnit } from "@/src/services/power-platform/userApi";
import type { BusinessUnit, PPUser } from "@/src/types/powerPlatform";

type TabId = "roles" | "businessUnit";

interface ManageUserModalProps {
  user: PPUser | null;
  environmentUrl: string;
  environmentName?: string;
  businessUnits: BusinessUnit[];
  onClose: () => void;
  onUpdated: () => void;
}

function flattenBusinessUnits(units: BusinessUnit[], depth = 0): { value: string; label: string }[] {
  return units.flatMap((u) => [
    { value: u.businessUnitId, label: `${"— ".repeat(depth)}${u.name}` },
    ...flattenBusinessUnits(u.children ?? [], depth + 1),
  ]);
}

export function ManageUserModal({ user, environmentUrl, environmentName, businessUnits, onClose, onUpdated }: ManageUserModalProps) {
  const [tab, setTab] = useState<TabId>("roles");
  const { roles: allRoles, isLoading: rolesLoading } = useRoles(environmentUrl);
  const [pendingRoleIds, setPendingRoleIds] = useState<Set<string>>(new Set());
  const [roleSearch, setRoleSearch] = useState("");
  const [savingRoles, setSavingRoles] = useState(false);

  const [newBusinessUnitId, setNewBusinessUnitId] = useState("");
  const [savingBu, setSavingBu] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTab("roles");
    setPendingRoleIds(new Set());
    setRoleSearch("");
    setNewBusinessUnitId(user.businessUnitId ?? "");
  }, [user]);

  // The list API only returns assigned role *names* (not IDs), so match by name to know what's already assigned.
  const assignedRoleNames = useMemo(() => new Set((user?.roles ?? []).map((r) => r.roleName)), [user]);

  const visibleRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return allRoles;
    return allRoles.filter((r) => r.roleName.toLowerCase().includes(q));
  }, [allRoles, roleSearch]);

  const toggleRole = (roleId: string, roleName: string) => {
    if (assignedRoleNames.has(roleName)) return;
    setPendingRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const handleSaveRoles = async () => {
    if (!user || pendingRoleIds.size === 0) return;
    setSavingRoles(true);
    try {
      await updateUserRoles(environmentUrl, user.userId, Array.from(pendingRoleIds));
      toast.success("Roles assigned", { description: `${pendingRoleIds.size} role(s) assigned to ${user.fullName}.` });
      setPendingRoleIds(new Set());
      onUpdated();
    } catch (err) {
      toast.error("Failed to assign roles", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSavingRoles(false);
    }
  };

  const handleSaveBusinessUnit = async () => {
    if (!user || !newBusinessUnitId || newBusinessUnitId === user.businessUnitId) return;
    setSavingBu(true);
    try {
      await changeUserBusinessUnit(environmentUrl, user.userId, newBusinessUnitId);
      toast.success("Business unit changed", { description: `${user.fullName} has been moved.` });
      onUpdated();
    } catch (err) {
      toast.error("Failed to change business unit", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSavingBu(false);
    }
  };

  if (!user) return null;

  const buOptions = flattenBusinessUnits(businessUnits);

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Manage User" size="lg" bodyClassName="!p-0">
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
          <div>
            <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          {environmentName && <span className="text-xs text-muted-foreground">{environmentName}</span>}
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 border-b border-border/40">
        <Tabs<TabId>
          variant="pill"
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: "roles", label: "Manage Roles", icon: ShieldCheck },
            { id: "businessUnit", label: "Change Business Unit", icon: Building2 },
          ]}
        />
      </div>

      <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
        {tab === "roles" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/30">
              <p className="text-xs text-info-400">Environment: {environmentName ?? "—"} — select the roles you want to assign to this user</p>
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles…"
                className="w-full h-9 pl-8 pr-3 bg-(--custom-table-bg) border border-(--custom-header-input-border) rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info/40 focus:border-info-400 transition-colors"
              />
            </div>

            {rolesLoading ? (
              <div className="py-10 text-center text-xs text-muted-foreground">Loading roles…</div>
            ) : visibleRoles.length === 0 ? (
              <div className="py-10 text-center">
                <ShieldCheck size={22} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No roles available</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-border/30 border border-border/30 rounded-lg">
                {visibleRoles.map((role) => {
                  const isAssigned = assignedRoleNames.has(role.roleName);
                  const isPending = pendingRoleIds.has(role.roleId);
                  return (
                    <label
                      key={role.roleId}
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer ${isAssigned ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/10"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned || isPending}
                        disabled={isAssigned}
                        onChange={() => toggleRole(role.roleId, role.roleName)}
                        className="w-4 h-4 rounded border-border accent-info"
                      />
                      <span className="text-foreground">{role.roleName}</span>
                      {isAssigned && <span className="ml-auto text-[10px] text-muted-foreground">Assigned</span>}
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Removing an already-assigned role isn&apos;t supported yet — only new assignments can be saved.</p>
          </div>
        )}

        {tab === "businessUnit" && (
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-xs text-warning-400">Changing business unit may affect user permissions and access</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Current</p>
              <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted/10 border border-border/30 rounded-lg">
                {user.businessUnitName ?? "—"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Select New Business Unit</label>
              <Dropdown
                variant="plain"
                value={newBusinessUnitId}
                onChange={setNewBusinessUnitId}
                options={buOptions}
                placeholder="— Select Business Unit —"
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        {tab === "roles" ? (
          <Button size="sm" onClick={handleSaveRoles} disabled={pendingRoleIds.size === 0} loading={savingRoles}>
            Save Roles
          </Button>
        ) : (
          <Button size="sm" onClick={handleSaveBusinessUnit} disabled={!newBusinessUnitId || newBusinessUnitId === user.businessUnitId} loading={savingBu}>
            Save Changes
          </Button>
        )}
      </div>
    </Modal>
  );
}
