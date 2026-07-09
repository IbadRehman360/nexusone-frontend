"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useTenantRoles, useInvalidateMembers } from "@/src/hooks/data/useMembers";
import { createInvitation } from "@/src/services/invitations/invitationApi";
import { useAuth } from "@/src/hooks/useAuth";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { user } = useAuth();
  const { roles } = useTenantRoles();
  const invalidate = useInvalidateMembers();
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setEmail("");
    setRoleId("");
    onClose();
  };

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    if (!isValidEmail || !roleId || !user?.currentTenantId) return;
    setSubmitting(true);
    try {
      await createInvitation({ email: email.trim(), roleId, targetTenantId: user.currentTenantId });
      toast.success("Invitation sent", { description: `${email} has been invited.` });
      await invalidate();
      handleClose();
    } catch (err) {
      toast.error("Failed to send invitation", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite member"
      subtitle="Send an invitation to join this workspace."
      icon={<UserPlus size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Send invite"
      submitting={submitting}
    >
      <FormField label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className={formInputClass(email.length > 0 && !isValidEmail)}
        />
      </FormField>
      <FormField label="Role">
        <Dropdown
          variant="plain"
          value={roleId}
          onChange={setRoleId}
          placeholder="Select a role"
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
        />
      </FormField>
    </CreateModal>
  );
}
