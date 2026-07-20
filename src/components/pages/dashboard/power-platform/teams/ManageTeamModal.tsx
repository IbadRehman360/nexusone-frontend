"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe, Users, ShieldCheck, Building2, Search } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { Badge } from "@/src/components/ui/display/Badge";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { useRoles } from "@/src/hooks/data/useRoles";
import { getTeamRoles, assignRolesToTeam, changeTeamBusinessUnit } from "@/src/services/power-platform/teamApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { BusinessUnit, Team } from "@/src/types/powerPlatform";

type TabId = "overview" | "members" | "roles" | "businessUnit";

interface ManageTeamModalProps {
  team: Team | null;
  environmentUrl: string;
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

export function ManageTeamModal({ team, environmentUrl, businessUnits, onClose, onUpdated }: ManageTeamModalProps) {
  const [tab, setTab] = useState<TabId>("overview");

  // --- Roles tab state ---
  const { roles: allRoles, isLoading: allRolesLoading } = useRoles(environmentUrl);
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<string>>(new Set());
  const [pendingRoleIds, setPendingRoleIds] = useState<Set<string>>(new Set());
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [savingRoles, setSavingRoles] = useState(false);

  // --- Business unit tab state ---
  const [newBusinessUnitId, setNewBusinessUnitId] = useState("");
  const [savingBu, setSavingBu] = useState(false);

  useEffect(() => {
    if (!team) return;
    setTab("overview");
    setNewBusinessUnitId(team.businessUnitId ?? "");
    setPendingRoleIds(new Set());
    setRoleSearch("");

    let cancelled = false;
    setRolesLoading(true);
    getTeamRoles(environmentUrl, team.teamId)
      .then((res) => {
        if (cancelled) return;
        setAssignedRoleIds(new Set((res.data ?? []).map((r) => r.id)));
      })
      .catch(() => { if (!cancelled) setAssignedRoleIds(new Set()); })
      .finally(() => { if (!cancelled) setRolesLoading(false); });

    return () => { cancelled = true; };
  }, [team, environmentUrl]);

  const visibleRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return allRoles;
    return allRoles.filter((r) => r.roleName.toLowerCase().includes(q));
  }, [allRoles, roleSearch]);

  const totalAssignedCount = assignedRoleIds.size + pendingRoleIds.size;

  const toggleRole = (roleId: string) => {
    if (assignedRoleIds.has(roleId)) return; // already assigned server-side — no unassign endpoint yet
    setPendingRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const handleSaveRoles = async () => {
    if (!team || pendingRoleIds.size === 0) return;
    setSavingRoles(true);
    try {
      await assignRolesToTeam(environmentUrl, team.teamId, Array.from(pendingRoleIds));
      toast.success("Roles assigned", { description: `${pendingRoleIds.size} role(s) assigned to ${team.name}.` });
      setAssignedRoleIds((prev) => new Set([...prev, ...pendingRoleIds]));
      setPendingRoleIds(new Set());
      onUpdated();
    } catch (err) {
      showApiError(err, { title: "Failed to assign roles" });
    } finally {
      setSavingRoles(false);
    }
  };

  const handleSaveBusinessUnit = async () => {
    if (!team || !newBusinessUnitId || newBusinessUnitId === team.businessUnitId) return;
    setSavingBu(true);
    try {
      await changeTeamBusinessUnit(environmentUrl, team.teamId, newBusinessUnitId);
      toast.success("Business unit changed", { description: `${team.name} has been moved.` });
      onUpdated();
    } catch (err) {
      showApiError(err, { title: "Failed to change business unit" });
    } finally {
      setSavingBu(false);
    }
  };

  if (!team) return null;

  const isEntraTeam = !!team.azureAdObjectId;
  const buOptions = flattenBusinessUnits(businessUnits);

  return (
    <Modal
      isOpen={!!team}
      onClose={onClose}
      title={team.name}
      size="lg"
      bodyClassName="!p-0"
    >
      <div className="px-6 pt-5">
        <Badge variant={isEntraTeam ? "info" : "neutral"}>{isEntraTeam ? "Entra ID Team" : "Owner Team"}</Badge>
      </div>

      <div className="px-6 pt-4 pb-2 border-b border-border/40">
        <Tabs<TabId>
          variant="pill"
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: "Overview", icon: Globe },
            { id: "members", label: "Members", icon: Users },
            { id: "roles", label: "Roles", icon: ShieldCheck },
            { id: "businessUnit", label: "Business Unit", icon: Building2 },
          ]}
        />
      </div>

      <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Business Unit</p>
                <p className="text-sm font-medium text-foreground">{team.businessUnitName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Members</p>
                <p className="text-sm font-medium text-foreground">{team.memberCount ?? 0}</p>
              </div>
              {isEntraTeam && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Security Group</p>
                    <p className="text-sm font-medium text-foreground">{team.securityGroupName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Azure AD Object ID</p>
                    <p className="text-xs font-mono text-foreground/80 break-all">{team.azureAdObjectId}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "members" && (
          <div className="py-10 text-center">
            <Users size={22} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Member management coming soon</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Listing and editing individual team members isn&apos;t wired up yet — this team currently reports {team.memberCount ?? 0} member(s).
            </p>
          </div>
        )}

        {tab === "roles" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Security Roles</p>
                <p className="text-xs text-muted-foreground">{totalAssignedCount} of {allRoles.length} roles assigned</p>
              </div>
              <Badge variant="info">{totalAssignedCount} assigned</Badge>
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

            {rolesLoading || allRolesLoading ? (
              <div className="py-10 text-center text-xs text-muted-foreground">Loading roles…</div>
            ) : visibleRoles.length === 0 ? (
              <div className="py-10 text-center">
                <ShieldCheck size={22} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No roles available</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-border/30 border border-border/30 rounded-lg">
                {visibleRoles.map((role) => {
                  const isAssigned = assignedRoleIds.has(role.roleId);
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
                        onChange={() => toggleRole(role.roleId)}
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
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Business Unit</label>
              <Dropdown
                variant="plain"
                value={newBusinessUnitId}
                onChange={setNewBusinessUnitId}
                options={buOptions}
              />
              <p className="mt-1 text-xs text-muted-foreground">Moving a team changes which records and roles it can access.</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-end gap-2">
        {tab === "roles" && (
          <>
            <Button variant="outline" size="sm" onClick={() => setPendingRoleIds(new Set())} disabled={pendingRoleIds.size === 0 || savingRoles}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSaveRoles} disabled={pendingRoleIds.size === 0} loading={savingRoles}>
              Save Changes ({pendingRoleIds.size})
            </Button>
          </>
        )}
        {tab === "businessUnit" && (
          <Button size="sm" onClick={handleSaveBusinessUnit} disabled={!newBusinessUnitId || newBusinessUnitId === team.businessUnitId} loading={savingBu}>
            Save Changes
          </Button>
        )}
        {(tab === "overview" || tab === "members") && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </Modal>
  );
}
