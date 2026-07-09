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
}

export function PageHeader({ title, description, breadcrumbs, envBadge, action }: PageHeaderProps) {
  return (
    <div>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex items-start justify-between">
        <div>
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
        {action && <div className="shrink-0 mt-1">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
