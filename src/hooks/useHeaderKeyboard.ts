"use client";

import { useEffect } from "react";

/** Cmd/Ctrl+K opens, Escape closes. Mount alongside the search bar it controls. */
export function useHeaderKeyboard(isOpen: boolean, open: () => void, close: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      } else if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, open, close]);
}
