"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { useTenantRoles, useInvalidateMembers } from "@/src/hooks/data/useMembers";
import { createInvitation } from "@/src/services/invitations/invitationApi";
import { useAuth } from "@/src/hooks/useAuth";

const VIEWER_ROLE_NAME = "Viewer";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { user } = useAuth();
  // During the trial, invited members can only be assigned Viewer — the
  // backend enforces this too (assertTrialInviteAllowed); this just keeps
  // the picker from showing choices that would 403.
  const isTrial = user?.subscription?.status === "TRIAL";
  const { roles } = useTenantRoles();
  const invalidate = useInvalidateMembers();
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const viewerRole = roles.find((r) => r.name === VIEWER_ROLE_NAME);
  useEffect(() => {
    if (isTrial && viewerRole && roleId !== viewerRole.id) setRoleId(viewerRole.id);
  }, [isTrial, viewerRole, roleId]);

  const selectableRoles = isTrial ? roles.filter((r) => r.name === VIEWER_ROLE_NAME) : roles;

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
          placeholder={isTrial ? "Viewer" : "Select a role"}
          options={selectableRoles.map((r) => ({ value: r.id, label: r.name }))}
          disabled={isTrial}
        />
        {isTrial && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            During the trial, invited members are automatically assigned the Viewer role.
          </p>
        )}
      </FormField>
    </CreateModal>
  );
}
