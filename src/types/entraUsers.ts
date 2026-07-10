/** Entra ID Users — mirrors entra-id.types.ts DTOs exactly. */

export interface AssignedLicense {
  skuId: string;
  disabledPlans?: string[];
}

export interface EntraUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
  mobilePhone: string;
  accountEnabled: boolean;
  assignedLicenses: AssignedLicense[];
  createdDateTime: string;
}

export interface EntraUserGroup {
  id: string;
  displayName: string;
  description?: string;
}

export interface EntraUserAppAssignment {
  id: string;
  resourceId: string;
  resourceDisplayName: string;
  appRoleId?: string;
  createdDateTime?: string;
}

export type OwnedObjectType = "group" | "appRegistration" | "enterpriseApp" | "device" | "other";

export interface EntraUserOwnedObject {
  id: string;
  displayName: string;
  type: OwnedObjectType;
}
