"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useTenantRoles, useInvalidateMembers } from "@/src/hooks/data/useMembers";
import { updateMemberRole } from "@/src/services/tenants/tenantApi";
import { useAuth } from "@/src/hooks/useAuth";
import type { TenantMember } from "@/src/services/tenants/tenantApi";

interface EditRoleModalProps {
  member: TenantMember | null;
  onClose: () => void;
}

export function EditRoleModal({ member, onClose }: EditRoleModalProps) {
  const { user } = useAuth();
  const { roles } = useTenantRoles();
  const invalidate = useInvalidateMembers();
  const [roleId, setRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setRoleId(roles.find((r) => r.name === member.role)?.id ?? "");
    }
  }, [member, roles]);

  const handleSave = async () => {
    if (!member || !roleId || !user?.currentTenantId) return;
    setSubmitting(true);
    try {
      await updateMemberRole(user.currentTenantId, member.id, roleId);
      toast.success("Role updated", { description: `${member.fullName}'s role has been changed.` });
      await invalidate();
      onClose();
    } catch (err) {
      toast.error("Failed to update role", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!member}
      onClose={onClose}
      title="Change role"
      subtitle={member?.fullName}
      variant="info"
      size="sm"
      loading={submitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" leftIcon={<Pencil size={13} />} onClick={handleSave} loading={submitting} disabled={!roleId}>
            Save
          </Button>
        </div>
      }
    >
      <Dropdown variant="plain" value={roleId} onChange={setRoleId} placeholder="Select a role" options={roles.map((r) => ({ value: r.id, label: r.name }))} />
    </Modal>
  );
}
