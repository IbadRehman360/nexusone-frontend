"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { useHeaderKeyboard } from "@/src/hooks/useHeaderKeyboard";
import { ALL_PAGES } from "./searchData";

export function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  useHeaderKeyboard(isOpen, open, close);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_PAGES.slice(0, 8);
    return ALL_PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.section?.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  const goTo = (href: string) => {
    router.push(href);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-2 h-8 pl-3 pr-2 rounded-full bg-(--custom-table-bg) border border-(--custom-header-input-border) text-xs text-muted-foreground hover:text-foreground transition-colors w-56"
      >
        <Search size={13} />
        <span className="flex-1 text-left truncate">Find anything…</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground/70">Ctrl K</kbd>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-300 flex items-start justify-center pt-[12vh]">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={close} />
            <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-(--custom-header-input-border) bg-(--custom-sidebar-bg,rgb(var(--shell-surface))) shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 h-12 border-b border-(--custom-header-input-border)">
                <Search size={15} className="text-muted-foreground/60 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find anything…"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
                />
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground/70 shrink-0">Esc</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto py-1.5">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-muted-foreground text-center">No pages found.</p>
                ) : (
                  results.map((page) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.href}
                        type="button"
                        onClick={() => goTo(page.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/15 transition-colors"
                      >
                        <Icon size={20} className="text-muted-foreground/90 shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[12px] font-medium tracking-[0.01em] text-foreground/80 truncate">{page.label}</span>
                          {page.section && <span className="block text-[11px] text-muted-foreground/60 truncate">{page.section}</span>}
                        </span>
                        <ArrowRight size={13} className="text-muted-foreground/60 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
