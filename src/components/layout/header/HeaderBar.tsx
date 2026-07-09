"use client";

import { HeaderStatusChip } from "./HeaderStatusChip";
import { SearchBar } from "./SearchBar";
import { TenantSwitcherButton } from "./TenantSwitcherButton";

/** Reusable top bar: tenant switcher, trial/subscription status, and global search, grouped on the right. */
export function HeaderBar() {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-end gap-3 px-8 h-14 shrink-0">
      <TenantSwitcherButton />
      <HeaderStatusChip />
      <SearchBar />
    </div>
  );
}
