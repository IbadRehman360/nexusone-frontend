"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

/**
 * A monospace identifier with one-click copy (flips to a ✓ briefly). The single
 * reusable "readable + copyable id" primitive — used by the error card and the
 * Contact Support dialog for the reference (correlation) ID.
 */
export function CopyableId({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the id is still selectable by hand */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy reference ID"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <span className="font-mono">{value}</span>
      {copied ? (
        <Check size={12} className="text-success-400 shrink-0" />
      ) : (
        <Copy size={12} className="shrink-0" />
      )}
    </button>
  );
}

export default CopyableId;
