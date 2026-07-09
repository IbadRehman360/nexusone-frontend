"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Cloud, ArrowLeft, Zap } from "lucide-react";
import { ShieldCheck } from "@phosphor-icons/react";

interface ComplianceDetailHeaderProps {
  name: string;
  isHistory?: boolean;
  onRunCheck: () => void;
  running: boolean;
}

export function ComplianceDetailHeader({ name, isHistory, onRunCheck, running }: ComplianceDetailHeaderProps) {
  const router = useRouter();

  return (
    <PageHeader
      title={isHistory ? `${name} — History` : name}
      description={isHistory ? "Past compliance reports for this environment." : "Compliance posture for this environment."}
      breadcrumbs={[
        { label: "Power Platform", href: "/dashboard/power-platform", icon: Cloud },
        { label: "Compliance", href: "/dashboard/power-platform/environmental-compliance", icon: ShieldCheck },
        ...(isHistory ? [{ label: name }, { label: "History" }] : [{ label: name }]),
      ]}
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push("/dashboard/power-platform/environmental-compliance")}>
            Back
          </Button>
          <Button size="sm" leftIcon={<Zap size={14} />} onClick={onRunCheck} loading={running}>
            Run Check
          </Button>
        </div>
      }
    />
  );
}
