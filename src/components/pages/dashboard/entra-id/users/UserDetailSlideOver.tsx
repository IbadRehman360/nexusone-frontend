"use client";

import { useState } from "react";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Badge } from "@/src/components/ui/display/Badge";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { DetailRow } from "@/src/components/ui/display/DetailRow";
import { UsersRound } from "lucide-react";
import { useEntraUser, useEntraUserGroups, useEntraUserAppAssignments, useEntraUserOwnedObjects } from "@/src/hooks/data/useEntraUsers";
import { formatDate } from "@/src/lib/utils/dateFormat";

type UserTabKey = "overview" | "groups" | "apps" | "licenses";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}

const OWNED_TYPE_LABEL: Record<string, string> = {
  group: "Group",
  appRegistration: "App registration",
  enterpriseApp: "Enterprise app",
  device: "Device",
  other: "Other",
};

export function UserDetailSlideOver({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<UserTabKey>("overview");

  const { user, isLoading } = useEntraUser(userId);
  const { groups } = useEntraUserGroups(userId, !!userId);
  const { apps } = useEntraUserAppAssignments(userId, !!userId);
  const { owned } = useEntraUserOwnedObjects(userId, !!userId);

  function handleClose() {
    onClose();
    setTab("overview");
  }

  return (
    <SlideOver
      isOpen={!!userId}
      onClose={handleClose}
      width="md"
      title={user?.displayName ?? "User"}
      subtitle={user ? user.mail || user.userPrincipalName : "Microsoft Entra ID user"}
      icon={<UsersRound size={16} className="text-info-400" />}
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading user…</p>
      ) : !user ? (
        <p className="text-xs text-muted-foreground px-5 py-6">This user may have been deleted or you don&apos;t have access to it.</p>
      ) : (
        <div>
          <div className="px-5 pt-4 pb-3 border-b border-(--custom-table-border)">
            <Tabs
              variant="pill"
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "groups", label: "Groups", count: groups.length },
                { id: "apps", label: "Applications", count: apps.length },
                { id: "licenses", label: "Licenses", count: user.assignedLicenses?.length ?? 0 },
              ]}
              activeTab={tab}
              onChange={setTab}
            />
          </div>

          {tab === "overview" && (
            <div className="p-5 space-y-5">
              <Section title="Account">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="Display name" value={user.displayName} />
                  <DetailRow label="Email" value={user.mail || "—"} />
                  <DetailRow label="Job title" value={user.jobTitle || "—"} />
                  <DetailRow label="Department" value={user.department || "—"} />
                  <DetailRow label="Office location" value={user.officeLocation || "—"} />
                  <DetailRow label="Mobile phone" value={user.mobilePhone || "—"} />
                  <DetailRow label="Created" value={formatDate(user.createdDateTime)} />
                  <DetailRow label="Status" value={<Badge variant={user.accountEnabled ? "success" : "error"}>{user.accountEnabled ? "Enabled" : "Disabled"}</Badge>} />
                </div>
              </Section>

              <Section title="Identifiers">
                <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4">
                  <DetailRow label="User principal name" value={<span className="font-mono text-[11px]">{user.userPrincipalName}</span>} />
                  <DetailRow label="Object ID" value={<span className="font-mono text-[11px]">{user.id}</span>} />
                  <DetailRow label="Group memberships" value={groups.length} />
                  <DetailRow label="Application assignments" value={apps.length} />
                  <DetailRow label="Assigned licenses" value={user.assignedLicenses?.length ?? 0} />
                </div>
              </Section>

              {owned.length > 0 && (
                <Section title="Owned objects">
                  <div className="flex flex-wrap gap-1.5">
                    {owned.map((obj) => (
                      <Badge key={obj.id} variant="neutral">
                        {obj.displayName} · {OWNED_TYPE_LABEL[obj.type] ?? obj.type}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === "groups" && (
            <div className="p-5 space-y-5">
              <Section title={`Group memberships (${groups.length})`}>
                {groups.length === 0 ? (
                  <p className="text-xs text-muted-foreground">This user is not a member of any groups.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {groups.map((group) => (
                      <div key={group.id} className="py-2.5">
                        <p className="text-xs font-medium text-foreground">{group.displayName}</p>
                        {group.description && <p className="text-[11px] text-muted-foreground">{group.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "apps" && (
            <div className="p-5 space-y-5">
              <Section title={`Application assignments (${apps.length})`}>
                {apps.length === 0 ? (
                  <p className="text-xs text-muted-foreground">This user has no application role assignments.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {apps.map((app) => (
                      <p key={app.id} className="text-xs text-foreground py-2.5">{app.resourceDisplayName}</p>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === "licenses" && (
            <div className="p-5 space-y-5">
              <Section title={`Assigned licenses (${user.assignedLicenses?.length ?? 0})`}>
                {(user.assignedLicenses?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground">No licenses assigned to this user.</p>
                ) : (
                  <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) px-4 divide-y divide-(--custom-table-border)">
                    {user.assignedLicenses.map((license) => (
                      <p key={license.skuId} className="text-xs font-mono text-foreground py-2.5">{license.skuId}</p>
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
