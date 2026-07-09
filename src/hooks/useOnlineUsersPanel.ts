"use client";

import { useMemo, useState } from "react";
import type { PlatformUser } from "@/src/store/slices/platformSlice";

export function useOnlineUsersPanel(users: PlatformUser[]) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const online = visible.filter((u) => u.isOnline);
  const offline = visible.filter((u) => !u.isOnline);

  return { visible, search, setSearch, online, offline };
}
