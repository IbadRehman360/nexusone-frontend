"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { getDelegatorRoles, createDelegation, type DelegatorRole } from "@/src/services/power-platform/ppDelegationApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { PPUser } from "@/src/types/powerPlatform";

interface CreateDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  environmentUrl: string;
  users: PPUser[];
  onCreated: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateDelegationModal({ isOpen, onClose, environmentUrl, users, onCreated }: CreateDelegationModalProps) {
  const [delegatorId, setDelegatorId] = useState("");
  const [delegateeId, setDelegateeId] = useState("");
  const [availableRoles, setAvailableRoles] = useState<DelegatorRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setDelegatorId("");
    setDelegateeId("");
    setAvailableRoles([]);
    setSelectedRoleIds(new Set());
    setStartDate(todayIso());
    setEndDate("");
    setReason("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!delegatorId) {
      setAvailableRoles([]);
      return;
    }
    setSelectedRoleIds(new Set());
    let cancelled = false;
    setRolesLoading(true);
    getDelegatorRoles(environmentUrl, delegatorId)
      .then((roles) => { if (!cancelled) setAvailableRoles(roles); })
      .catch(() => { if (!cancelled) setAvailableRoles([]); })
      .finally(() => { if (!cancelled) setRolesLoading(false); });
    return () => { cancelled = true; };
  }, [delegatorId, environmentUrl]);

  const delegatorOptions = useMemo(
    () => users.map((u) => ({ value: u.userId, label: `${u.fullName} (${u.email})` })),
    [users],
  );
  const delegateeOptions = useMemo(
    () => users.filter((u) => u.userId !== delegatorId).map((u) => ({ value: u.userId, label: `${u.fullName} (${u.email})` })),
    [users, delegatorId],
  );

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const canSubmit = !!delegatorId && !!delegateeId && selectedRoleIds.size > 0 && !!startDate && !!endDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createDelegation({
        environmentUrl,
        delegatorId,
        delegateeId,
        roleIds: Array.from(selectedRoleIds),
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });
      toast.success("Delegation created", { description: "The role delegation has been scheduled." });
      onCreated();
      handleClose();
    } catch (err) {
      showApiError(err, { title: "Failed to create delegation" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Delegation"
      subtitle="Temporarily grant Power Platform roles to a user for a set period."
      icon={<CalendarCheck size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Create Delegation"
      submitDisabled={!canSubmit}
      submitting={submitting}
      size="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Delegating from" required>
          <Dropdown
            variant="plain"
            value={delegatorId}
            onChange={setDelegatorId}
            options={delegatorOptions}
            placeholder="Select a user…"
          />
        </FormField>
        <FormField label="Delegate to" required>
          <Dropdown
            variant="plain"
            value={delegateeId}
            onChange={setDelegateeId}
            options={delegateeOptions}
            placeholder="Select a user…"
            disabled={!delegatorId}
          />
        </FormField>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Roles to delegate {delegatorId && <span className="text-muted-foreground font-normal">({availableRoles.length} available)</span>}
        </label>
        {!delegatorId ? (
          <p className="text-xs text-muted-foreground">Select a delegator to see their assignable roles.</p>
        ) : rolesLoading ? (
          <p className="text-xs text-muted-foreground">Loading roles…</p>
        ) : availableRoles.length === 0 ? (
          <p className="text-xs text-muted-foreground">This user has no roles available to delegate.</p>
        ) : (
          <div className="max-h-40 overflow-y-auto divide-y divide-border/30 border border-(--custom-table-border) rounded-lg">
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
