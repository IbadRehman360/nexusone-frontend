/**
 * DataTable Component Types
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export type DtSortDir = 'asc' | 'desc' | null;

export interface DtColumn<T> {
  /** Unique column key */
  key: string;
  /** Header label (normal case, not uppercase) */
  header: string;
  /** Custom data accessor */
  accessor?: (item: T) => unknown;
  /** Custom cell renderer */
  render?: (value: unknown, item: T) => React.ReactNode;
  /** Enable sort on this column */
  sortable?: boolean;
  /** Text alignment for header and cells */
  align?: 'left' | 'center' | 'right';
  /** Hide column on mobile (<md) */
  hideOnMobile?: boolean;
  /** Extra classes on <td> */
  className?: string;
  /** Extra classes on <th> */
  headerClassName?: string;
}

export interface DtFilterChip {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
}

export interface DtEmptyState {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export interface DataTableProps<T> {
  data: T[];
  columns: DtColumn<T>[];
  keyExtractor: (item: T) => string;

  // --- toolbar ---
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterChips?: DtFilterChip[];

  // --- sorting ---
  sortEnabled?: boolean;
  defaultSortField?: string;
  defaultSortDir?: DtSortDir;

  // --- pagination ---
  pageSize?: number;
  pageSizeOptions?: number[];

  // --- states ---
  loading?: boolean;
  loadingRows?: number;
  error?: string;
  emptyState?: DtEmptyState;

  // --- behaviour ---
  selectable?: boolean;
  onSelectionChange?: (keys: string[]) => void;
  onRowClick?: (item: T) => void;

  /** When true, the `key: "actions"` column (by convention) renders disabled with a tooltip instead of calling its `render`. No subscription/module knowledge lives here — callers compute this (e.g. via `useModulePhase`). */
  locked?: boolean;
  lockedTooltip?: string;

  className?: string;
}
