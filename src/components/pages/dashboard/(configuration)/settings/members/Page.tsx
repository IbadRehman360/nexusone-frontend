"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { DataTableMainHeader } from "@/src/components/ui/display/DataTable/DataTableMainHeader";
import { DataTable } from "@/src/components/ui/display/DataTable/DataTable";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { Tabs } from "@/src/components/ui/navigation/Tabs";
import { StatsCarousel } from "@/src/components/ui/display/StatsCarousel";
import { useAuth } from "@/src/hooks/useAuth";
import { showApiError } from "@/src/lib/errors/showApiError";
import { useTenantMembers, useInvitations, useInvalidateMembers } from "@/src/hooks/data/useMembers";
import { useBillingState } from "@/src/hooks/data/useBilling";
import { removeTenantMember, disableMemberMfa } from "@/src/services/tenants/tenantApi";
import { revokeInvitation, resendInvitation } from "@/src/services/invitations/invitationApi";
import { RoleBadge } from "./RoleBadge";
import { InviteMemberModal } from "./InviteMemberModal";
import { EditRoleModal } from "./EditRoleModal";
import type { TenantMember } from "@/src/services/tenants/tenantApi";
import type { Invitation } from "@/src/services/invitations/invitationApi";
import { Users, Mail, CheckCircle2, UserPlus, Pencil, Trash2, RefreshCw, ShieldOff } from "lucide-react";

const DEFAULT_SEAT_CAP = 5;
type MembersTab = "members" | "invited";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB");
}

function lastActiveLabel(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB");
}

export default function Page() {
  const { user } = useAuth();
  const isOwner = user?.tenantRole === "Owner";
  // LOCKED (trial ended, nothing purchased) blocks invites entirely — there's
  // no active subscription or trial window to invite anyone into.
  const isLocked = user?.subscription?.status === "LOCKED";
  const canInvite = isOwner && !isLocked;
  const { members, isLoading: membersLoading, refetch: refetchMembers } = useTenantMembers();
  const { invitations, isLoading: invitesLoading, refetch: refetchInvites } = useInvitations();
  const { state: billingState } = useBillingState();
  const invalidate = useInvalidateMembers();

  const [tab, setTab] = useState<MembersTab>("members");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TenantMember | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [disableMfaTarget, setDisableMfaTarget] = useState<TenantMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const activeMembers = members.filter((m) => m.isActive !== false);
  const pendingInvites = invitations.filter((i) => i.status === "pending");
  const seatCap = billingState?.invitesIncluded ?? DEFAULT_SEAT_CAP;
  const seatUsed = activeMembers.length + pendingInvites.length;
  const seatRemaining = Math.max(0, seatCap - seatUsed);
  const atCap = seatRemaining <= 0;

  const roleOptions = useMemo(() => {
    const names = Array.from(new Set(members.map((m) => m.role)));
    return [{ value: "", label: "All roles" }, ...names.map((r) => ({ value: r, label: r }))];
  }, [members]);

  const filteredMembers = members.filter((m) => {
    if (roleFilter && m.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const filteredInvites = pendingInvites.filter((i) => (search ? i.email.toLowerCase().includes(search.toLowerCase()) : true));

  const isProtectedRow = (m: TenantMember) => m.id === user?.id || m.role === "Owner";

  const handleRemoveConfirm = async () => {
    if (!removeTarget || !user?.currentTenantId) return;
    setRemoving(true);
    try {
      await removeTenantMember(user.currentTenantId, removeTarget.id);
      toast.success("Member removed", { description: `${removeTarget.fullName} no longer has access.` });
      setRemoveTarget(null);
      await refetchMembers();
    } catch (err) {
      showApiError(err, { title: "Failed to remove member" });
    } finally {
      setRemoving(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    setRemoving(true);
    try {
      await revokeInvitation(revokeTarget.id);
      toast.success("Invitation revoked");
      setRevokeTarget(null);
      await refetchInvites();
    } catch (err) {
      showApiError(err, { title: "Failed to revoke invitation" });
    } finally {
      setRemoving(false);
    }
  };

  const handleDisableMfaConfirm = async () => {
    if (!disableMfaTarget || !user?.currentTenantId) return;
    setDisablingMfa(true);
    try {
      await disableMemberMfa(user.currentTenantId, disableMfaTarget.id);
      toast.success("Two-factor authentication disabled", {
        description: `${disableMfaTarget.fullName} can now sign in without a code.`,
      });
      setDisableMfaTarget(null);
      await refetchMembers();
    } catch (err) {
      showApiError(err, { title: "Couldn't disable 2FA" });
    } finally {
      setDisablingMfa(false);
    }
  };

  const handleResend = async (invite: Invitation) => {
    setResendingId(invite.id);
    try {
      await resendInvitation(invite.id);
      toast.success("Invitation resent", { description: `A new invite email was sent to ${invite.email}.` });
      await refetchInvites();
    } catch (err) {
      showApiError(err, { title: "Failed to resend invitation" });
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members & Invites"
        description="Manage who has access to this workspace."
        breadcrumbs={[{ label: "Members", icon: Users }]}
        action={
          canInvite ? (
            <Button
              size="sm"
              leftIcon={<UserPlus size={14} />}
              onClick={() => setShowInvite(true)}
              disabled={atCap}
              title={atCap ? "Seat cap reached — revoke an invitation or buy more seats." : undefined}
            >
              Invite member
            </Button>
          ) : undefined
        }
      />

      <StatsCarousel
        cards={[
          {
            title: "Active Members",
            value: activeMembers.length,
            subtitle: "People with full access to this workspace.",
            icon: Users,
            color: "blue",
            isLoading: membersLoading,
          },
          {
            title: "Pending Invites",
            value: pendingInvites.length,
            subtitle: "Sent, but not yet accepted.",
            icon: Mail,
            color: "orange",
            isLoading: invitesLoading,
          },
          {
            title: "Slots Remaining",
            value: seatRemaining,
            subtitle: `of ${seatCap} total`,
            icon: CheckCircle2,
            color: "green",
            isLoading: membersLoading || invitesLoading,
          },
        ]}
      />

      <Tabs<MembersTab>
        variant="pill"
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: "members", label: "Members", icon: Users, count: activeMembers.length },
          { id: "invited", label: "Invited", icon: Mail, count: pendingInvites.length },
        ]}
      />

      {tab === "members" ? (
        <DataTableMainHeader
          title={`Members (${filteredMembers.length})`}
          filters={
            <Dropdown variant="selected" value={roleFilter} onChange={setRoleFilter} options={roleOptions} placeholder="Role" />
          }
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email…"
        >
          <DataTable<TenantMember>
            data={filteredMembers}
            keyExtractor={(m) => m.id}
            loading={membersLoading}
            sortEnabled
            defaultSortField="fullName"
            defaultSortDir="asc"
            columns={[
              {
                key: "fullName",
                header: "Member",
                sortable: true,
                render: (_, m) => (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold bg-info/15 text-info-400 border border-info/25 shrink-0">
                      {m.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                    </div>
                  </div>
                ),
              },
              { key: "role", header: "Role", render: (_, m) => <RoleBadge role={m.role} /> },
              {
                key: "lastActiveAt",
                header: "Last active",
                sortable: true,
                render: (_, m) => <span className="text-xs text-muted-foreground">{lastActiveLabel(m.lastActiveAt)}</span>,
              },
              {
                key: "joinedAt",
                header: "Joined",
                sortable: true,
                render: (_, m) => <span className="text-xs text-foreground/70 tabular-nums">{fmtDate(m.joinedAt)}</span>,
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (_, m) =>
                  isOwner && !isProtectedRow(m) ? (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {m.mfaEnabled && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDisableMfaTarget(m)}
                          aria-label="Disable two-factor authentication"
                          title="Disable two-factor authentication"
                        >
                          <ShieldOff size={13} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(m)} aria-label="Change role">
                        <Pencil size={13} />
                      </Button>
                      <Button variant="danger-ghost" size="icon-sm" onClick={() => setRemoveTarget(m)} aria-label="Remove member">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/40">—</span>
                  ),
              },
            ]}
            emptyState={{ icon: Users, title: "No members found", description: "Invite someone to get started." }}
          />
        </DataTableMainHeader>
      ) : (
        <DataTableMainHeader
          title={`Invited (${filteredInvites.length})`}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by email…"
        >
          <DataTable<Invitation>
            data={filteredInvites}
            keyExtractor={(i) => i.id}
            loading={invitesLoading}
            sortEnabled
            defaultSortField="createdAt"
            defaultSortDir="desc"
            columns={[
              {
                key: "email",
                header: "Email",
                sortable: true,
                render: (_, i) => (
                  <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Mail size={12} className="text-muted-foreground/60" />
                    {i.email}
                  </span>
                ),
              },
              { key: "roleName", header: "Role", render: (_, i) => <RoleBadge role={i.roleName ?? "Member"} /> },
              {
                key: "createdAt",
                header: "Invited",
                sortable: true,
                render: (_, i) => <span className="text-xs text-foreground/70 tabular-nums">{fmtDate(i.createdAt)}</span>,
              },
              {
                key: "expiresAt",
                header: "Expires",
                render: (_, i) => <span className="text-xs text-muted-foreground tabular-nums">{fmtDate(i.expiresAt)}</span>,
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (_, i) =>
                  isOwner ? (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleResend(i)} loading={resendingId === i.id} aria-label="Resend invite">
                        <RefreshCw size={13} />
                      </Button>
                      <Button variant="danger-ghost" size="icon-sm" onClick={() => setRevokeTarget(i)} aria-label="Revoke invite">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ) : null,
              },
            ]}
            emptyState={{
              icon: Mail,
              title: "No pending invites",
              description: "Invitations you send will show up here until accepted.",
            }}
          />
        </DataTableMainHeader>
      )}

      <InviteMemberModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <EditRoleModal member={editTarget} onClose={() => setEditTarget(null)} />

      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove member"
        subtitle="This action cannot be undone."
        variant="danger"
        size="sm"
        loading={removing}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRemoveTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRemoveConfirm} loading={removing}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Remove <span className="font-semibold">{removeTarget?.fullName}</span> from this workspace?
        </p>
      </Modal>

      <Modal
        isOpen={!!disableMfaTarget}
        onClose={() => setDisableMfaTarget(null)}
        title="Disable two-factor authentication"
        subtitle="Use this if a teammate is locked out of their authenticator app."
        variant="danger"
        size="sm"
        loading={disablingMfa}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDisableMfaTarget(null)} disabled={disablingMfa}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDisableMfaConfirm} loading={disablingMfa}>
              Disable 2FA
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Disable two-factor authentication for <span className="font-semibold">{disableMfaTarget?.fullName}</span>?
          They&apos;ll be able to sign in with just their Microsoft account until they set it up again.
        </p>
      </Modal>

      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke invitation"
        variant="danger"
        size="sm"
        loading={removing}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRevokeTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevokeConfirm} loading={removing}>
              Revoke
            </Button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          Revoke the invitation sent to <span className="font-semibold">{revokeTarget?.email}</span>?
        </p>
      </Modal>
    </div>
  );
}
