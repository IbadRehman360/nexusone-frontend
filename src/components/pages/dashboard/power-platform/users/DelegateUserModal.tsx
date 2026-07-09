"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, User } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { getDelegatorRoles, createDelegation, type DelegatorRole } from "@/src/services/power-platform/ppDelegationApi";
import type { PPUser } from "@/src/types/powerPlatform";

interface DelegateUserModalProps {
  delegator: PPUser | null;
  environmentUrl: string;
  users: PPUser[];
  onClose: () => void;
  onCreated: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function DelegateUserModal({ delegator, environmentUrl, users, onClose, onCreated }: DelegateUserModalProps) {
  const [delegateeId, setDelegateeId] = useState("");
  const [availableRoles, setAvailableRoles] = useState<DelegatorRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!delegator) return;
    setDelegateeId("");
    setSelectedRoleIds(new Set());
    setStartDate(todayIso());
    setEndDate("");
    setReason("");

    let cancelled = false;
    setRolesLoading(true);
    getDelegatorRoles(environmentUrl, delegator.userId)
      .then((roles) => { if (!cancelled) setAvailableRoles(roles); })
      .catch(() => { if (!cancelled) setAvailableRoles([]); })
      .finally(() => { if (!cancelled) setRolesLoading(false); });

    return () => { cancelled = true; };
  }, [delegator, environmentUrl]);

  const delegateeOptions = useMemo(
    () => users.filter((u) => u.userId !== delegator?.userId).map((u) => ({ value: u.userId, label: `${u.fullName} (${u.email})` })),
    [users, delegator],
  );

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const canSubmit = !!delegateeId && selectedRoleIds.size > 0 && !!startDate && !!endDate;

  const handleSubmit = async () => {
    if (!delegator || !canSubmit) return;
    setSubmitting(true);
    try {
      await createDelegation({
        environmentUrl,
        delegatorId: delegator.userId,
        delegateeId,
        roleIds: Array.from(selectedRoleIds),
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });
      toast.success("Delegation created", { description: "The role delegation has been scheduled." });
      onCreated();
      onClose();
    } catch (err) {
      toast.error("Failed to create delegation", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!delegator) return null;

  return (
    <CreateModal
      isOpen={!!delegator}
      onClose={onClose}
      title="Delegate Power Platform Roles"
      icon={<CalendarCheck size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Create Delegation"
      submitDisabled={!canSubmit}
      submitting={submitting}
      size="lg"
    >
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">Delegating from</label>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/10 border border-border/30">
          <User size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{delegator.fullName}</p>
            <p className="text-xs text-muted-foreground">{delegator.email}</p>
          </div>
        </div>
      </div>

      <FormField label="Delegate to" required>
        <Dropdown
          variant="plain"
          value={delegateeId}
          onChange={setDelegateeId}
          options={delegateeOptions}
          placeholder="Select a user…"
        />
      </FormField>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Roles to delegate <span className="text-muted-foreground font-normal">({availableRoles.length} available)</span>
        </label>
        {rolesLoading ? (
          <p className="text-xs text-muted-foreground">Loading roles…</p>
        ) : availableRoles.length === 0 ? (
          <p className="text-xs text-muted-foreground">This user has no roles available to delegate.</p>
        ) : (
          <div className="max-h-40 overflow-y-auto divide-y divide-border/30 border border-border/30 rounded-lg">
            {availableRoles.map((role) => (
              <label key={role.roleId} className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-muted/10">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.has(role.roleId)}
                  onChange={() => toggleRole(role.roleId)}
                  className="w-4 h-4 rounded border-border accent-info"
                />
                <span className="text-foreground">{role.roleName}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start date" required>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={formInputClass()} />
        </FormField>
        <FormField label="End date" required>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className={formInputClass()} />
        </FormField>
      </div>

      <FormField label="Reason" hint="Optional">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Covering for Sarah while on annual leave…"
          rows={2}
          className={formInputClass() + " resize-none"}
        />
      </FormField>
    </CreateModal>
  );
}
