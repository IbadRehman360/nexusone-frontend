"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlatformUsers } from "@/src/services/platform/platformApi";
import { useAppSelector } from "@/src/store";
import { useAuth } from "@/src/hooks/useAuth";
import type { PlatformUser } from "@/src/store/slices/platformSlice";

export function usePlatformUsers() {
  const { user } = useAuth();
  const presenceMap = useAppSelector((s) => s.platform.presenceMap);

  const query = useQuery({
    queryKey: ["platform", "users"],
    queryFn: getPlatformUsers,
    staleTime: 60_000,
  });

  const users: PlatformUser[] = (query.data ?? []).map((u) => {
    const presence = presenceMap[u.userId];
    const isOnline = u.userId === user?.id ? true : presence?.isOnline ?? u.isOnline;
    return {
      id: u.userId,
      email: u.email,
      fullName: u.fullName,
      tenantRole: u.tenantRole,
      isOnline,
      lastSeen: presence?.lastSeen ?? u.lastSeen,
    };
  });

  return { users, isLoading: query.isLoading, refetch: query.refetch };
}
