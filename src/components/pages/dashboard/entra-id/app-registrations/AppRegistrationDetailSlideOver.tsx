"use client";

import { useState } from "react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { Button } from "@/src/components/ui/inputs/Button";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import { AppWindow, TriangleAlert, KeyRound, Shield, Link2, Puzzle, UserCog } from "lucide-react";
import {
  useAppRegistrationOverview,
  useAppRegistrationCredentials,
  useAppRegistrationPermissions,
  useAppRegistrationAuthentication,
  useAppRegistrationExposedApi,
  useAppRegistrationRolesAdmins,
} from "@/src/hooks/data/useAppRegistrations";
import type { CredentialInfo, PermissionRow } from "@/src/types/appRegistrations";
import { formatDate } from "@/src/lib/utils/dateFormat";

type DetailTab = "overview" | "credentials" | "permissions" | "authentication" | "exposed-api" | "roles-admins";

const TABS: { id: DetailTab; label: string; icon: typeof KeyRound }[] = [
  { id: "overview", label: "Overview", icon: AppWindow },
  { id: "credentials", label: "Credentials", icon: KeyRound },
  { id: "permissions", label: "API Permissions", icon: Shield },
  { id: "authentication", label: "Authentication", icon: Link2 },
  { id: "exposed-api", label: "Expose an API", icon: Puzzle },
  { id: "roles-admins", label: "Roles & Administrators", icon: UserCog },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}

function CredentialStatusBadge({ status }: { status: CredentialInfo["status"] }) {
  const variant: BadgeVariant = status === "expired" ? "error" : status === "expiring" ? "warning" : "success";
  const label = status === "expired" ? "Expired" : status === "expiring" ? "Expiring soon" : "Valid";
  return <Badge variant={variant}>{label}</Badge>;
}

function CredentialCard({ credential }: { credential: CredentialInfo }) {
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground truncate">{credential.displayName || "Unnamed"}</p>
        <CredentialStatusBadge status={credential.status} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {formatDate(credential.startDateTime)} – {formatDate(credential.endDateTime)}
      </p>
      {credential.daysUntil != null && (
        <p className="text-[11px] text-muted-foreground">
          {credential.daysUntil >= 0 ? `${credential.daysUntil} day(s) remaining` : `Expired ${Math.abs(credential.daysUntil)} day(s) ago`}
        </p>
      )}
    </div>
  );
}

function PermissionTable({ rows }: { rows: PermissionRow[] }) {
  if (rows.length === 0) return <p className="text-xs text-muted-foreground">None granted.</p>;
  return (
    <div className="divide-y divide-(--custom-table-border)">
      {rows.map((row) => (
        <div key={row.id} className={`flex items-center justify-between gap-3 py-2.5 ${row.highRisk ? "bg-error/5" : ""}`}>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{row.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{row.resource}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {row.highRisk && <TriangleAlert size={13} className="text-error-400" />}
            <Badge variant={row.consent === "granted" ? "success" : row.consent === "not_granted" ? "warning" : "neutral"}>
              {row.consent === "granted" ? "Granted" : row.consent === "not_granted" ? "Not granted" : "Unknown"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppRegistrationDetailSlideOver({ appId, onClose }: { appId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  const { overview, isLoading } = useAppRegistrationOverview(appId);
  const { credentials } = useAppRegistrationCredentials(appId, tab === "credentials" || tab === "overview");
  const { permissions } = useAppRegistrationPermissions(appId, tab === "permissions" || tab === "overview");
  const { authentication } = useAppRegistrationAuthentication(appId, tab === "authentication");
  const { exposedApi } = useAppRegistrationExposedApi(appId, tab === "exposed-api");
  const { rolesAdmins } = useAppRegistrationRolesAdmins(appId, tab === "roles-admins");

  function handleClose() {
    onClose();
    setTab("overview");
  }

  return (
    <SlideOver
      isOpen={!!appId}
      onClose={handleClose}
      width="md"
      title={overview?.displayName ?? "App Registration"}
      subtitle={overview?.publisherDomain ?? overview?.appId}
      icon={<AppWindow size={16} className="text-info-400" />}
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading app registration…</p>
      ) : !overview ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Could not load this app registration&apos;s details.</p>
      ) : (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border) space-y-3">
            {overview.chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {overview.chips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant={chip.severity === "danger" ? "error" : chip.severity === "warning" ? "warning" : chip.severity === "success" ? "success" : chip.severity === "info" ? "info" : "neutral"}
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
                  <DetailRow label="Publisher domain" value={overview.publisherDomain ?? "—"} />
                  <DetailRow label="Sign-in audience" value={overview.signInAudience ?? "—"} />
                  <DetailRow label="Created" value={formatDate(overview.createdDateTime)} />
                  <DetailRow label="Owners" value={overview.owners.length > 0 ? overview.owners.map((o) => o.displayName).join(", ") : "None"} />
                  {overview.notes && <DetailRow label="Notes" value={overview.notes} />}
                </div>
              </Section>

              <Section title="Credentials">
                {!credentials || (credentials.secrets.length === 0 && credentials.certificates.length === 0) ? (
                  <p className="text-xs text-muted-foreground">No credentials configured.</p>
                ) : (
                  <div className="space-y-2">
                    {[...credentials.secrets, ...credentials.certificates].slice(0, 4).map((c) => (
                      <CredentialCard key={c.keyId ?? c.displayName} credential={c} />
                    ))}
                    {credentials.secrets.length + credentials.certificates.length > 4 && (
                      <Button variant="link" size="sm" onClick={() => setTab("credentials")} className="h-auto p-0 text-[11px] text-info-400">
                        View all credentials →
                      </Button>
                    )}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "credentials" && (
            <div className="p-5 space-y-5">
              <Section title={`Client secrets (${credentials?.secrets.length ?? 0})`}>
                {!credentials || credentials.secrets.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No client secrets.</p>
                ) : (
                  <div className="space-y-2">
                    {credentials.secrets.map((c) => (
                      <CredentialCard key={c.keyId} credential={c} />
                    ))}
                  </div>
                )}
              </Section>
              <Section title={`Certificates (${credentials?.certificates.length ?? 0})`}>
                {!credentials || credentials.certificates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No certificates.</p>
                ) : (
                  <div className="space-y-2">
                    {credentials.certificates.map((c) => (
                      <CredentialCard key={c.keyId} credential={c} />
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "permissions" && (
            <div className="p-5 space-y-5">
              {permissions && permissions.highRisk > 0 && (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-xs text-error-400">
                  {permissions.highRisk} high-risk permission(s) granted to this application.
                </div>
              )}
              <Section title={`Delegated permissions (${permissions?.delegated.length ?? 0})`}>
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <PermissionTable rows={permissions?.delegated ?? []} />
                </div>
              </Section>
              <Section title={`Application permissions (${permissions?.application.length ?? 0})`}>
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <PermissionTable rows={permissions?.application ?? []} />
                </div>
              </Section>
            </div>
          )}

          {tab === "authentication" && (
            <div className="p-5 space-y-5">
              <Section title="Redirect URIs">
                {!authentication || authentication.redirectGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No redirect URIs configured.</p>
                ) : (
                  <div className="space-y-3">
                    {authentication.redirectGroups.map((group) => (
                      <div key={group.platform}>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{group.platform}</p>
                        <div className="space-y-1">
                          {group.uris.map((uri) => (
                            <p key={uri} className="text-xs font-mono text-foreground/80 break-all">{uri}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title="Implicit grant & hybrid flows">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="Access tokens" value={authentication?.implicitAccessToken ? "Enabled" : "Disabled"} />
                  <DetailRow label="ID tokens" value={authentication?.implicitIdToken ? "Enabled" : "Disabled"} />
                  <DetailRow label="Logout URL" value={authentication?.logoutUrl ?? "—"} />
                  <DetailRow label="Sign-in audience" value={authentication?.signInAudience ?? "—"} />
                </div>
              </Section>
            </div>
          )}

          {tab === "exposed-api" && (
            <div className="p-5 space-y-5">
              <Section title="Identifier URIs">
                {!exposedApi || exposedApi.identifierUris.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No identifier URIs configured.</p>
                ) : (
                  <div className="space-y-1">
                    {exposedApi.identifierUris.map((uri) => (
                      <p key={uri} className="text-xs font-mono text-foreground/80 break-all">{uri}</p>
                    ))}
                  </div>
                )}
              </Section>
              <Section title={`Scopes (${exposedApi?.scopes.length ?? 0})`}>
                {!exposedApi || exposedApi.scopes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No scopes defined.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {exposedApi.scopes.map((scope) => (
                      <div key={scope.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{scope.adminConsentDisplayName ?? scope.value}</p>
                          <p className="text-[11px] font-mono text-muted-foreground truncate">{scope.value}</p>
                        </div>
                        <Badge variant={scope.isEnabled ? "success" : "neutral"}>{scope.isEnabled ? "Enabled" : "Disabled"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title={`App roles (${exposedApi?.appRoles.length ?? 0})`}>
                {!exposedApi || exposedApi.appRoles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No app roles defined.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {exposedApi.appRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{role.displayName ?? role.value}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{role.allowedMemberTypes.join(", ")}</p>
                        </div>
                        <Badge variant={role.isEnabled ? "success" : "neutral"}>{role.isEnabled ? "Enabled" : "Disabled"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "roles-admins" && (
            <div className="p-5">
              <Section title="Directory role assignments">
                {rolesAdmins && !rolesAdmins.accessible ? (
                  <p className="text-xs text-muted-foreground">
                    RoleManagement.Read.Directory permission not granted — directory role assignments cannot be retrieved.
                  </p>
                ) : !rolesAdmins || rolesAdmins.assignments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No directory role assignments for this application.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {rolesAdmins.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{assignment.displayName ?? "Unknown role"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{assignment.description ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {assignment.isPrivileged && <Badge variant="error">Privileged</Badge>}
                          <span className="text-[11px] text-muted-foreground">{assignment.scope === "/" ? "Tenant-wide" : assignment.scope}</span>
                        </div>
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
