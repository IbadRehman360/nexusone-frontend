"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Tabs, type TabItem } from "@/src/components/ui/navigation/Tabs";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { StatsCardProps } from "@/src/components/ui/display/StatsCard";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import {
  useEnvironmentApps,
  useEnvironmentFlows,
  useEnvironmentPages,
  useEnvironmentTables,
  useEnvironmentD365Apps,
} from "@/src/hooks/data/useEnvironmentResources";
import { Button } from "@/src/components/ui/inputs/Button";
import type { PowerApp, PowerFlow, PowerPage, DataverseTable, D365App } from "@/src/types/powerPlatformResources";
import { LayoutGrid, Workflow, FileText, Table as TableIcon, Cloud, ExternalLink, Settings2 } from "lucide-react";
import { AppWindow } from "@phosphor-icons/react";

type TabId = "apps" | "flows" | "pages" | "d365" | "tables";

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function Page() {
  const [environmentUrl, setEnvironmentUrl] = useState("");
  const [tab, setTab] = useState<TabId>("apps");
  const [searchQuery, setSearchQuery] = useState("");

  const { environments } = useEnvironments();
  const environmentId = environments.find((e) => e.environmentUrl === environmentUrl)?.environmentId ?? "";
  const environmentName = environments.find((e) => e.environmentUrl === environmentUrl)?.environmentDisplayName;

  const { apps, isLoading: appsLoading, error: appsError } = useEnvironmentApps(environmentId);
  const { flows, isLoading: flowsLoading, error: flowsError } = useEnvironmentFlows(environmentId);
  const { pages, isLoading: pagesLoading, error: pagesError } = useEnvironmentPages(environmentId);
  const { tables, isLoading: tablesLoading, error: tablesError } = useEnvironmentTables(environmentId, environmentUrl);
  const { apps: d365Apps, isLoading: d365Loading, error: d365Error } = useEnvironmentD365Apps(environmentId);

  const activeFlows = flows.filter((f) => f.properties.state === "Started").length;

  const statCards: StatsCardProps[] = [
    { title: "Power Apps", value: apps.length, subtitle: "Power Platform", icon: LayoutGrid, color: "blue", isLoading: appsLoading },
    { title: "Flows", value: flows.length, subtitle: `${activeFlows} active`, icon: Workflow, color: "green", isLoading: flowsLoading },
    { title: "Pages", value: pages.length, subtitle: "Power Platform", icon: FileText, color: "purple", isLoading: pagesLoading },
    { title: "D365 Apps", value: d365Apps.length, subtitle: "Power Platform", icon: AppWindow, color: "orange", isLoading: d365Loading },
    { title: "Tables", value: tables.length, subtitle: "Dataverse", icon: TableIcon, color: "neutral", isLoading: tablesLoading },
  ];

  const tabs: TabItem<TabId>[] = [
    { id: "apps", label: "Power Apps", icon: LayoutGrid, count: apps.length },
    { id: "flows", label: "Flows", icon: Workflow, count: flows.length },
    { id: "pages", label: "Pages", icon: FileText, count: pages.length },
    { id: "d365", label: "D365 Apps", icon: AppWindow, count: d365Apps.length },
    { id: "tables", label: "Tables", icon: TableIcon, count: tables.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Apps, flows, pages, and tables in the selected environment."
        envBadge={environmentName}
        breadcrumbs={[
          { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
          { label: "Resources", icon: LayoutGrid },
        ]}
      />

      <StatsCarousel cards={statCards} />

      <DataTableMainHeader
        tabs={
          <Tabs<TabId>
            variant="pill"
            activeTab={tab}
            onChange={(id) => { setTab(id); setSearchQuery(""); }}
            tabs={tabs}
          />
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${tabs.find((t) => t.id === tab)?.label.toLowerCase()}…`}
        headerRight={<EnvironmentSelect value={environmentUrl} onChange={setEnvironmentUrl} />}
      >
        {tab === "apps" && (
          <DataTable<PowerApp>
            data={apps}
            keyExtractor={(app) => app.id}
            loading={appsLoading}
            error={appsError?.message}
            searchValue={searchQuery}
            columns={[
              { key: "displayName", header: "App", render: (_, app) => <span className="text-xs font-semibold text-foreground">{app.properties.displayName}</span> },
              { key: "appType", header: "Type", render: (_, app) => <span className="text-xs text-muted-foreground">{app.properties.appType ?? app.type ?? "—"}</span> },
              { key: "owner", header: "Owner", render: (_, app) => <span className="text-xs text-muted-foreground">{app.properties.owner?.displayName ?? "—"}</span> },
              { key: "lastModifiedTime", header: "Modified", render: (_, app) => <span className="text-xs text-foreground/70 tabular-nums">{formatDate(app.properties.lastModifiedTime)}</span> },
              {
                key: "shared",
                header: "Shared",
                render: (_, app) => (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {app.properties.sharedUsersCount ?? 0}u / {app.properties.sharedGroupsCount ?? 0}g
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (_, app) => (
                  <div className="flex items-center justify-end gap-2">
                    {app.properties.appOpenUri && (
                      <a
                        href={app.properties.appOpenUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Open app"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <a
                      href={`https://make.powerapps.com/environments/${environmentId}/apps/${app.id}/details`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" leftIcon={<Settings2 size={13} />}>
                        Manage
                      </Button>
                    </a>
                  </div>
                ),
              },
            ]}
            emptyState={{ icon: LayoutGrid, title: "No apps found", description: "Power Apps in this environment will appear here." }}
          />
        )}
        {tab === "flows" && (
          <DataTable<PowerFlow>
            data={flows}
            keyExtractor={(flow) => flow.id}
            loading={flowsLoading}
            error={flowsError?.message}
            searchValue={searchQuery}
            columns={[
              { key: "displayName", header: "Name", render: (_, flow) => <span className="text-xs font-semibold text-foreground">{flow.properties.displayName}</span> },
              { key: "state", header: "State", render: (_, flow) => <span className="text-xs text-muted-foreground">{flow.properties.state}</span> },
              { key: "lastModifiedTime", header: "Last Modified", render: (_, flow) => <span className="text-xs text-foreground/70 tabular-nums">{formatDate(flow.properties.lastModifiedTime)}</span> },
            ]}
            emptyState={{ icon: Workflow, title: "No flows found", description: "Power Automate flows in this environment will appear here." }}
          />
        )}
        {tab === "pages" && (
          <DataTable<PowerPage>
            data={pages}
            keyExtractor={(page) => page.id}
            loading={pagesLoading}
            error={pagesError?.message}
            searchValue={searchQuery}
            columns={[
              { key: "displayName", header: "Name", render: (_, page) => <span className="text-xs font-semibold text-foreground">{page.properties.displayName}</span> },
              { key: "status", header: "Status", render: (_, page) => <span className="text-xs text-muted-foreground">{page.properties.status ?? "—"}</span> },
              { key: "lastModifiedTime", header: "Last Modified", render: (_, page) => <span className="text-xs text-foreground/70 tabular-nums">{formatDate(page.properties.lastModifiedTime)}</span> },
            ]}
            emptyState={{ icon: FileText, title: "No pages found", description: "Power Pages sites in this environment will appear here." }}
          />
        )}
        {tab === "d365" && (
          <DataTable<D365App>
            data={d365Apps}
            keyExtractor={(app) => app.id}
            loading={d365Loading}
            error={d365Error?.message}
            searchValue={searchQuery}
            columns={[
              { key: "name", header: "Name", render: (_, app) => <span className="text-xs font-semibold text-foreground">{app.name}</span> },
              { key: "publisher", header: "Publisher", render: (_, app) => <span className="text-xs text-muted-foreground">{app.publisher ?? "—"}</span> },
              { key: "status", header: "Status", render: (_, app) => <span className="text-xs text-muted-foreground">{app.status ?? "—"}</span> },
            ]}
            emptyState={{ icon: AppWindow, title: "No D365 apps found", description: "Dynamics 365 apps in this environment will appear here." }}
          />
        )}
        {tab === "tables" && (
          <DataTable<DataverseTable>
            data={tables}
            keyExtractor={(table) => table.logicalName}
            loading={tablesLoading}
            error={tablesError?.message}
            searchValue={searchQuery}
            columns={[
              { key: "displayName", header: "Name", render: (_, table) => <span className="text-xs font-semibold text-foreground">{table.displayName}</span> },
              { key: "logicalName", header: "Logical Name", hideOnMobile: true, render: (_, table) => <span className="text-xs text-muted-foreground font-mono">{table.logicalName}</span> },
              { key: "isCustomEntity", header: "Type", render: (_, table) => <span className="text-xs text-muted-foreground">{table.isCustomEntity ? "Custom" : "System"}</span> },
            ]}
            emptyState={{ icon: TableIcon, title: "No tables found", description: "Dataverse tables in this environment will appear here." }}
          />
        )}
      </DataTableMainHeader>
    </div>
  );
}
