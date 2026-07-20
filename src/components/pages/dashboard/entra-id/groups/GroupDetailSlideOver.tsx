"use client";

import { useState } from "react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { Users, ShieldAlert, TriangleAlert, Info, CheckCircle2, Braces } from "lucide-react";
import { useGroupDetail } from "@/src/hooks/data/useGroups";
import type { GroupFlag, GroupPrincipal, GroupSectionKey } from "@/src/types/groups";
import { formatDate } from "@/src/lib/utils/dateFormat";
import { InlineError } from "@/src/components/error/InlineError";
import { presentError } from "@/src/lib/errors/getErrorPresentation";

type GroupTabKey = "overview" | "owners" | "members" | "access";

const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  microsoft365: "Microsoft 365",
  distribution: "Distribution",
  mailSecurity: "Mail-enabled security",
};

const SOURCE_LABEL: Record<string, string> = { cloud: "Cloud", onPremises: "On-premises" };

function visibilityLabel(visibility: string | null): string {
  if (!visibility) return "—";
  if (visibility === "HiddenMembership") return "Hidden membership";
  return visibility;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}

function FlagBanner({ flag }: { flag: GroupFlag }) {
  const Icon = flag.severity === "danger" ? ShieldAlert : flag.severity === "warning" ? TriangleAlert : flag.severity === "success" ? CheckCircle2 : Info;
  const colorClass =
    flag.severity === "danger"
      ? "border-error/30 bg-error/10 text-error-400"
      : flag.severity === "warning"
        ? "border-warning/30 bg-warning/10 text-warning-400"
        : flag.severity === "success"
          ? "border-success/30 bg-success/10 text-success-400"
          : "border-info/30 bg-info/10 text-info-400";
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-xs ${colorClass}`}>
      <Icon size={14} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">{flag.label}</p>
        {flag.detail && <p className="text-[11px] opacity-80 mt-0.5">{flag.detail}</p>}
      </div>
    </div>
  );
}

function PrincipalList({ principals, unavailable, emptyLabel }: { principals: GroupPrincipal[]; unavailable: boolean; emptyLabel: string }) {
  if (unavailable) return <p className="text-xs text-muted-foreground py-3">Unavailable — insufficient Graph permissions.</p>;
  if (principals.length === 0) return <p className="text-xs text-muted-foreground py-3">{emptyLabel}</p>;
  return (
    <div className="divide-y divide-(--custom-table-border)">
      {principals.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{p.displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{p.secondaryText}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {p.isGuest && <Badge variant="warning">Guest</Badge>}
            <Badge variant="neutral">{p.kind}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupDetailSlideOver({ groupId, onClose }: { groupId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<GroupTabKey>("overview");
  const [ownersExpanded, setOwnersExpanded] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);

  const { detail, isLoading, error } = useGroupDetail(groupId);

  const unavailable = (key: GroupSectionKey) => detail?.unavailable.includes(key) ?? false;
  const ownersToShow = detail ? (ownersExpanded ? detail.owners : detail.owners.slice(0, 5)) : [];
  const membersToShow = detail ? (membersExpanded ? detail.members : detail.members.slice(0, 5)) : [];
  const accessCount = detail ? detail.roles.length + detail.apps.length + detail.licenses.length + detail.conditionalAccess.length : 0;

  function handleClose() {
    onClose();
    setTab("overview");
  }

  return (
    <SlideOver
      isOpen={!!groupId}
      onClose={handleClose}
      width="md"
      title={detail?.displayName ?? "Group"}
      subtitle="Group · read-only from Microsoft Graph"
      icon={<Users size={16} className="text-info-400" />}
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading group…</p>
      ) : error ? (
        <InlineError error={presentError(error)} />
      ) : !detail ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Could not load this group&apos;s details.</p>
      ) : (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border)">
            <Tabs
              variant="pill"
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "owners", label: "Owners", count: detail.owners.length },
                { id: "members", label: "Members", count: detail.members.length },
                { id: "access", label: "Access", count: accessCount },
              ]}
              activeTab={tab}
              onChange={setTab}
            />
          </div>

          {tab === "overview" && (
            <div className="p-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{CATEGORY_LABEL[detail.category] ?? detail.category}</Badge>
                <Badge variant={detail.membershipType === "dynamic" ? "info" : "neutral"}>{detail.membershipType === "dynamic" ? "Dynamic" : "Assigned"}</Badge>
                {detail.isAssignableToRole && (
                  <Badge variant="error">
                    <ShieldAlert size={10} className="mr-1" />
                    Role-assignable
                  </Badge>
                )}
              </div>

              {detail.description && <p className="text-xs text-muted-foreground">{detail.description}</p>}

              <Section title="Details">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="Created" value={formatDate(detail.createdDateTime)} />
                  <DetailRow label="Source" value={SOURCE_LABEL[detail.source] ?? detail.source} />
                  <DetailRow label="Visibility" value={visibilityLabel(detail.visibility)} />
                  <DetailRow label="Object ID" value={<span className="font-mono text-[11px]">{detail.id}</span>} />
                  {detail.mail && <DetailRow label="Email" value={detail.mail} />}
                  <DetailRow label="Members" value={detail.stats.memberCount} />
                  <DetailRow label="Owners" value={detail.stats.ownerCount} />
                  <DetailRow label="Guests" value={detail.stats.guestCount} />
                  <DetailRow label="Nested groups" value={detail.stats.nestedGroupCount} />
                </div>
              </Section>

              {detail.flags.length > 0 && (
                <div className="space-y-2">
                  {detail.flags.map((flag) => (
                    <FlagBanner key={flag.code} flag={flag} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "owners" && (
            <div className="p-5 space-y-5">
              <Section title={`Owners (${detail.owners.length})`}>
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <PrincipalList principals={ownersToShow} unavailable={unavailable("owners")} emptyLabel="No owners assigned." />
                </div>
                {detail.owners.length > 5 && (
                  <Button variant="link" size="sm" onClick={() => setOwnersExpanded((v) => !v)} className="mt-2 h-auto p-0 text-[11px] text-info-400">
                    {ownersExpanded ? "Show less" : `+${detail.owners.length - 5} more`}
                  </Button>
                )}
              </Section>
            </div>
          )}

          {tab === "members" && (
            <div className="p-5 space-y-5">
              <Section title={`Members (${detail.members.length})`}>
                {detail.membershipType === "dynamic" && detail.membershipRule && (
                  <div className="mb-3 rounded-lg bg-muted/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Braces size={12} className="text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Membership rule</span>
                    </div>
                    <p className="text-[11px] font-mono text-foreground/80 break-all">{detail.membershipRule}</p>
                  </div>
                )}
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <PrincipalList principals={membersToShow} unavailable={unavailable("members")} emptyLabel="No members." />
                </div>
                {detail.members.length > 5 && (
                  <Button variant="link" size="sm" onClick={() => setMembersExpanded((v) => !v)} className="mt-2 h-auto p-0 text-[11px] text-info-400">
                    {membersExpanded ? "Show less" : `+${detail.members.length - 5} more`}
                  </Button>
                )}
              </Section>
            </div>
          )}

          {tab === "access" && (
            <div className="p-5 space-y-5">
              <Section title={`Directory roles (${detail.roles.length})`}>
                {unavailable("roles") ? (
                  <p className="text-xs text-muted-foreground">Unavailable — insufficient Graph permissions.</p>
                ) : detail.roles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No directory roles assigned to this group.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {detail.roles.map((role) => (
                      <div key={role.id} className="py-2">
                        <p className="text-xs font-medium text-foreground">{role.displayName}</p>
                        {role.description && <p className="text-[11px] text-muted-foreground">{role.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`Application access (${detail.apps.length})`}>
                {unavailable("apps") ? (
                  <p className="text-xs text-muted-foreground">Unavailable — insufficient Graph permissions.</p>
                ) : detail.apps.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No application role assignments.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {detail.apps.map((app) => (
                      <p key={app.id} className="text-xs text-foreground py-2">
                        {app.appDisplayName}
                      </p>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`Licenses (${detail.licenses.length})`}>
                {unavailable("licenses") ? (
                  <p className="text-xs text-muted-foreground">Unavailable — insufficient Graph permissions.</p>
                ) : detail.licenses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No licenses assigned to this group.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {detail.licenses.map((license) => (
                      <p key={license.skuId} className="text-xs text-foreground py-2">
                        {license.name}
                      </p>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`Conditional Access (${detail.conditionalAccess.length})`}>
                {unavailable("conditionalAccess") ? (
                  <p className="text-xs text-muted-foreground">Unavailable — insufficient Graph permissions.</p>
                ) : detail.conditionalAccess.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Not referenced by any Conditional Access policy.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {detail.conditionalAccess.map((ca) => (
                      <div key={ca.id} className="flex items-center justify-between gap-3 py-2">
                        <p className="text-xs text-foreground truncate">{ca.displayName}</p>
                        <Badge variant={ca.usage === "include" ? "success" : "warning"}>{ca.usage === "include" ? "Include" : "Exclude"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}
