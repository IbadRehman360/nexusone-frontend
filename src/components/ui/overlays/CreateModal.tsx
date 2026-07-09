"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import type { ModalSize } from "./Modal";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  submitDisabled?: boolean;
  submitting?: boolean;
  size?: ModalSize;
}

/**
 * Reusable "Create X" modal — form body + Cancel/Submit footer, styled to
 * match the DataTable chrome (clean surface, no tinted boxes). Compose the
 * form fields as children using the field classes below for a consistent look.
 */
export function CreateModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  onSubmit,
  submitLabel = "Create",
  submitDisabled = false,
  submitting = false,
  size = "md",
}: CreateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      size={size}
      loading={submitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={submitDisabled || submitting} loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">{children}</div>
    </Modal>
  );
}

/** Consistent label + input/select field wrapper for CreateModal bodies. */
export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-error-400">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-error-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** min-h-9 matches the Dropdown trigger height; textareas grow past it naturally. */
export const formInputClass = (hasError?: boolean) =>
  `w-full min-h-9 px-3 py-2 bg-(--custom-table-bg) border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info/40 focus:border-info-400 transition-colors ${
    hasError ? "border-error-400" : "border-(--custom-header-input-border)"
  }`;

export default CreateModal;
