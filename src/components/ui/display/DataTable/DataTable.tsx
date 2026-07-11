'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/inputs/Button';
import { DataTableHeader } from './DataTableHeader';
import { DataTableRow } from './DataTableRow';
import { DataTablePagination } from './DataTablePagination';
import { DataTableSkeleton } from './DataTableSkeleton';
import type { DataTableProps, DtSortDir } from './types';

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  // toolbar
  searchValue: controlledSearch,
  onSearchChange: onSearchChangeExternal,
  searchPlaceholder,
  filterChips,
  // sorting
  sortEnabled = false,
  defaultSortField,
  defaultSortDir = null,
  // pagination
  pageSize: initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  // states
  loading = false,
  loadingRows = 6,
  error,
  emptyState,
  // behaviour
  selectable = false,
  onSelectionChange,
  onRowClick,
  locked,
  lockedTooltip,
  className,
}: DataTableProps<T>) {
  // Internal state (uncontrolled defaults)
  const [internalSearch, setInternalSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(defaultSortField ?? null);
  const [sortDir, setSortDir] = useState<DtSortDir>(defaultSortDir);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Controlled vs uncontrolled search
  const searchValue = controlledSearch ?? internalSearch;
  const handleSearchChange = (val: string) => {
    if (onSearchChangeExternal) {
      onSearchChangeExternal(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
  };

  // Data pipeline: search → sort → paginate
  const filtered = useMemo(() => {
    let result = [...data];

    if (searchValue.trim()) {
      const q = searchValue.trim().toLowerCase();
      result = result.filter((item) =>
        columns.some((col) => {
          const val = col.accessor ? col.accessor(item) : (item as Record<string, unknown>)[col.key];
          return val?.toString().toLowerCase().includes(q);
        })
      );
    }

    if (sortEnabled && sortField && sortDir) {
      const col = columns.find((c) => c.key === sortField);
      result.sort((a, b) => {
        const aVal = col?.accessor ? col.accessor(a) : (a as Record<string, unknown>)[sortField];
        const bVal = col?.accessor ? col.accessor(b) : (b as Record<string, unknown>)[sortField];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchValue, sortEnabled, sortField, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (!sortEnabled) return;
    let next: DtSortDir = 'asc';
    if (sortField === key) {
      next = sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc';
    }
    setSortField(next ? key : null);
    setSortDir(next);
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    const next = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => k !== key);
    setSelectedKeys(next);
    onSelectionChange?.(next);
  };

  const handleSelectAll = (checked: boolean) => {
    const next = checked ? paginated.map(keyExtractor) : [];
    setSelectedKeys(next);
    onSelectionChange?.(next);
  };

  // --- Loading ---
  if (loading) {
    return <DataTableSkeleton columns={columns} rows={loadingRows} className={className} />;
  }

  // --- Error ---
  if (error) {
    return (
      <div className={cn('border border-border/30 bg-background-elevated px-6 py-10 text-center', className)}>
        <p className="text-sm font-medium text-error-400">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={cn('border bg-(--custom-table-bg) border-(--custom-table-border)', className)}
    >
      {/* Empty data (before any filter) */}
      {data.length === 0 ? (
            <div className="px-6 py-14 text-center">
              {(() => {
                const Icon = emptyState?.icon;
                return (
                  <>
                    {Icon && (
                      <div className="mb-3 flex justify-center">
                        <div className="p-3 rounded-xl bg-muted/20">
                          <Icon size={22} className="text-muted-foreground/50" />
                        </div>
                      </div>
                    )}
                    <p className="text-sm font-semibold text-foreground">{emptyState?.title ?? 'No data'}</p>
                    {emptyState?.description && (
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{emptyState.description}</p>
                    )}
                    {emptyState?.action && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={emptyState.action.onClick}
                        leftIcon={emptyState.action.icon}
                        className="mt-4"
                      >
                        {emptyState.action.label}
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-separate border-spacing-0 text-xs">
                  <DataTableHeader
                    columns={columns}
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    selectable={selectable}
                    selectedCount={selectedKeys.length}
                    totalCount={paginated.length}
                    onSelectAll={handleSelectAll}
                  />

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + (selectable ? 1 : 0)}
                          className="px-6 py-14 text-center"
                        >
                          <p className="text-sm font-medium text-foreground">No results found</p>
                          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((item, index) => (
                        <DataTableRow
                          key={keyExtractor(item)}
                          item={item}
                          columns={columns}
                          selected={selectedKeys.includes(keyExtractor(item))}
                          onSelectionChange={(checked) => handleSelectRow(keyExtractor(item), checked)}
                          selectable={selectable}
                          onClick={onRowClick}
                          index={index}
                          locked={locked}
                          lockedTooltip={lockedTooltip}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filtered.length}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setCurrentPage}
                onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
              />
            </>
          )}
    </div>
  );
}
