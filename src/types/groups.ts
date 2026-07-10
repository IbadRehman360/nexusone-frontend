/** Entra ID Groups — mirrors entra-id.types.ts / entra-groups.detail.types.ts DTOs exactly. */

export interface GroupListItem {
  id: string;
  displayName: string;
  description?: string;
  mail?: string;
  mailEnabled?: boolean;
  mailNickname?: string;
  securityEnabled?: boolean;
  groupTypes?: string[];
  createdDateTime?: string;
  membershipRule?: string;
  membershipRuleProcessingState?: string;
}

export type GroupCategory = "security" | "microsoft365" | "distribution" | "mailSecurity";
export type MembershipType = "assigned" | "dynamic";
export type GroupSource = "cloud" | "onPremises";
export type GroupVisibility = "Public" | "Private" | "HiddenMembership" | null;
export type GroupFlagSeverity = "danger" | "warning" | "info" | "success";
export type GroupFlagCode =
  | "roleAssignable"
  | "targetedByConditionalAccess"
  | "ownerless"
  | "hasGuests"
  | "publicVisibility"
  | "dynamicRulePaused"
  | "onPremSynced"
  | "healthy";

export interface GroupFlag {
  code: GroupFlagCode;
  severity: GroupFlagSeverity;
  label: string;
  detail?: string;
}

export type PrincipalKind = "user" | "group" | "device" | "servicePrincipal" | "other";

export interface GroupPrincipal {
  id: string;
  displayName: string;
  secondaryText: string;
  kind: PrincipalKind;
  isGuest: boolean;
}

export interface GroupRoleGrant {
  id: string;
  displayName: string;
  description: string;
}

export interface GroupAppGrant {
  id: string;
  appDisplayName: string;
  resourceId: string;
}

export interface GroupLicenseGrant {
  skuId: string;
  name: string;
}

export interface GroupCaReference {
  id: string;
  displayName: string;
  usage: "include" | "exclude";
}

export interface GroupDetailStats {
  memberCount: number;
  ownerCount: number;
  guestCount: number;
  nestedGroupCount: number;
}

export type GroupSectionKey = "members" | "owners" | "roles" | "apps" | "licenses" | "conditionalAccess";

export interface EntraGroupDetail {
  id: string;
  displayName: string;
  description: string;
  mail: string | null;
  category: GroupCategory;
  membershipType: MembershipType;
  isAssignableToRole: boolean;
  visibility: GroupVisibility;
  source: GroupSource;
  createdDateTime: string | null;
  membershipRule: string | null;
  membershipRuleProcessingState: string | null;
  stats: GroupDetailStats;
  flags: GroupFlag[];
  owners: GroupPrincipal[];
  members: GroupPrincipal[];
  roles: GroupRoleGrant[];
  apps: GroupAppGrant[];
  licenses: GroupLicenseGrant[];
  conditionalAccess: GroupCaReference[];
  unavailable: GroupSectionKey[];
}
