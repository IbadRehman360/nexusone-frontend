export interface PowerApp {
  id: string;
  name: string;
  type?: string;
  properties: {
    displayName: string;
    description?: string;
    appOpenUri: string;
    appType?: string;
    createdTime: string;
    lastModifiedTime: string;
    owner: { id: string; displayName: string; email: string; type: string };
    sharedUsersCount: number;
    sharedGroupsCount: number;
  };
}

export interface PowerFlow {
  name: string;
  id: string;
  properties: {
    displayName: string;
    description?: string;
    state: "Started" | "Stopped" | "Suspended" | string;
    createdTime: string;
    lastModifiedTime: string;
  };
}

export interface PowerPage {
  name: string;
  id: string;
  properties: {
    displayName: string;
    description?: string;
    websiteUrl?: string;
    createdTime?: string;
    lastModifiedTime?: string;
    status?: string;
  };
}

export interface DataverseTable {
  logicalName: string;
  displayName: string;
  entitySetName: string;
  tableType: string;
  isCustomEntity: boolean;
  isManaged: boolean;
}

export interface D365App {
  id: string;
  name: string;
  uniqueName: string;
  description?: string;
  appOpenUri: string;
  appType: "D365";
  status?: string;
  publisher?: string;
}
