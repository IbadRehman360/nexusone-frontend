"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Chrome to match: "selected" = info-tinted button (e.g. environment picker), "plain" = full-width form-field select. */
  variant?: "selected" | "plain";
}

/**
 * Fully custom dropdown — a native <select>'s popup panel is rendered by the
 * OS/browser and can't be restyled (corner radius, colors, etc.), so anywhere
 * that needs to visually match the app's own design system uses this instead.
 *
 * The option panel is portalled to document.body and positioned with
 * `position: fixed` from the trigger's live bounding rect, so it always
 * renders on top and is never clipped by a scrolling ancestor (e.g. a
 * modal body with overflow-y-auto).
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
  variant = "selected",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const openDropdown = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Close on scroll of the page/ancestors (so the panel doesn't drift away
    // from a now-moved trigger) — but NOT on scrolling inside the panel's own
    // option list, since that's a normal, expected interaction.
    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const handleResize = () => setOpen(false);

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const triggerClass =
    variant === "selected"
      ? "h-7 pl-2.5 pr-2 text-xs font-medium bg-(--custom-table-bg) text-foreground hover:bg-muted/20"
      : "w-full h-9 px-3 justify-between text-sm bg-(--custom-table-bg) border border-(--custom-header-input-border) text-foreground hover:border-info-400/50";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={cn(
          "relative hover:border border-border inline-flex items-center gap-1.5 rounded-md transition-all disabled:opacity-50 disabled:pointer-events-none",
          triggerClass,
          className,
        )}
      >
        <span className={cn("truncate", variant === "selected" ? "max-w-48" : "text-left flex-1", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "shrink-0 text-muted-foreground/60 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, left: coords.left, minWidth: coords.width }}
          className="z-300 max-h-72 overflow-y-auto bg-card border border-(--custom-table-border) shadow-[0_16px_48px_rgba(0,0,0,0.45)] py-1"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2 text-xs text-left whitespace-nowrap transition-colors duration-100",
                  opt.value === value
                    ? "text-info-400 bg-info/10"
                    : "text-foreground/90 hover:bg-muted/20",
                )}
              >
                {opt.label}
                {opt.value === value && <Check size={12} className="shrink-0" />}
              </button>
            ))
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

export default Dropdown;
