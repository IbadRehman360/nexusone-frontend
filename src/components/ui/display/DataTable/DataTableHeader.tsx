'use client';

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { DtColumn, DtSortDir } from './types';

interface DataTableHeaderProps<T> {
  columns: DtColumn<T>[];
  sortField: string | null;
  sortDir: DtSortDir;
  onSort: (key: string) => void;
  selectable?: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

const thBase = 'border-b border-(--custom-table-border)';

export function DataTableHeader<T>({
  columns,
  sortField,
  sortDir,
  onSort,
  selectable,
  selectedCount,
  totalCount,
  onSelectAll,
}: DataTableHeaderProps<T>) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <thead>
      <tr className="bg-(--custom-table-header-bg)">
        {/* Select-all checkbox */}
        {selectable && (
          <th className={cn(thBase, '')}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 border-border accent-info cursor-pointer"
              aria-label="Select all"
            />
          </th>
        )}

        {/* Column headers */}
        {columns.map((col) => {
          const isActive = sortField === col.key;

          return (
            <th
              key={col.key}
              onClick={col.sortable ? () => onSort(col.key) : undefined}
              className={cn(
                thBase,
                'px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap select-none',
                col.align === 'center' && 'text-center',
                col.align === 'right'  && 'text-right',
                col.hideOnMobile       && 'hidden md:table-cell',
                col.sortable           && 'cursor-pointer hover:text-foreground transition-colors',
                col.headerClassName
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {col.header}
                {col.sortable && (
                  isActive ? (
                    sortDir === 'asc'
                      ? <ArrowUp   size={12} className="text-info/70 shrink-0" />
                      : <ArrowDown size={12} className="text-info/70 shrink-0" />
                  ) : (
                    <ArrowUpDown size={12} className="text-foreground/40 shrink-0" />
                  )
                )}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
