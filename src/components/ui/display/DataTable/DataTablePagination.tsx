'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem   = Math.min(currentPage * pageSize, totalItems);

  const getPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex bg-(--custom-table-pagination-bg) items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground rounded-b-xl">

      {/* Left: X–Y of Z */}
      <span className="tabular-nums shrink-0">
        <span className="text-foreground/90 font-semibold">{startItem}–{endItem}</span>
        <span className="text-foreground/50">{' '}of{' '}</span>
        <span className="text-foreground/90 font-semibold">{totalItems}</span>
      </span>

      {/* Center: ‹ page numbers › */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          aria-label="Previous page"
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
            isPrevDisabled
              ? 'text-foreground/20 cursor-not-allowed'
              : 'text-foreground hover:bg-muted/30'
          )}
        >
          <ChevronLeft size={13} />
        </button>

        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="w-7 text-center text-foreground/40">···</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={cn(
                'min-w-7 h-7 px-2 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150',
                currentPage === page
                  ? 'bg-[rgb(var(--info)/0.15)] text-[rgb(var(--info))] border border-[rgb(var(--info)/0.25)]'
                  : 'text-foreground hover:bg-muted/30'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          aria-label="Next page"
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
            isNextDisabled
              ? 'text-foreground/20 cursor-not-allowed'
              : 'text-foreground hover:bg-muted/30'
          )}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Right: Rows per page */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-foreground/90">Rows</span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="h-5.5 px-1 bg-transparent border border-(--custom-table-input-border) rounded text-xs text-foreground/90 focus:outline-none cursor-pointer transition-colors"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s} className="bg-card">{s}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
