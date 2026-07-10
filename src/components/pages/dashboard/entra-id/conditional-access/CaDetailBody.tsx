"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Loader } from "@/src/components/ui/feedback/Loader";
import { Button } from "@/src/components/ui/inputs/Button";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { useCaOverview, useCaConditions, useCaControls, useCaCoverage, useCaActivity } from "@/src/hooks/data/useConditionalAccess";
import type { CaDetailTab, CaState, NamedLocationRef } from "@/src/types/conditionalAccess";
import { HealthChips } from "./Page";
import { formatDateTime } from "@/src/lib/utils/dateFormat";

const STATE_LABEL: Record<CaState, string> = {
  enabled: "On",
  enabledForReportingButNotEnforced: "Report-only",
  disabled: "Off",
};

function BoolValue({ value, yes = "Yes", no = "No" }: { value: boolean; yes?: string; no?: string }) {
  return <span className={value ? "font-medium text-foreground" : "text-muted-foreground"}>{value ? yes : no}</span>;
}

function TokenList({ values, empty = "None" }: { values: string[]; empty?: string }) {
  if (values.length === 0) return <span className="text-muted-foreground">{empty}</span>;
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {values.map((v) => (
        <span key={v} className="rounded-md border border-(--custom-table-border) bg-(--custom-table-bg) px-1.5 py-0.5 text-[10px] text-foreground/70">
          {v}
        </span>
      ))}
    </div>
  );
}

function locationNames(refs: NamedLocationRef[]): string[] {
  return refs.map((r) => r.displayName);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
      <p className="border-b border-(--custom-table-border) py-2 text-xs font-semibold text-foreground">{title}</p>
      {children}
    </section>
  );
}

function TabStatus({ isLoading, error, isEmpty, emptyLabel = "Nothing to show.", onRetry, children }: { isLoading: boolean; error?: string; isEmpty?: boolean; emptyLabel?: string; onRetry?: () => void; children: React.ReactNode }) {
  if (isLoading) return <Loader size="md" text="Loading…" className="py-12" />;
  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="max-w-sm text-xs text-error-400">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  if (isEmpty) return <p className="py-12 text-center text-xs text-muted-foreground">{emptyLabel}</p>;
  return <>{children}</>;
}

function OverviewTab({ id }: { id: string }) {
  const { data, isLoading, error } = useCaOverview(id);
  return (
    <TabStatus isLoading={isLoading} error={error?.message} isEmpty={!data}>
      {data && (
        <Section title="Overview">
          <DetailRow label="State" value={data.stateLabel} />
          <DetailRow label="Assigned to" value={data.assignedToSummary} />
          <DetailRow label="Excluded" value={data.excludedSummary} />
          <DetailRow label="Target apps" value={data.targetAppsSummary} />
          <DetailRow label="Created" value={data.createdDateTime ? new Date(data.createdDateTime).toLocaleDateString() : "—"} />
          <DetailRow label="Last modified" value={data.modifiedDateTime ? new Date(data.modifiedDateTime).toLocaleDateString() : "—"} />
        </Section>
      )}
    </TabStatus>
  );
}

function ConditionsTab({ id }: { id: string }) {
  const { data, isLoading, error } = useCaConditions(id, true);
  return (
    <TabStatus isLoading={isLoading} error={error?.message} isEmpty={!data}>
      {data && (
        <div className="space-y-4">
          <Section title="Users">
            <DetailRow label="Include" value={<TokenList values={data.users.include} />} />
            <DetailRow label="Exclude" value={<TokenList values={data.users.exclude} />} />
            <DetailRow label="Include roles" value={<TokenList values={data.users.includeRoles} />} />
            <DetailRow label="Guests / external" value={data.users.includeGuestsExternal ? "Targeted" : "Not targeted"} />
          </Section>

          <Section title="Cloud apps & actions">
            <DetailRow label="Include" value={<TokenList values={data.applications.include} />} />
            <DetailRow label="Exclude" value={<TokenList values={data.applications.exclude} />} />
            <DetailRow label="User actions" value={<TokenList values={data.applications.userActions} />} />
          </Section>

          <Section title="Conditions">
            <DetailRow label="Platforms" value={<TokenList values={data.platforms.include} empty="Any" />} />
            <DetailRow label="Locations (include)" value={<TokenList values={locationNames(data.locations.include)} empty="Any" />} />
            <DetailRow label="Locations (exclude)" value={<TokenList values={locationNames(data.locations.exclude)} />} />
            <DetailRow label="Client apps" value={<TokenList values={data.clientAppTypes} empty="All" />} />
          </Section>

          <Section title="Risk (Entra ID P2)">
            {data.risk.p2Available ? (
              <>
                <DetailRow label="User risk" value={<TokenList values={data.risk.userRiskLevels} empty="None" />} />
                <DetailRow label="Sign-in risk" value={<TokenList values={data.risk.signInRiskLevels} empty="None" />} />
              </>
            ) : (
              <p className="py-2 text-xs text-muted-foreground">Risk-based conditions require Microsoft Entra ID P2. No risk conditions are configured on this policy.</p>
            )}
          </Section>
        </div>
      )}
    </TabStatus>
  );
}

function ControlsTab({ id }: { id: string }) {
  const { data, isLoading, error } = useCaControls(id, true);
  return (
    <TabStatus isLoading={isLoading} error={error?.message} isEmpty={!data}>
      {data && (
        <div className="space-y-4">
          <Section title={`Grant controls (${data.grant.operator})`}>
            <DetailRow label="Require MFA" value={<BoolValue value={data.grant.mfa} />} />
            <DetailRow label="Authentication strength" value={data.grant.authStrength ?? "—"} />
            <DetailRow label="Compliant device" value={<BoolValue value={data.grant.compliantDevice} />} />
            <DetailRow label="Hybrid joined device" value={<BoolValue value={data.grant.domainJoined} />} />
            <DetailRow label="Block access" value={<BoolValue value={data.grant.block} yes="Blocked" no="Not blocking" />} />
            <DetailRow label="Other controls" value={<TokenList values={data.grant.otherControls} />} />
          </Section>

          <Section title="Session controls">
            <DetailRow label="Sign-in frequency" value={data.session.signInFrequency ?? "Not configured"} />
            <DetailRow label="Persistent browser" value={data.session.persistentBrowser ?? "Not configured"} />
            <DetailRow label="App-enforced restrictions" value={<BoolValue value={data.session.appEnforcedRestrictions} />} />
            <DetailRow label="Continuous access evaluation" value={data.session.continuousAccessEvaluation ?? "Default"} />
          </Section>
        </div>
      )}
    </TabStatus>
  );
}

function CoverageTab({ id }: { id: string }) {
  const { data, isLoading, error } = useCaCoverage(id, true);
  return (
    <TabStatus isLoading={isLoading} error={error?.message} isEmpty={!data}>
      {data && (
        <div className="space-y-4">
          {data.gaps.length > 0 ? (
            <div className="space-y-2">
              {data.gaps.map((gap) => (
                <div key={gap.key} className={`rounded-xl border px-4 py-3 text-xs text-foreground/80 ${gap.severity === "danger" ? "border-error-400/30 bg-error-400/5" : "border-warning-400/30 bg-warning-400/5"}`}>
                  {gap.description}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-success-400/30 bg-success-400/5 px-4 py-3 text-xs text-foreground/80">No coverage gaps detected for this policy.</div>
          )}

          <Section title="Coverage checks">
            <DetailRow label="Blocks legacy authentication" value={<BoolValue value={data.legacyAuthBlocked} />} />
            <DetailRow label="Requires MFA for all users" value={<BoolValue value={data.allUsersHaveMfa} />} />
            <DetailRow label="Break-glass account excluded" value={<BoolValue value={data.breakGlassExcluded} />} />
          </Section>
        </div>
      )}
    </TabStatus>
  );
}

function ActivityTab({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useCaActivity(id, true);
  const rows = data?.changes ?? [];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Configuration changes to this policy in the last 30 days, from the directory audit log.</p>
      <TabStatus isLoading={isLoading} error={error?.message} onRetry={refetch} isEmpty={rows.length === 0} emptyLabel="No recorded changes to this policy in the last 30 days.">
        <div className="overflow-hidden rounded-xl border border-(--custom-table-border)">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 border-b border-(--custom-table-border) px-4 py-2 text-xs last:border-0">
              <span className="tabular-nums text-muted-foreground">{formatDateTime(row.activityDateTime)}</span>
              <span className="min-w-0 flex-1 truncate text-foreground">{row.activity}</span>
              <span className="truncate text-muted-foreground">{row.initiatedBy ?? "—"}</span>
            </div>
          ))}
        </div>
      </TabStatus>
    </div>
  );
}

const TABS: { id: CaDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Conditions" },
  { id: "controls", label: "Grant & Session" },
  { id: "coverage", label: "Coverage" },
  { id: "activity", label: "Activity" },
];

export function CaDetailSlideOver({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<CaDetailTab>("overview");
  const { data: overview, isLoading } = useCaOverview(id);
  const coverageWarn = (overview?.chips ?? []).some((c) => c.severity === "danger" || c.key === "report_only_too_long");

  function handleClose() {
    onClose();
    setTab("overview");
  }

  return (
    <SlideOver
      isOpen={!!id}
      onClose={handleClose}
      width="md"
      title={overview?.displayName ?? "Policy Detail"}
      subtitle={overview ? `Conditional Access policy · ${STATE_LABEL[overview.state]}` : "Conditional Access policy"}
      icon={<ShieldCheck size={16} className="text-info-400" />}
    >
      {id && (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border)">
            <Tabs
              variant="pill"
              tabs={TABS.map((t) => ({ id: t.id, label: t.id === "coverage" && coverageWarn ? `${t.label} •` : t.label }))}
              activeTab={tab}
              onChange={setTab}
            />
          </div>

          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="h-12 animate-pulse rounded-lg bg-muted/20" />
            ) : (
              overview && <HealthChips chips={overview.chips} />
            )}

            {tab === "overview" && <OverviewTab id={id} />}
            {tab === "conditions" && <ConditionsTab id={id} />}
            {tab === "controls" && <ControlsTab id={id} />}
            {tab === "coverage" && <CoverageTab id={id} />}
            {tab === "activity" && <ActivityTab id={id} />}
          </div>
        </div>
      )}
    </SlideOver>
  );
}
