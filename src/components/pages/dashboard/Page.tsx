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
import { HomeHeader } from "./HomeHeader";

export default function Page() {
  const { environments, isLoading: envLoading } = useEnvironments();
  const { groups, isLoading: groupsLoading } = useEnvironmentGroups();
  const { summary, isLoading: summaryLoading } = useResourceSummary();
  const { overview, isLoading: complianceLoading } = useComplianceOverview();
  const { policies, isLoading: policiesLoading } = usePpDlpPolicies();
  const { jobs, isLoading: jobsLoading } = useImportJobs();

  const cards: StatsCardProps[] = [
    {
      title: "Environments",
      value: environments.length,
      subtitle: "Power Platform",
      icon: Globe,
      color: "blue",
      isLoading: envLoading,
      href: "/dashboard/power-platform/environments",
    },
    {
      title: "Apps & Flows",
      value: (summary?.totals.apps ?? 0) + (summary?.totals.flows ?? 0),
      subtitle: "Resources",
      icon: LayoutGrid,
      color: "purple",
      isLoading: summaryLoading,
      href: "/dashboard/power-platform/resources",
    },
    {
      title: "Environment Groups",
      value: groups.length,
      subtitle: "Power Platform",
      icon: Layers,
      color: "orange",
      isLoading: groupsLoading,
      href: "/dashboard/power-platform/environment-groups",
    },
    {
      title: "Compliant Environments",
      value: overview?.summary.compliant ?? 0,
      subtitle: "Of total checked",
      icon: ShieldCheck,
      color: "green",
      isLoading: complianceLoading,
      href: "/dashboard/power-platform/environmental-compliance",
    },
    {
      title: "DLP Policies",
      value: policies.length,
      subtitle: "Power Platform",
      icon: ShieldAlert,
      color: "red",
      isLoading: policiesLoading,
      href: "/dashboard/power-platform/dlp-policies",
    },
    {
      title: "Import Jobs",
      value: jobs.length,
      subtitle: "Power Platform",
      icon: UploadCloud,
      color: "neutral",
      isLoading: jobsLoading,
      href: "/dashboard/power-platform/import",
    },
  ];

  return (
    <div className="space-y-4">
      <HomeHeader />
      <StatsCarousel cards={cards} />
    </div>
  );
}
