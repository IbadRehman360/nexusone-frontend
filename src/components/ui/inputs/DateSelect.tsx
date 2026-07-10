"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import { format, isBefore, isAfter, parseISO, startOfDay } from "date-fns";
import { cn } from "@/src/lib/utils/cn";
import { CalendarPopover } from "./CalendarPopover";

interface DateSelectProps {
  value: string; // yyyy-mm-dd
  onChange: (value: string) => void;
  min?: string; // yyyy-mm-dd
  max?: string; // yyyy-mm-dd
  placeholder?: string;
  id?: string;
  className?: string;
}

function parse(value: string): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Portalled to document.body and positioned with `position: fixed` from the
 * trigger's live bounding rect — mirrors Dropdown's approach, so the calendar
 * is never clipped by a scrolling/overflow-hidden ancestor (e.g. the rounded
 * card that wraps this field).
 */
export function DateSelect({ value, onChange, min, max, placeholder = "Select date", id, className }: DateSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = parse(value);
  const minDate = min ? parse(min) : null;
  const maxDate = max ? parse(max) : null;

  const openCalendar = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 6, left: rect.left });
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

  const isDisabled = (day: Date): boolean => {
    const d = startOfDay(day);
    return Boolean((minDate && isBefore(d, minDate)) || (maxDate && isAfter(d, maxDate)));
  };

  const handleSelect = (day: Date) => {
    const d = startOfDay(day);
    if (isDisabled(d)) return;
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-(--custom-header-input-border) bg-(--custom-table-bg) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-info-400"
      >
        <span className={cn(selectedDate ? "text-foreground" : "text-muted-foreground/60")}>
          {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
        </span>
        <Calendar size={15} className="text-muted-foreground shrink-0" />
      </button>

      {open && coords && createPortal(
        <div ref={panelRef} style={{ position: "fixed", top: coords.top, left: coords.left }} className="z-300">
          <CalendarPopover
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelect}
            onClear={() => {
              onChange("");
              setOpen(false);
            }}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
