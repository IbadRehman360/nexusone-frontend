"use client";

import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  envBadge?: string;
  action?: React.ReactNode;
  /** When true, `action` is rendered disabled with a tooltip instead of interactive. No subscription/module knowledge lives here — callers compute this (e.g. via `useModulePhase`). */
  locked?: boolean;
  lockedTooltip?: string;
}

export function PageHeader({ title, description, breadcrumbs, envBadge, action, locked, lockedTooltip }: PageHeaderProps) {
  return (
    <div>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {envBadge && (
              <span className="px-3 py-1 bg-info/15 text-info-400 rounded-lg text-sm font-medium border border-info/30">
                {envBadge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-[rgb(var(--foreground)/0.65)]">{description}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0" title={locked ? lockedTooltip : undefined}>
            {locked ? (
              <div aria-disabled="true" className="opacity-50 pointer-events-none cursor-not-allowed">
                {action}
              </div>
            ) : (
              action
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
