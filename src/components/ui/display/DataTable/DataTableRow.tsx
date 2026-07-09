'use client';

import { cn } from '@/src/lib/utils';
import type { DtColumn } from './types';

interface DataTableRowProps<T> {
  item: T;
  columns: DtColumn<T>[];
  selected: boolean;
  onSelectionChange: (checked: boolean) => void;
  selectable?: boolean;
  onClick?: (item: T) => void;
  index: number;
}

export function DataTableRow<T>({
  item,
  columns,
  selected,
  onSelectionChange,
  selectable,
  onClick,
  index,
}: DataTableRowProps<T>) {
  return (
    <tr
      className={cn(
        'group border-b border-(--custom-table-border) transition-colors',
        index % 2 === 0 ? 'row-base' : 'bg-muted/10 row-stripe',
        'hover:bg-[rgb(var(--primary)/0.04)]',
        selected && '!bg-info/5',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(item)}
    >
      {/* Checkbox */}
      {selectable && (
        <td className="pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectionChange(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-info cursor-pointer"
            aria-label="Select row"
          />
        </td>
      )}

      {/* Data cells */}
      {columns.map((col) => {
        const value = col.accessor ? col.accessor(item) : (item as Record<string, unknown>)[col.key];

        return (
          <td
            key={col.key}
            className={cn(
              'px-4 py-2.5 font-medium text-foreground',
              col.align === 'center' && 'text-center',
              col.align === 'right'  && 'text-right',
              col.hideOnMobile       && 'hidden md:table-cell',
              col.className
            )}
          >
            {col.render ? col.render(value, item) : (value as React.ReactNode)}
          </td>
        );
      })}
    </tr>
  );
}
