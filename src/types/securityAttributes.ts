/**
 * Custom Security Attributes types — mirrors entra-csa.types.ts DTOs exactly.
 */

export type CsaAttributeType = "text" | "number" | "boolean";
export type CsaCardinality = "single" | "multi";
export type CsaValueMode = "list" | "free";
export type CsaTagValue = string | string[] | null;

export interface CsaAttribute {
  id: string;
  attributeSetId: string;
  name: string;
  description?: string;
  type: CsaAttributeType;
  cardinality: CsaCardinality;
  valueMode: CsaValueMode;
  options: string[];
  status: "Available" | "Deprecated";
}

export interface CsaCategory {
  id: string;
  name: string;
  description?: string;
  attributes: CsaAttribute[];
}

export interface CsaUser {
  id: string;
  name: string;
  upn: string;
  title: string;
  dept: string;
  initials: string;
  tags: Record<string, CsaTagValue>;
}

export type CsaAppType = "enterprise" | "microsoft" | "managed";

export interface CsaServicePrincipal {
  id: string;
  appId: string;
  name: string;
  spType: string;
  enabled: boolean;
  appType: CsaAppType;
  initials: string;
  tags: Record<string, CsaTagValue>;
}

export type PrincipalKind = "user" | "servicePrincipal";

/** Generic assignment target — users and service principals both map to this. */
export interface CsaPrincipal {
  id: string;
  kind: PrincipalKind;
  title: string;
  subtitle: string;
  meta: string;
  initials: string;
  tags: Record<string, CsaTagValue>;
}

export interface PrincipalDomain {
  kind: PrincipalKind;
  noun: string;
  nounPlural: string;
  groupLabel: string;
  columnHeader: string;
  metaHeader: string;
  searchPlaceholder: string;
}

export interface CreateAttributePayload {
  attributeSetId: string;
  newAttributeSetName?: string;
  name: string;
  type: "String" | "Integer" | "Boolean";
  isCollection: boolean;
  usePreDefinedValuesOnly: boolean;
  allowedValues?: string[];
  description?: string;
}

export interface AssignAttributePayload {
  attributeSetId: string;
  attributeName: string;
  value: string | number | boolean | string[];
  isCollection?: boolean;
}

export interface BulkAttributePayload {
  targetType: PrincipalKind;
  targetIds: string[];
  action: "apply" | "remove";
  attributeSetId: string;
  attributeName: string;
  isCollection?: boolean;
  value?: string | number | boolean;
}

export interface BulkAttributeResult {
  updated: number;
  failed: number;
}
