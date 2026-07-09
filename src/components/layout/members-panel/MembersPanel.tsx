"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw, Search, Mail, ShieldCheck, Copy, Check } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { usePlatformUsers } from "@/src/hooks/data/usePlatformUsers";
import { useOnlineUsersPanel } from "@/src/hooks/useOnlineUsersPanel";
import { useAuth } from "@/src/hooks/useAuth";
import type { PlatformUser } from "@/src/store/slices/platformSlice";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function lastSeenText(user: PlatformUser): string {
  if (user.isOnline) return "now";
  if (!user.lastSeen) return "—";
  const diff = Date.now() - new Date(user.lastSeen).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ProfileCard({ user }: { user: PlatformUser }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-2 mb-1.5 rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) overflow-hidden">
      <div className="h-10 bg-gradient-to-br from-info/25 to-info/5" />
      <div className="px-3.5 pb-3.5 -mt-5 space-y-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-info/15 text-info-400 border border-info/25">
          {getInitials(user.fullName)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 truncate">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{user.email}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(user.email).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label="Copy email"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        {user.tenantRole && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 mb-1">Role</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <ShieldCheck size={14} className="text-info-400" />
              {user.tenantRole}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, expanded, isYou, onToggle }: { user: PlatformUser; expanded: boolean; isYou: boolean; onToggle: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 mb-0.5 transition-colors text-left",
          expanded ? "bg-info/10" : "hover:bg-muted/15",
        )}
      >
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-info/15 text-info-400 border border-info/25">
            {getInitials(user.fullName)}
          </div>
          <span
            className={cn(
              "absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2 border-(--custom-table-bg)",
              user.isOnline ? "bg-success-400" : "bg-muted-foreground/40",
            )}
          />
        </div>
        <span className="flex-1 min-w-0 flex items-baseline gap-1 truncate">
          <span className="text-[13px] font-medium text-foreground truncate">{user.fullName}</span>
          {isYou && <span className="text-[11px] text-muted-foreground/60 font-normal shrink-0">(you)</span>}
        </span>
        <span className="text-[11px] text-muted-foreground/60 shrink-0 tabular-nums">{lastSeenText(user)}</span>
      </button>
      {expanded && <ProfileCard user={user} />}
    </>
  );
}

function UserSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{title}</span>
        <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-muted/40 text-foreground/70">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

interface MembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Reusable presence panel — tenant members list with live online/away status. Mount anywhere; opens as a fixed floating panel. */
export function MembersPanel({ isOpen, onClose }: MembersPanelProps) {
  const { user: currentUser } = useAuth();
  const { users, isLoading, refetch } = usePlatformUsers();
  const { search, setSearch, online, offline } = useOnlineUsersPanel(users);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const onlineCount = users.filter((u) => u.isOnline).length;

  return createPortal(
    <div className="fixed right-3 top-20 z-300 w-72 max-h-[min(28rem,calc(100vh-6rem))] flex flex-col rounded-2xl overflow-hidden bg-(--custom-sidebar-bg,rgb(var(--shell-surface))) border border-(--custom-header-input-border) shadow-2xl">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-(--custom-header-input-border)">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Members</span>
          {onlineCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-success-400" />}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground/60 mr-1">{users.length} total</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5 border-b border-(--custom-header-input-border) shrink-0">
        <div className="flex items-center h-9 rounded-xl bg-info/8 border border-info/15 focus-within:border-info/30">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center text-muted-foreground/60">
            <Search size={13} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/50 min-w-0 pr-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-1.5 pb-2 px-1">
        {isLoading && users.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-4">Loading members…</p>
        ) : online.length === 0 && offline.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-4">No members found.</p>
        ) : (
          <>
            {online.length > 0 && (
              <UserSection title="Online" count={online.length}>
                {online.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    expanded={expandedId === u.id}
                    isYou={u.id === currentUser?.id}
                    onToggle={() => setExpandedId((id) => (id === u.id ? null : u.id))}
                  />
                ))}
              </UserSection>
            )}
            {offline.length > 0 && (
              <UserSection title="Away" count={offline.length}>
                {offline.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    expanded={expandedId === u.id}
                    isYou={u.id === currentUser?.id}
                    onToggle={() => setExpandedId((id) => (id === u.id ? null : u.id))}
                  />
                ))}
              </UserSection>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
