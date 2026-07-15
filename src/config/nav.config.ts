import type React from "react";
import {
  Globe,
  Users,
  CalendarCheck,
  UserCircleGear,
  UsersThree,
  AppWindow,
  CreditCard,
  Database,
  ShieldCheck,
  Browsers,
  ChartLine,
  Archive,
  Stack,
  SquaresFour,
  Tag,
  BookOpen,
  ClipboardText,
  MapTrifold,
  Funnel,
  PlugsConnected,
  ShieldWarning,
  ShieldStar,
  UploadSimple,
  SignIn,
  ShieldChevron,
  ClockCounterClockwise,
  Fingerprint,
  Password,
  Lifebuoy,
  Sparkle,
} from "@phosphor-icons/react";
import type { World } from "@/src/lib/utils/navWorld";

export interface NavBadge {
  count: number;
  variant: 'orange' | 'green' | 'blue' | 'red' | 'purple';
}

export interface NavChild {
  label: string;
  href: string;
  badge?: NavBadge;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
  badge?: NavBadge;
}

export interface NavSection {
  title?: string;
  world?: World;
  items: NavItem[];
}

/**
 * Role/capability-based visibility gating (like the modals under
 * src/components/modals use for their option lists) isn't wired here yet —
 * there's no auth/capabilities system in this project. Every item renders
 * unconditionally until that layer is ported.
 */
export const navSections: NavSection[] = [

  // ── Home ─────────────────────────────────────────────────────────────────
  {
    title: "MODULES",
    world: 'home',
    items: [
      { label: "Power Platform", href: "/dashboard/power-platform", icon: Stack },
      { label: "Entra ID",       href: "/dashboard/entra-id",       icon: ShieldCheck },
      { label: "Purview",         href: "/dashboard/purview",       icon: Database },
    ],
  },

  // ── Power Platform ───────────────────────────────────────────────────────
  {
    title: "POWER PLATFORM",
    world: 'power-platform',
    items: [
      { label: "Overview", href: "/dashboard/power-platform", icon: SquaresFour },
    ],
  },
  {
    title: "ENVIRONMENTS",
    world: 'power-platform',
    items: [
      { label: "Environment Groups", href: "/dashboard/power-platform/environment-groups", icon: Stack },
      { label: "Environments",       href: "/dashboard/power-platform/environments",       icon: Globe },
    ],
  },
  {
    title: "IDENTITY",
    world: 'power-platform',
    items: [
      { label: "Business Units",  href: "/dashboard/power-platform/business-units", icon: Users },
      { label: "Teams",           href: "/dashboard/power-platform/teams",          icon: UsersThree },
      { label: "Users",           href: "/dashboard/power-platform/users",          icon: UserCircleGear },
      { label: "Security Roles",  href: "/dashboard/power-platform/roles",          icon: ShieldCheck },
    ],
  },
  {
    title: "GOVERNANCE",
    world: 'power-platform',
    items: [
      { label: "Resources",           href: "/dashboard/power-platform/resources",                 icon: Browsers },
      { label: "Delegations",         href: "/dashboard/power-platform/delegations",                icon: CalendarCheck },
      { label: "Data Import",         href: "/dashboard/power-platform/import",                     icon: UploadSimple },
      { label: "Compliance",          href: "/dashboard/power-platform/environmental-compliance",   icon: ClipboardText },
      { label: "DLP Policies",        href: "/dashboard/power-platform/dlp-policies",                icon: ShieldWarning },
      { label: "Backups & Restore",   href: "/dashboard/power-platform/backups",                    icon: Archive },
    ],
  },

  // ── Entra ID ─────────────────────────────────────────────────────────────
  {
    title: "ENTRA ID",
    world: 'entra-id',
    items: [
      { label: "Overview", href: "/dashboard/entra-id", icon: SquaresFour },
    ],
  },
  {
    title: "IDENTITY",
    world: 'entra-id',
    items: [
      { label: "Users",              href: "/dashboard/entra-id/users",              icon: UserCircleGear },
      { label: "Groups",             href: "/dashboard/entra-id/groups",             icon: UsersThree },
      { label: "Security Attributes",href: "/dashboard/entra-id/security-attributes",icon: Tag },
    ],
  },
  {
    title: "APPS & ACCESS",
    world: 'entra-id',
    items: [
      { label: "Enterprise Applications", href: "/dashboard/entra-id/enterprise-apps",    icon: Browsers },
      { label: "App Registrations",       href: "/dashboard/entra-id/app-registrations",  icon: AppWindow },
      { label: "Licenses",                href: "/dashboard/entra-id/licenses",           icon: CreditCard },
    ],
  },
  {
    title: "CONDITIONAL ACCESS",
    world: 'entra-id',
    items: [
      { label: "Conditional Access", href: "/dashboard/entra-id/conditional-access", icon: ShieldChevron },
      { label: "Backups & History", href: "/dashboard/entra-id/conditional-access/backups", icon: ClockCounterClockwise },
    ],
  },
  {
    title: "PRIVILEGED ACCESS",
    world: 'entra-id',
    items: [
      { label: "PIM", href: "/dashboard/entra-id/privileged-identity-management", icon: ShieldStar },
    ],
  },
  {
    title: "THREAT PROTECTION",
    world: 'entra-id',
    items: [
      { label: "Identity Protection", href: "/dashboard/entra-id/identity-protection", icon: ShieldWarning },
    ],
  },
  {
    title: "GOVERNANCE",
    world: 'entra-id',
    items: [
      { label: "Access Reviews",          href: "/dashboard/entra-id/access-reviews",          icon: CalendarCheck },
      { label: "Entitlement Management",  href: "/dashboard/entra-id/entitlement-management",  icon: Stack },
    ],
  },
  {
    title: "MULTI-FACTOR AUTH",
    world: 'entra-id',
    items: [
      { label: "MFA", href: "/dashboard/entra-id/mfa", icon: Fingerprint },
    ],
  },
  {
    title: "PASSWORD RESET",
    world: 'entra-id',
    items: [
      { label: "Password Reset (SSPR)", href: "/dashboard/entra-id/sspr", icon: Password },
    ],
  },
  {
    title: "MONITORING",
    world: 'entra-id',
    items: [
      { label: "Sign-in Logs", href: "/dashboard/entra-id/sign-in-logs", icon: SignIn },
    ],
  },

  // ── Purview ────────────────────────────────────────────────────────────
  {
    title: "PURVIEW",
    world: 'purview',
    items: [
      { label: "Overview", href: "/dashboard/purview", icon: SquaresFour },
    ],
  },
  {
    title: "SCANNING",
    world: 'purview',
    items: [
      { label: "Data Map & Scanning", href: "/dashboard/purview/data-map", icon: MapTrifold },
      { label: "Data Catalog",        href: "/dashboard/purview/catalog",  icon: BookOpen },
    ],
  },
  {
    title: "CLASSIFICATION",
    world: 'purview',
    items: [
      { label: "Data Classification", href: "/dashboard/purview/classification", icon: Funnel },
      { label: "Sensitivity Labels",  href: "/dashboard/purview/sensitivity",    icon: ShieldCheck },
    ],
  },
  {
    title: "PROTECTION",
    world: 'purview',
    items: [
      { label: "DLP", href: "/dashboard/purview/dlp", icon: ShieldWarning },
    ],
  },
  {
    title: "PLATFORM",
    world: 'purview',
    items: [
      { label: "Integrations", href: "/dashboard/purview/integrations", icon: PlugsConnected },
    ],
  },

  // ── Monitoring ───────────────────────────────────────────────────────────
  {
    title: "MONITORING",
    world: 'monitoring',
    items: [
      { label: "Activity",        href: "/dashboard/activity",        icon: ChartLine },
      { label: "Dataverse Logs",  href: "/dashboard/dataverse-logs",  icon: Database },
    ],
  },

  // ── Configuration ────────────────────────────────────────────────────────
  {
    title: "CONFIGURATION",
    world: 'configuration',
    items: [
      { label: "Members",      href: "/dashboard/settings/members", icon: Users },
      { label: "Security",     href: "/dashboard/settings/security", icon: Fingerprint },
      { label: "Billing & Plan", href: "/dashboard/settings/billing", icon: Sparkle },
      { label: "Support",      href: "/dashboard/settings/support", icon: Lifebuoy },
    ],
  },
];
