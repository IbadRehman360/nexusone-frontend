"use client";

import { useState } from "react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { LayoutGrid, TriangleAlert, Users, Key, Link2, Shield, Activity as ActivityIcon } from "lucide-react";
import {
  useEnterpriseAppOverview,
  useEnterpriseAppAccess,
  useEnterpriseAppSso,
  useEnterpriseAppPermissions,
  useEnterpriseAppActivity,
} from "@/src/hooks/data/useEnterpriseApps";
import type { HealthStatus } from "@/src/types/enterpriseApps";
import { formatDate, formatDateTime } from "@/src/lib/utils/dateFormat";

type DetailTab = "overview" | "users-groups" | "roles" | "sso" | "permissions" | "activity";

const TABS: { id: DetailTab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "users-groups", label: "Users & Groups", icon: Users },
  { id: "roles", label: "Roles", icon: Key },
  { id: "sso", label: "Single Sign-On", icon: Link2 },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}

function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === "danger") return <Badge variant="error">Needs attention</Badge>;
  if (status === "warning") return <Badge variant="warning">Review soon</Badge>;
  if (status === "disabled") return <Badge variant="neutral">Disabled</Badge>;
  return <Badge variant="success">Healthy</Badge>;
}

export function EnterpriseAppDetailSlideOver({ appId, onClose }: { appId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  const { overview, isLoading } = useEnterpriseAppOverview(appId);
  const { access } = useEnterpriseAppAccess(appId, tab === "users-groups" || tab === "roles" || tab === "overview");
  const { sso } = useEnterpriseAppSso(appId, tab === "sso" || tab === "overview");
  const { permissions } = useEnterpriseAppPermissions(appId, tab === "permissions" || tab === "overview");
  const { activity, isLoading: activityLoading, error: activityError } = useEnterpriseAppActivity(
    appId,
    overview?.appId ?? null,
    tab === "activity",
  );

  function handleClose() {
    onClose();
    setTab("overview");
  }

  return (
    <SlideOver
      isOpen={!!appId}
      onClose={handleClose}
      width="md"
      title={overview?.displayName ?? "Enterprise Application"}
      subtitle={overview?.publisher ?? overview?.appId}
      icon={<LayoutGrid size={16} className="text-info-400" />}
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading enterprise application…</p>
      ) : !overview ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Could not load this application&apos;s details.</p>
      ) : (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border) space-y-3">
            {overview.chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {overview.chips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant={chip.severity === "danger" ? "error" : chip.severity === "warning" ? "warning" : chip.severity === "success" ? "success" : "neutral"}
                  >
                    {chip.key.replace(/_/g, " ")}
                    {chip.days != null && ` · ${chip.days}d`}
                  </Badge>
                ))}
              </div>
            )}
            <div className="overflow-x-auto scrollbar-thin-hover pb-1">
              <Tabs variant="pill" tabs={TABS} activeTab={tab} onChange={setTab} />
            </div>
          </div>

          {tab === "overview" && (
            <div className="p-5 space-y-5">
              <Section title="Details">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="Display name" value={overview.displayName} />
                  <DetailRow label="Application ID" value={<span className="font-mono text-[11px]">{overview.appId}</span>} />
                  <DetailRow label="Object ID" value={<span className="font-mono text-[11px]">{overview.id}</span>} />
                  <DetailRow label="Publisher" value={overview.publisher ?? "—"} />
                  <DetailRow label="Homepage" value={overview.homepage ?? "—"} />
                  <DetailRow label="Created" value={formatDate(overview.createdDateTime)} />
                  <DetailRow label="Assignment required" value={overview.assignmentRequired ? "Yes" : "No"} />
                  <DetailRow label="Status" value={<Badge variant={overview.accountEnabled ? "success" : "error"}>{overview.accountEnabled ? "Enabled" : "Disabled"}</Badge>} />
                  <DetailRow label="Health" value={<HealthBadge status={overview.healthStatus} />} />
                </div>
              </Section>

              <Section title="Access Summary">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="Users & groups assigned" value={access?.assignments.length ?? 0} />
                  <DetailRow label="Owners" value={access?.owners.length ?? 0} />
                  <DetailRow label="App roles" value={access?.appRoles.length ?? 0} />
                  <DetailRow label="SSO mode" value={sso?.mode.toUpperCase() ?? "—"} />
                  <DetailRow label="Permissions granted" value={permissions?.total ?? 0} />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setTab("permissions")}>
                    View permissions
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setTab("activity")}>
                    View activity
                  </Button>
                </div>
              </Section>
            </div>
          )}

          {tab === "users-groups" && (
            <div className="p-5">
              <Section title={`Assigned users & groups (${access?.assignments.length ?? 0})`}>
                {!access || access.assignments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No users or groups are assigned to this application.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {access.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{assignment.displayName}</p>
                          <p className="text-[11px] text-muted-foreground">{assignment.roleName ?? "Default access"}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="neutral">{assignment.type}</Badge>
                          <span className="text-[11px] text-muted-foreground">{formatDate(assignment.assignedOn)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "roles" && (
            <div className="p-5 space-y-5">
              <Section title={`App roles (${access?.appRoles.length ?? 0})`}>
                {!access || access.appRoles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No app roles defined.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {access.appRoles.map((role) => (
                      <div key={role.id} className="py-2.5">
                        <p className="text-xs font-medium text-foreground">{role.displayName}</p>
                        {role.description && <p className="text-[11px] text-muted-foreground">{role.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title={`Owners (${access?.owners.length ?? 0})`}>
                {!access || access.owners.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No owners assigned.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {access.owners.map((owner) => (
                      <div key={owner.id} className="py-2.5">
                        <p className="text-xs font-medium text-foreground">{owner.displayName}</p>
                        {owner.email && <p className="text-[11px] text-muted-foreground">{owner.email}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "sso" && (
            <div className="p-5 space-y-5">
              <Section title="Configuration">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="SSO mode" value={sso?.mode.toUpperCase() ?? "—"} />
                </div>
                {sso && sso.replyUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Reply URLs</p>
                    <div className="space-y-1">
                      {sso.replyUrls.map((url) => (
                        <p key={url} className="text-xs font-mono text-foreground/80 break-all">{url}</p>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
              <Section title={`Signing certificates (${sso?.certificates.length ?? 0})`}>
                {!sso || sso.certificates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No signing certificates configured.</p>
                ) : (
                  <div className="space-y-2">
                    {sso.certificates.map((cert) => (
                      <div key={cert.thumbprint} className="rounded-xl border border-(--custom-table-border) bg-card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-mono text-muted-foreground truncate">{cert.thumbprint}</p>
                          <Badge variant={cert.status === "expired" ? "error" : cert.status === "expiring" ? "warning" : "success"}>
                            {cert.status === "expired" ? "Expired" : cert.status === "expiring" ? "Expiring soon" : "Valid"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">Expires {formatDate(cert.endDateTime)}</p>
                        {cert.daysUntil != null && (
                          <p className="text-[11px] text-muted-foreground">
                            {cert.daysUntil >= 0 ? `${cert.daysUntil} day(s) remaining` : `Expired ${Math.abs(cert.daysUntil)} day(s) ago`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "permissions" && (
            <div className="p-5 space-y-5">
              {permissions && permissions.highPrivilege > 0 && (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-xs text-error-400">
                  {permissions.highPrivilege} high-privilege permission(s) granted to this application.
                </div>
              )}
              <Section title={`Granted permissions (${permissions?.rows.length ?? 0})`}>
                {!permissions || permissions.rows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No permissions granted.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {permissions.rows.map((row, idx) => (
                      <div key={`${row.scope}-${idx}`} className={`flex items-center justify-between gap-3 py-2.5 ${row.highRisk ? "bg-error/5" : ""}`}>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{row.scope}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{row.resource ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {row.highRisk && <TriangleAlert size={13} className="text-error-400" />}
                          <Badge variant="neutral">{row.type}</Badge>
                          <Badge variant={row.consent === "admin" ? "success" : "info"}>{row.consent === "admin" ? "Admin" : "User"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "activity" && (
            <div className="p-5">
              <Section title="Recent sign-ins">
                {activityError ? (
                  <p className="text-xs text-muted-foreground">
                    Sign-in activity is temporarily unavailable — Microsoft Graph may be rate-limiting this request. Try again shortly.
                  </p>
                ) : activityLoading ? (
                  <p className="text-xs text-muted-foreground">Loading activity…</p>
                ) : activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent sign-in activity for this application.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {activity.map((row) => (
                      <div key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{row.userDisplayName ?? row.userPrincipalName ?? "Unknown user"}</p>
                          <p className="text-[11px] text-muted-foreground">{formatDateTime(row.createdDateTime)} · {row.ipAddress ?? "—"}</p>
                        </div>
                        <Badge variant={row.status === "success" ? "success" : row.status === "failure" ? "error" : "warning"}>
                          {row.status === "success" ? "Success" : row.status === "failure" ? "Failure" : "Interrupted"}
                        </Badge>
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
