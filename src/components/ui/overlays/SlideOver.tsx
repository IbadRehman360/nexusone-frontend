"use client";

import * as React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils/cn";

export type SlideOverWidth = "sm" | "md" | "lg" | "xl";

const widthClasses: Record<SlideOverWidth, string> = {
  sm: "w-100",            // ~400px
  md: "w-120",            // ~480px
  lg: "w-screen max-w-2xl shrink-0",
  xl: "w-screen max-w-3xl shrink-0",
};

export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  width?: SlideOverWidth;
  /** Replaces the default header entirely when provided. */
  header?: React.ReactNode;
  /** Sticky footer (e.g. action buttons). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  /** Extra classes for the scrollable body. */
  bodyClassName?: string;
}

/**
 * Right-side slide-over / drawer. The single shared primitive for detail panels,
 * create/edit forms, and confirmation flows that slide in from the right.
 * Mirrors the Modal primitive's behaviour (portal, Escape, body-scroll lock).
 */
export function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  width = "sm",
  header,
  footer,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  bodyClassName = "",
}: SlideOverProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) onClose();
    };
    if (isOpen) {
      if (closeOnEscape) document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen || !isMounted) return null;

  const content = (
    <div className="fixed inset-y-0 right-0 z-300 flex">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      <div
        className={cn(
          "relative ml-auto bg-[var(--custom-sidebar-bg,rgb(var(--shell-surface)))] border-l border-(--custom-header-input-border) flex flex-col h-full shadow-2xl",
          "animate-in slide-in-from-right duration-200",
          widthClasses[width],
        )}
        role="dialog"
        aria-modal="true"
      >
        {header ?? (
          (title || showCloseButton) && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--custom-header-input-border) shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="w-8 h-8 rounded-lg bg-(--custom-table-bg) border border-(--custom-table-border) flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <p className="text-[14px] font-semibold text-foreground leading-tight">{title}</p>
                  )}
                  {subtitle && (
                    <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-md p-1.5 hover:bg-muted/60 transition-colors text-muted-foreground"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )
        )}

        <div className={cn("flex-1 overflow-y-auto", bodyClassName)}>{children}</div>

        {footer && (
          <div className="flex items-center gap-2.5 px-5 py-4 border-t border-(--custom-header-input-border) bg-muted/20 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
