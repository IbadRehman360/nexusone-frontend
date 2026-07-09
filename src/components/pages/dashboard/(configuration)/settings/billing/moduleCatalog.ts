import { ShieldCheck, Database, ShieldAlert, type LucideIcon } from "lucide-react";

export interface ModuleCatalogEntry {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

/** Single source of truth for every sellable module — mirrors the reference app's MODULE_CATALOG. */
export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  {
    key: "entra",
    label: "Entra ID",
    description: "Users, groups, licenses, app registrations, sign-in activity.",
    icon: ShieldCheck,
    features: ["Users, groups & licenses", "App registrations", "Sign-in activity"],
  },
  {
    key: "pp",
    label: "Power Platform",
    description: "Environments, teams, business units, flows, backups.",
    icon: Database,
    features: ["Environments & teams", "Business units & flows", "Scheduled backups"],
  },
  {
    key: "purview",
    label: "Purview",
    description: "DLP alerts, data classification, catalog, sensitivity labels.",
    icon: ShieldAlert,
    features: ["DLP alerts", "Data classification & catalog", "Sensitivity labels"],
  },
];

export const MODULE_BY_KEY: Record<string, ModuleCatalogEntry> = Object.fromEntries(MODULE_CATALOG.map((m) => [m.key, m]));
