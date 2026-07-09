

"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Loader } from "@/src/components/ui/feedback/Loader";

export type ModalVariant = "default" | "danger" | "success" | "warning" | "info";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  header?: React.ReactNode; // Custom header override
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  bodyClassName?: string;
  preventBodyScroll?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm w-full",
  md: "max-w-lg w-full",
  lg: "max-w-2xl w-full",
  xl: "max-w-4xl w-full",
  full: "max-w-6xl w-full",
};

const variantStyles: Record<ModalVariant, { border: string; headerBg: string; iconBg: string }> = {
  default: {
    border: "border-(--custom-header-input-border)",
    headerBg: "bg-gradient-to-r from-info-600/5 to-transparent",
    iconBg: "bg-gradient-to-br from-info/30 to-info-600/20 border-info-400/30 shadow-blue-500/20",
  },
  danger: {
    border: "border-(--custom-header-input-border)",
    headerBg: "bg-gradient-to-r from-error-600/5 to-transparent",
    iconBg: "bg-gradient-to-br from-error/30 to-error-600/20 border-error-400/30 shadow-red-500/20",
  },
  success: {
    border: "border-(--custom-header-input-border)",
    headerBg: "bg-gradient-to-r from-success-600/5 to-transparent",
    iconBg: "bg-gradient-to-br from-success/30 to-success-600/20 border-success-400/30 shadow-green-500/20",
  },
  warning: {
    border: "border-(--custom-header-input-border)",
    headerBg: "bg-gradient-to-r from-warning-600/5 to-transparent",
    iconBg: "bg-gradient-to-br from-warning/30 to-warning-600/20 border-warning-400/30 shadow-yellow-500/20",
  },
  info: {
    border: "border-(--custom-header-input-border)",
    headerBg: "bg-gradient-to-r from-info-600/5 to-transparent",
    iconBg: "bg-gradient-to-br from-info/30 to-info-600/20 border-info-400/30 shadow-blue-500/20",
  },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  header,
  icon,
  loading = false,
  className = "",
  bodyClassName = "",
  preventBodyScroll = true,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure component is mounted (for SSR safety)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close modal on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      if (closeOnEscape) {
        document.addEventListener("keydown", handleEscape);
      }
      if (preventBodyScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (preventBodyScroll) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventBodyScroll]);

  if (!isOpen || !isMounted) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const styles = variantStyles[variant];

  const modalContent = (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div
        className={`relative bg-surface-elevated border ${styles.border} rounded-2xl shadow-2xl ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-surface-elevated border border-(--custom-header-input-border) rounded-md px-4 py-3 shadow-lg">
              <Loader size="sm" />
              <span className="text-sm font-medium text-foreground">Loading...</span>
            </div>
          </div>
        )}

        {/* Header */}
        {header || (title || showCloseButton) && (
          <div className={`flex items-center justify-between px-5 py-4 border-b ${styles.border} shrink-0 rounded-t-2xl`}>
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`p-2 ${styles.iconBg} rounded-lg border`}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h2 id="modal-title" className="text-base font-semibold text-foreground leading-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 overflow-y-auto px-6 py-5 ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border/50 shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
