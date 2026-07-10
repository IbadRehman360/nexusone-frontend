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
  /** Arbitrary content rendered inline next to the title, after envBadge — e.g. ModuleStatusTag. */
  titleBadge?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, envBadge, titleBadge, action }: PageHeaderProps) {
  return (
    <div>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {envBadge && (
              <span className="px-3 py-1 bg-info/15 text-info-400 rounded-lg text-sm font-medium border border-info/30">
                {envBadge}
              </span>
            )}
            {titleBadge}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-[rgb(var(--foreground)/0.65)]">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
