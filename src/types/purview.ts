/** Purview module — Data Map & Scanning shapes. Mirrors purview-atlas.service.ts / log-analytics.service.ts DTOs exactly. */

export interface AtlasConnector {
  name: string;
  sourceName: string;
  sourceType: string;
  collectionId: string;
  environment: string | null;
  assetCount: number;
  lastScanAt: string | null;
  status: string;
}

export interface ConnectorFilters {
  status?: string;
  sourceType?: string;
}

export interface DataMapCollection {
  name: string;
  friendlyName: string;
  parentCollectionName: string | null;
  assetCount: number;
  description: string | null;
}

export interface DataSourceScan {
  scanName: string;
  lastRunStatus: string;
  lastRunTime: string | null;
  scanRuleSet: string;
}

export interface DataSourceDetail {
  name: string;
  displayName: string;
  sourceType: string;
  dataSourceId: string;
  collectionId: string;
  registeredOn: string | null;
  scansCount: number;
  scans: DataSourceScan[];
}

export interface ScanRuleSet {
  name: string;
  scanRulesetType: string;
  status: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  fileExtensions: string[];
  classificationRules: string[];
}

export interface ScanStatusRow {
  dataSourceName: string;
  scanName: string;
  status: string;
  assetsDiscovered: number;
  assetsFailed: number;
  scanType: string;
  errorMessage: string;
  scanDurationMs: number;
  timestamp: string;
}

export interface AtlasCatalogStats {
  totalAssets: number;
  certifiedAssets: number;
  noOwnerAssets: number;
  classifiedAssets: number;
  sensitiveColumns: number;
  glossaryTerms: number;
}

export interface AssetFilters {
  type?: string;
  source?: string;
}

export interface AtlasAsset {
  guid: string;
  name: string;
  typeName: string;
  qualifiedName: string;
  description: string | null;
  owner: string | null;
  certification: "Certified" | "Deprecated" | null;
  classificationCount: number;
  createTime: string | null;
  updateTime: string | null;
  sourceName: string | null;
}

export interface AtlasSchemaColumn {
  name: string;
  typeName: string;
  description: string | null;
  classifications: string[];
}

export interface AtlasContact {
  id: string;
  name: string;
  email: string | null;
  type: "Owner" | "Expert";
}

export interface AtlasAssetDetail extends AtlasAsset {
  schema: AtlasSchemaColumn[];
  contacts: AtlasContact[];
  classifications: string[];
  glossaryTerms: string[];
}

export type ClassifierType = "Built-in" | "Custom";

export interface AtlasSit {
  name: string;
  category: string;
  description: string | null;
  detectedCount: number;
  type: ClassifierType;
}

export interface ClassificationUsage {
  name: string;
  count: number;
  assets: AtlasAsset[];
}

export interface SensitivityLabel {
  id: string;
  name: string;
  description: string;
  color: string;
  tooltip: string | null;
  priority: number;
  isActive: boolean;
  appliesTo: string[];
  subLabels: SensitivityLabel[];
}

export interface GovernanceActivity {
  operationName: string;
  callerIpAddress: string | null;
  identity: string;
  resultType: string;
  resourceId: string;
  timestamp: string;
  category: string;
}

export interface DlpDetectedSit {
  name: string;
  count: number;
  confidence: number | null;
}

export interface DlpAlertDetail {
  policyName: string | null;
  ruleName: string | null;
  actions: string[];
  whatHappened: string | null;
  subject: string | null;
  fileName: string | null;
  recipients: string[];
  sensitiveInfoTypes: DlpDetectedSit[];
  eventCount: number | null;
}

export type DlpSeverity = "high" | "medium" | "low" | "informational" | "unknown";
export type DlpStatus = "new" | "inProgress" | "resolved";

export interface DlpAlert {
  id: string;
  displayName: string;
  severity: DlpSeverity;
  status: DlpStatus;
  detectedAt: string;
  users: string[];
  location: string;
  portalUrl?: string | null;
  detail?: DlpAlertDetail;
}

export interface CostDayPoint {
  date: string;
  cost: number;
  currency: string;
}

export interface CostSummary {
  currentMonthCost: number;
  lastMonthCost: number;
  currency: string;
  trendPercent: number;
  dailyTrend: CostDayPoint[];
}

export interface VCoreUsage {
  vCoreHours: number;
  cost: number;
  currency: string;
}

export interface PurviewMetrics {
  dataMapStorageSizeBytes: number;
  dataMapCapacityUnits: number;
  scanCompleted: number;
  scanFailed: number;
  scanCancelled: number;
  scanTimeTakenMs: number;
}

export interface ScanHistoryFilters {
  status?: string;
  dataSource?: string;
}

export interface IntegrationService {
  name: string;
  displayName: string;
  type: string;
  status: "healthy" | "degraded" | "unavailable" | "unconfigured";
  latencyMs: number | null;
  detail: string;
  lastCheckedAt: string;
  eventsLast7d: number | null;
}

export interface IntegrationsHealth {
  services: IntegrationService[];
  checkedAt: string;
  connectedCount: number;
  totalCount: number;
  notConfiguredCount: number;
  avgLatencyMs: number | null;
}
