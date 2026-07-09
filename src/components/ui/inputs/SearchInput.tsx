"use client";

import { forwardRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Force focused styles from outside (e.g. header expand/collapse state) */
  focused?: boolean;
  /** Extra content rendered after the input (e.g. keyboard shortcut badge) */
  suffix?: React.ReactNode;
  /** Show a clear (×) button when there is a value */
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onWrapperClick?: () => void;
  /** Height variant */
  size?: "sm" | "md";
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      placeholder = "Search…",
      focused: controlledFocused,
      suffix,
      clearable = true,
      className,
      inputClassName,
      onFocus,
      onBlur,
      onWrapperClick,
      size = "md",
    },
    ref,
  ) {
    const [internalFocused, setInternalFocused] = useState(false);
    const isFocused = controlledFocused ?? internalFocused;

    return (
      <div
        onClick={onWrapperClick}
        className={cn(
          "flex items-center rounded-xl overflow-hidden transition-[border-color,box-shadow,background] duration-300 ease-in-out",
          size === "md" ? "h-9" : "h-8",
          isFocused
            ? "bg-muted/15 border border-(--custom-header-input-border) brightness-110 shadow-[0_0_0_2px_var(--custom-header-input-border)]"
            : "bg-muted/15 border border-(--custom-header-input-border) hover:bg-muted/25",
          className,
        )}
      >
        {/* Search icon */}
        <div
          className={cn(
            "shrink-0 flex items-center justify-center text-foreground",
            size === "md" ? "w-10 h-10" : "w-8 h-8",
          )}
        >
          <Search size={size === "md" ? 15 : 13} strokeWidth={2} />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            setInternalFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setInternalFocused(false);
            onBlur?.();
          }}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground min-w-0",
            size === "md" ? "text-[13px]" : "text-xs",
            inputClassName,
          )}
        />

        {/* Clear button */}
        {clearable && value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
            className={cn(
              "shrink-0 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors duration-150",
              size === "md" ? "w-7 h-7 mr-1" : "w-5 h-5 mr-1",
            )}
          >
            <X size={size === "md" ? 12 : 10} />
          </button>
        )}

        {/* Suffix (e.g. keyboard shortcut badge) */}
        {suffix && !value && (
          <div className="flex items-center px-2.5 shrink-0">{suffix}</div>
        )}
      </div>
    );
  },
);
