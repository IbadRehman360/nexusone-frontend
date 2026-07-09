"use client";

import type { NavSection, NavBadge } from "@/src/config/nav.config";
import { SidebarLabel, SidebarDivider } from "@/src/components/ui/navigation/Sidebar/SidebarContainer";
import { SidebarItem } from "@/src/components/ui/navigation/Sidebar/SidebarItem";
import { SidebarGroup } from "@/src/components/ui/navigation/Sidebar/SidebarGroup";
import type { BadgeVariant } from "@/src/components/ui/navigation/Sidebar/Badge";

interface SidebarSectionProps {
  section:      NavSection;
  sectionIndex: number;
}

function mapVariant(v: NavBadge["variant"]): BadgeVariant {
  const map: Record<NavBadge["variant"], BadgeVariant> = {
    orange: "warning",
    green:  "success",
    blue:   "info",
    red:    "danger",
    purple: "purple",
  };
  return map[v];
}

/**
 * Role/capability-based visibility gating (the pattern the option-list modals
 * use) isn't wired here yet — there's no auth/capabilities system in this
 * project. Every item in a section renders unconditionally until that layer
 * is ported; this component only decides section chrome (divider/label).
 */
export function SidebarSection({ section, sectionIndex }: SidebarSectionProps) {
  const items = section.items;

  if (items.length === 0) return null;

  return (
    <div>
      {sectionIndex > 0 && <SidebarDivider />}
      {section.title
        ? <SidebarLabel>{section.title}</SidebarLabel>
        : sectionIndex === 0 && <div className="pt-3.5" />
      }

      <div className="space-y-0.5">
        {items.map((item) => {
          if (item.children) {
            const children = item.children.map((c) => ({
              id:    c.href,
              label: c.label,
              href:  c.href,
              ...(c.badge ? { badge: { count: c.badge.count, variant: mapVariant(c.badge.variant) } } : {}),
            }));

            return (
              <SidebarGroup
                key={item.label}
                id={item.label}
                label={item.label}
                icon={item.icon}
                items={children}
                {...(item.badge ? { badge: { count: item.badge.count, variant: mapVariant(item.badge.variant) } } : {})}
              />
            );
          }

          if (item.href) {
            return (
              <SidebarItem
                key={item.href}
                id={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                {...(item.badge ? { badge: { count: item.badge.count, variant: mapVariant(item.badge.variant) } } : {})}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
