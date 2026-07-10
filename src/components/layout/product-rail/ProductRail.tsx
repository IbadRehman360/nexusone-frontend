"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ElementType } from "react";
import { Sun, Moon, LogOut, Users, Lock } from "lucide-react";
import { Stack, ShieldCheck, Pulse, Gear, Question, Database, SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils/cn";
import { getActiveWorld, type World } from "@/src/lib/utils/navWorld";
import { useTheme } from "@/src/hooks/useTheme";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { useAuth } from "@/src/hooks/useAuth";
import { usePlatformUsers } from "@/src/hooks/data/usePlatformUsers";
import { MembersPanel } from "@/src/components/layout/members-panel/MembersPanel";
import type { SubscriptionModule } from "@/src/components/auth/ModuleGuard";

interface RailEntry {
  world:      World;
  icon:       ElementType;
  label:      string;
  href:       string;
  /** Owning module — omitted for entries that aren't module-gated (Home, Activity, Settings). */
  module?:    SubscriptionModule;
}

const RAIL_ENTRIES: RailEntry[] = [
  { world: 'home',           icon: SquaresFour, label: 'Home',   href: '/dashboard' },
  { world: 'power-platform', icon: Stack,       label: 'Power',  href: '/dashboard/power-platform', module: 'pp' },
  { world: 'entra-id',       icon: ShieldCheck, label: 'Entra',  href: '/dashboard/entra-id',        module: 'entra' },
  { world: 'purview',        icon: Database,    label: 'Purview', href: '/dashboard/purview',        module: 'purview' },
  { world: 'monitoring',     icon: Pulse,       label: 'Activity', href: '/dashboard/activity' },
  { world: 'configuration',  icon: Gear,        label: 'Settings', href: '/dashboard/settings/members' },
];

function RailButton({
  entry,
  isActive,
  locked,
  needsConnect,
}: {
  entry: RailEntry;
  isActive: boolean;
  locked: boolean;
  needsConnect: boolean;
}) {
  const Icon = entry.icon;

  // Module not owned — fully inert, no navigation at all: a plain div (no
  // Link/href), cursor-not-allowed, dimmed, with a lock badge tooltip.
  if (locked) {
    return (
      <div
        title={`${entry.label} isn't part of your plan`}
        aria-label={`${entry.label} — not available`}
        className="relative flex flex-col items-center gap-1.5 w-full px-1 cursor-not-allowed opacity-40 group"
      >
        <div className="relative w-11 h-11 rounded-md flex items-center justify-center text-(--nav-fg-dim)">
          <Icon size={22} weight="regular" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-card border border-border/60 flex items-center justify-center">
            <Lock size={7} className="text-muted-foreground" />
          </span>
        </div>
        <span className="text-[11px] font-medium leading-none w-full text-center truncate px-1 text-(--nav-fg-label)">
          {entry.label}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={entry.href}
      title={entry.label}
      aria-label={entry.label}
      className="relative flex flex-col items-center gap-1.5 w-full px-1 group"
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-13 rounded-r-full bg-[var(--nav-active-fg)]" />
      )}
      <div
        className={cn(
          "relative w-11 h-11 rounded-md flex items-center justify-center transition-colors duration-150 shrink-0",
          isActive
            ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)]"
            : "text-(--nav-fg-dim) hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover)",
        )}
      >
        <Icon size={22} weight={isActive ? "fill" : "regular"} />
        {needsConnect && (
          <span
            title={`${entry.label} isn't connected yet — showing sample data`}
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-warning-400 border border-(--nav-fg-dim,rgb(var(--shell-surface)))"
          />
        )}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium leading-none transition-colors duration-150 w-full text-center truncate px-1",
          isActive ? "text-[var(--nav-active-fg)]" : "text-(--nav-fg-label) group-hover:text-(--nav-fg-hover)",
        )}
      >
        {entry.label}
      </span>
    </Link>
  );
}

export function ProductRail() {
  const pathname = usePathname();
  const router = useRouter();
  const activeWorld = getActiveWorld(pathname);
  const { isDark, toggle: toggleTheme } = useTheme();
  const { getSectionStyle } = useThemeCustomization();
  const { user, logout } = useAuth();
  const ownedModules = user?.subscription?.modules;
  const paidModules = user?.subscription?.paidModules;
  const connectedModules = user?.subscription?.connectedModules;
  // Fully LOCKED (no active plan at all) disables every rail entry except
  // Settings, regardless of per-module ownership — the tenant can only reach
  // Billing/Settings to reactivate.
  const isLocked = user?.subscription?.status === "LOCKED";
  const { users: platformUsers } = usePlatformUsers();
  const onlineCount = platformUsers.filter((u) => u.isOnline).length;
  const [showMembers, setShowMembers] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/signin");
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-220 flex flex-col items-center w-16 bg-shell-surface"
      style={getSectionStyle("rail")}
    >
      <div className="shrink-0 border border-(--custom-header-input-border) mt-[18px] mb-6 w-10 h-10 rounded-md overflow-hidden">
        <Image src="/logo.png" alt="NexusOne" width={40} height={40} className="w-full h-full object-contain" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center gap-2 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-2">
        {RAIL_ENTRIES.map((entry) => (
          <div key={entry.world} className="w-full flex flex-col items-center">
            {entry.world === "monitoring" && <div className="w-8 h-px my-1.5 bg-(--custom-header-input-border)" />}
            <RailButton
              entry={entry}
              isActive={activeWorld === entry.world}
              locked={
                entry.world === "configuration"
                  ? false
                  : isLocked || (!!entry.module && !(ownedModules?.includes(entry.module) ?? true))
              }
              // Purchased but not yet connected — dot only makes sense once
              // the module is actually reachable (not locked, not merely a
              // trial), matching ModuleConnectBanner's own needsConnect rule.
              needsConnect={
                !!entry.module &&
                (paidModules?.includes(entry.module) ?? false) &&
                !(connectedModules?.includes(entry.module) ?? false)
              }
            />
          </div>
        ))}
      </div>

      <div className="shrink-0 flex flex-col items-center gap-2 pb-6 w-full">
        <button
          type="button"
          title="Help"
          aria-label="Help"
          className="w-10 h-10 rounded-md flex items-center justify-center text-(--nav-fg-dim) hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover) transition-colors duration-150"
        >
          <Question size={20} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-10 h-10 rounded-md flex items-center justify-center text-(--nav-fg-dim) hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover) transition-colors duration-150"
        >
          {isDark ? <Sun size={18} fill="currentColor" /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setShowMembers((v) => !v)}
          title="Members"
          aria-label="Members"
          className="relative w-10 h-10 rounded-md flex items-center justify-center text-(--nav-fg-dim) hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover) transition-colors duration-150"
        >
          <Users size={18} />
          {onlineCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-success-400 border border-(--nav-fg-dim,rgb(var(--shell-surface)))" />
          )}
        </button>

        <MembersPanel isOpen={showMembers} onClose={() => setShowMembers(false)} />

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="w-10 h-10 rounded-md flex items-center justify-center text-(--nav-fg-dim) hover:bg-error/10 hover:text-error transition-colors duration-150"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
