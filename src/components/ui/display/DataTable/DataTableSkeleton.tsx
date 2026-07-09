'use client';

import { cn } from '@/src/lib/utils';
import type { DtColumn } from './types';

interface DataTableSkeletonProps<T> {
  columns: DtColumn<T>[];
  rows?: number;
  className?: string;
}

export function DataTableSkeleton<T>({ columns, rows = 6, className }: DataTableSkeletonProps<T>) {
  return (
    <div className={cn('overflow-x-auto border-0 bg-background-elevated', className)}>
      <table className="w-full min-w-max border-separate border-spacing-0 text-xs">

        {/* Header — real column names, visible from the start */}
        <thead>
          <tr className="border-b border-(--custom-table-border) bg-(--custom-table-header-bg)">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'select-none whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.hideOnMobile && 'hidden md:table-cell',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Rows — calm, uniform placeholder bars (no stagger, no pill shapes) */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                'border-b border-border/30',
                rowIdx % 2 === 0 ? 'row-base' : 'bg-muted/10 row-stripe',
              )}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3', col.hideOnMobile && 'hidden md:table-cell')}
                >
                  {colIdx === 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-skeleton-bg" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-2.5 w-32 animate-pulse rounded bg-skeleton-bg/80" />
                        <div className="h-2 w-20 animate-pulse rounded bg-skeleton-bg/50" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'h-2.5 w-20 animate-pulse rounded bg-skeleton-bg/70',
                        col.align === 'center' && 'mx-auto',
                        col.align === 'right' && 'ml-auto',
                      )}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
