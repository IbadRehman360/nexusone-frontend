"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UsersThree } from "@phosphor-icons/react";
import { CreateModal, FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { createTeam } from "@/src/services/power-platform/teamApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { BusinessUnit } from "@/src/types/powerPlatform";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  environmentUrl: string;
  environmentName?: string;
  businessUnits: BusinessUnit[];
  onCreated: () => void;
}

function flattenBusinessUnits(units: BusinessUnit[], depth = 0): { value: string; label: string }[] {
  return units.flatMap((u) => [
    { value: u.businessUnitId, label: `${"— ".repeat(depth)}${u.name}` },
    ...flattenBusinessUnits(u.children ?? [], depth + 1),
  ]);
}

const MEMBERSHIP_OPTIONS = [
  { value: "0", label: "Members and guests" },
  { value: "1", label: "Members only" },
];

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CreateTeamModal({ isOpen, onClose, environmentUrl, environmentName, businessUnits, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [businessUnitId, setBusinessUnitId] = useState("");
  const [description, setDescription] = useState("");
  const [teamType, setTeamType] = useState<0 | 2>(0);
  const [azureAdObjectId, setAzureAdObjectId] = useState("");
  const [membershipType, setMembershipType] = useState<"0" | "1">("1");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buOptions = flattenBusinessUnits(businessUnits);

  const reset = () => {
    setName("");
    setBusinessUnitId("");
    setDescription("");
    setTeamType(0);
    setAzureAdObjectId("");
    setMembershipType("1");
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Team name is required";
    if (!businessUnitId) nextErrors.businessUnitId = "Business unit is required";
    if (teamType === 2 && !guidRegex.test(azureAdObjectId.trim())) {
      nextErrors.azureAdObjectId = "Enter a valid Azure AD Object ID (GUID)";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createTeam({
        environmentUrl,
        name: name.trim(),
        businessunitid: businessUnitId,
        teamtype: teamType,
        description: description.trim() || undefined,
        ...(teamType === 2 && {
          azureactivedirectoryobjectid: azureAdObjectId.trim(),
          membershiptype: Number(membershipType) as 0 | 1,
        }),
      });
      toast.success("Team created", { description: `${name} has been created successfully.` });
      onCreated();
      handleClose();
    } catch (err) {
      showApiError(err, { title: "Failed to create team" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Team"
      subtitle={environmentName ? `New team will be created in ${environmentName}.` : undefined}
      icon={<UsersThree size={16} className="text-info-400" />}
      onSubmit={handleSubmit}
      submitLabel="Create Team"
      submitDisabled={!name.trim() || !businessUnitId}
      submitting={submitting}
      size="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Team Name" required error={errors.name} hint={!errors.name ? "Must be unique within the business unit (max 160 chars)" : undefined}>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
            placeholder="e.g., Sales Team, Marketing Team"
            className={formInputClass(!!errors.name)}
          />
        </FormField>
        <FormField label="Business Unit" required error={errors.businessUnitId} hint={!errors.businessUnitId ? "The team will be associated with this business unit" : undefined}>
          <Dropdown
            variant="plain"
            value={businessUnitId}
            onChange={(v) => { setBusinessUnitId(v); setErrors((er) => ({ ...er, businessUnitId: "" })); }}
            options={buOptions}
            placeholder="Select a business unit…"
          />
        </FormField>
      </div>

      <FormField label="Description" hint="Optional (max 1024 characters)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the team's purpose"
          rows={2}
          maxLength={1024}
          className={formInputClass() + " resize-none"}
        />
      </FormField>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">Team Type <span className="text-error-400">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTeamType(0)}
            className={`text-left p-3 rounded-lg border transition-colors ${teamType === 0 ? "border-info-400 bg-info/5" : "border-border/50 hover:border-border"}`}
          >
            <p className="text-sm font-medium text-foreground">Owner Team</p>
            <p className="text-xs text-muted-foreground mt-0.5">Traditional team that can own records and have security roles assigned</p>
          </button>
          <button
            type="button"
            onClick={() => setTeamType(2)}
            className={`text-left p-3 rounded-lg border transition-colors ${teamType === 2 ? "border-info-400 bg-info/5" : "border-border/50 hover:border-border"}`}
          >
            <p className="text-sm font-medium text-foreground">Entra ID Security Group</p>
            <p className="text-xs text-muted-foreground mt-0.5">Links to an existing Entra ID security group for automatic synchronisation</p>
          </button>
        </div>
      </div>

      {teamType === 2 && (
        <>
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-xs text-warning-400">Team type cannot be changed after creation. Choose carefully.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Azure AD Object ID" required error={errors.azureAdObjectId} hint={!errors.azureAdObjectId ? "GUID of the Entra ID security group to link" : undefined}>
              <input
                type="text"
                value={azureAdObjectId}
                onChange={(e) => { setAzureAdObjectId(e.target.value); setErrors((er) => ({ ...er, azureAdObjectId: "" })); }}
                placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                className={formInputClass(!!errors.azureAdObjectId) + " font-mono"}
              />
            </FormField>
            <FormField label="Membership Type" hint="Defines who from the Entra ID group can access Dataverse">
              <Dropdown
                variant="plain"
                value={membershipType}
                onChange={(v) => setMembershipType(v as "0" | "1")}
                options={MEMBERSHIP_OPTIONS}
              />
            </FormField>
          </div>
        </>
      )}
    </CreateModal>
  );
}
