"use client";

import { Globe, Layers, LayoutGrid, ShieldCheck, ShieldAlert, UploadCloud } from "lucide-react";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import type { StatsCardProps } from "@/src/components/ui/display/StatsCard";
import { useEnvironments } from "@/src/hooks/data/useEnvironments";
import { useEnvironmentGroups } from "@/src/hooks/data/useEnvironmentGroups";
import { useResourceSummary } from "@/src/hooks/data/useResourceSummary";
import { useComplianceOverview } from "@/src/hooks/data/useComplianceOverview";
import { usePpDlpPolicies } from "@/src/hooks/data/usePpDlpPolicies";
import { useImportJobs } from "@/src/hooks/data/useImportJobs";
import { useModulePhase } from "@/src/hooks/data/useModulePhase";
import { ModuleConnectBanner } from "@/src/components/module-connect/ModuleConnectBanner";
import {
  SAMPLE_PP_ENVIRONMENTS,
  SAMPLE_PP_ENVIRONMENT_GROUPS,
  SAMPLE_PP_RESOURCE_SUMMARY,
  SAMPLE_PP_COMPLIANCE_OVERVIEW,
  SAMPLE_PP_DLP_POLICIES,
  SAMPLE_PP_IMPORT_JOBS,
} from "@/src/lib/sampleData/powerPlatform";
import { HomeHeader } from "./HomeHeader";

export default function Page() {
  const { phase, locked } = useModulePhase("pp");
  const { environments: realEnvironments, isLoading: envLoading } = useEnvironments();
  const { groups: realGroups, isLoading: groupsLoading } = useEnvironmentGroups();
  const { summary: realSummary, isLoading: summaryLoading } = useResourceSummary();
  const { overview: realOverview, isLoading: complianceLoading } = useComplianceOverview();
  const { policies: realPolicies, isLoading: policiesLoading } = usePpDlpPolicies();
  const { jobs: realJobs, isLoading: jobsLoading } = useImportJobs();

  const environments = locked ? SAMPLE_PP_ENVIRONMENTS : realEnvironments;
  const groups = locked ? SAMPLE_PP_ENVIRONMENT_GROUPS : realGroups;
  const summary = locked ? SAMPLE_PP_RESOURCE_SUMMARY : realSummary;
  const overview = locked ? SAMPLE_PP_COMPLIANCE_OVERVIEW : realOverview;
  const policies = locked ? SAMPLE_PP_DLP_POLICIES : realPolicies;
  const jobs = locked ? SAMPLE_PP_IMPORT_JOBS : realJobs;

  const cards: StatsCardProps[] = [
    {
      title: "Environments",
      value: environments.length,
      subtitle: "Power Platform",
      icon: Globe,
      color: "blue",
      isLoading: !locked && envLoading,
      href: "/dashboard/power-platform/environments",
    },
    {
      title: "Apps & Flows",
      value: (summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0),
      subtitle: "Resources",
      icon: LayoutGrid,
      color: "purple",
      isLoading: !locked && summaryLoading,
      href: "/dashboard/power-platform/resources",
    },
    {
      title: "Environment Groups",
      value: groups.length,
      subtitle: "Power Platform",
      icon: Layers,
      color: "orange",
      isLoading: !locked && groupsLoading,
      href: "/dashboard/power-platform/environment-groups",
    },
    {
      title: "Compliant Environments",
      value: overview?.summary.compliant ?? 0,
      subtitle: "Of total checked",
      icon: ShieldCheck,
      color: "green",
      isLoading: !locked && complianceLoading,
      href: "/dashboard/power-platform/environmental-compliance",
    },
    {
      title: "DLP Policies",
      value: policies.length,
      subtitle: "Power Platform",
      icon: ShieldAlert,
      color: "red",
      isLoading: !locked && policiesLoading,
      href: "/dashboard/power-platform/dlp-policies",
    },
    {
      title: "Import Jobs",
      value: jobs.length,
      subtitle: "Power Platform",
      icon: UploadCloud,
      color: "neutral",
      isLoading: !locked && jobsLoading,
      href: "/dashboard/power-platform/import",
    },
  ];

  return (
    <div className="space-y-4">
      <HomeHeader />
      {phase === "trialing" && <ModuleConnectBanner module="pp" />}
      <StatsCarousel cards={cards} />
    </div>
  );
}
