"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  activeId: string;
  openGroupId: string | null;
  openGroup: (id: string) => void;
  closeGroup: (id: string) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  activeId: "",
  openGroupId: null,
  openGroup: () => {},
  closeGroup: () => {},
});

export const useSidebarCtx = () => useContext(SidebarContext);

interface SidebarProviderProps {
  activeId: string;
  defaultOpen?: string | null;
  children: ReactNode;
}

export function SidebarProvider({
  activeId,
  defaultOpen = null,
  children,
}: SidebarProviderProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => {
    if (typeof window === "undefined") return defaultOpen;
    try {
      return localStorage.getItem("sb-open-group") ?? defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  const openGroup = useCallback((id: string) => {
    setOpenGroupId(id);
    try {
      localStorage.setItem("sb-open-group", id);
    } catch {}
  }, []);

  const closeGroup = useCallback((id: string) => {
    setOpenGroupId((prev) => {
      if (prev !== id) return prev;
      try {
        localStorage.removeItem("sb-open-group");
      } catch {}
      return null;
    });
  }, []);

  return (
    <SidebarContext.Provider
      value={{ activeId, openGroupId, openGroup, closeGroup }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
