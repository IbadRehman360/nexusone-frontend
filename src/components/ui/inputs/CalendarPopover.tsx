"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  isToday,
  startOfDay,
  format,
} from "date-fns";
import { cn } from "@/src/lib/utils/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarPopoverProps {
  selectedDate: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  onSelect: (day: Date) => void;
  onClear: () => void;
}

/** The dropdown calendar grid for DateSelect (month nav, day grid, footer). */
export function CalendarPopover({ selectedDate, minDate, maxDate, onSelect, onClear }: CalendarPopoverProps) {
  const [viewMonth, setViewMonth] = useState<Date>(selectedDate ?? maxDate ?? new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  });

  // Compare whole days only, so today's current time isn't treated as "after"
  // a max bound that parses to midnight.
  const isDisabled = (day: Date): boolean => {
    const d = startOfDay(day);
    return Boolean((minDate && isBefore(d, minDate)) || (maxDate && isAfter(d, maxDate)));
  };

  return (
    <div className="w-64 bg-card border border-(--custom-table-border) rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] p-3">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-semibold text-foreground">{format(viewMonth, "MMMM yyyy")}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-[10px] font-medium text-muted-foreground/60 text-center py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const disabled = isDisabled(day);
          // Today reads as the selected (filled) day until the user picks
          // another — but it isn't committed to the field until clicked.
          const highlighted =
            (selectedDate && isSameDay(day, selectedDate)) || (!selectedDate && isToday(day) && !disabled);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs transition-colors",
                highlighted
                  ? "bg-info-500 text-white font-semibold"
                  : disabled
                    ? "text-muted-foreground/25 cursor-not-allowed"
                    : inMonth
                      ? "text-foreground/85 hover:bg-muted/40"
                      : "text-muted-foreground/40 hover:bg-muted/30",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-(--custom-table-border)">
        <button type="button" onClick={onClear} className="text-xs text-info-400 hover:text-info-300 transition-colors">
          Clear
        </button>
        <button
          type="button"
          onClick={() => onSelect(new Date())}
          disabled={isDisabled(new Date())}
          className="text-xs text-info-400 hover:text-info-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Today
        </button>
      </div>
    </div>
  );
}
