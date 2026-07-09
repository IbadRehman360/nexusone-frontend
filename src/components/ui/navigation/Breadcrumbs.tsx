"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {showHome && (
          <>
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Home size={14} />
                <span>Dashboard</span>
              </Link>
            </li>
            {items.length > 0 && (
              <li>
                <ChevronRight size={14} className="text-muted-foreground" />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`flex items-center gap-1.5 ${
                      isLast
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
              {!isLast && (
                <li>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
