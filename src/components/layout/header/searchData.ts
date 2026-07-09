import { navSections } from "@/src/config/nav.config";
import type { NavSection } from "@/src/config/nav.config";

export interface SearchItem {
  label: string;
  href: string;
  section?: string;
  icon: React.ElementType;
}

const WORLD_LABEL: Record<string, string> = {
  home: "Home",
  "power-platform": "Power Platform",
  "entra-id": "Entra ID",
  purview: "Data Protection",
  monitoring: "Activity",
  configuration: "Settings",
};

function sectionLabel(section: NavSection): string | undefined {
  // The "MODULES" section links between products — keep that literal label.
  // Every other section groups under its module name, not the finer sidebar
  // section title (e.g. "Environments"/"Identity"/"Governance" all → "Power Platform").
  if (section.title === "MODULES") return section.title;
  return section.world ? WORLD_LABEL[section.world] : section.title;
}

function sectionItems(section: NavSection): SearchItem[] {
  const label = sectionLabel(section);
  return section.items.flatMap((item) => {
    if (item.children) {
      return item.children.map((c) => ({ label: c.label, href: c.href, section: label, icon: item.icon }));
    }
    if (item.href) {
      return [{ label: item.label, href: item.href, section: label, icon: item.icon }];
    }
    return [];
  });
}

/** Flattened, client-side searchable index of every nav page link. Rebuilt from `navSections`, so it's always in sync with the sidebar. */
export const ALL_PAGES: SearchItem[] = navSections.flatMap(sectionItems);
