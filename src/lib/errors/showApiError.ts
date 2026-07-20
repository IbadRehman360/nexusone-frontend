import { toast } from "sonner";
import {
  getErrorPresentation,
  type ErrorPresentation,
} from "./getErrorPresentation";

/**
 * The single, canonical way to surface a caught API error as a toast.
 *
 * Routes every error through {@link getErrorPresentation} so the user always
 * sees a friendly, errorCode-aware title + message (never a raw exception
 * string), and always gets the reference ID they can quote to support. Drop-in
 * replacement for the old `toast.error("...", { description: err.message })`
 * pattern — pass the raw error, not a hand-written message.
 *
 * The global `MutationCache`/`QueryCache` handlers (see lib/query/queryClient)
 * call this automatically for any query/mutation that doesn't handle its own
 * error, so even un-migrated and future code is backstopped. Call it directly
 * when you want a toast at a specific point (e.g. inside a hand-rolled
 * try/catch) while still overriding the title.
 */
export function showApiError(
  error: unknown,
  opts?: { title?: string },
): ErrorPresentation {
  const presentation = getErrorPresentation(error);

  const description = presentation.correlationId
    ? `${presentation.message}\nReference ID: ${presentation.correlationId}`
    : presentation.message;

  const title = opts?.title ?? presentation.title;

  // Match the toast type to the presentation severity so it picks up the right
  // icon + tint from the Toaster config in app/layout.tsx.
  const show =
    presentation.severity === "warning"
      ? toast.warning
      : presentation.severity === "info"
        ? toast.info
        : toast.error;

  show(title, {
    description,
    // A toast carrying a reference ID stays up longer (12s vs the ~4s default)
    // so there's actually time to read and copy it, and gets a one-click
    // "Copy ID" action so the user never has to hand-select from a toast.
    duration: presentation.correlationId ? 12_000 : undefined,
    action: presentation.correlationId
      ? {
          label: "Copy ID",
          onClick: () => copyReferenceId(presentation.correlationId as string),
        }
      : undefined,
  });

  return presentation;
}

function copyReferenceId(id: string): void {
  if (!navigator.clipboard) return;
  navigator.clipboard
    .writeText(id)
    .then(() => toast.success("Reference ID copied"))
    .catch(() => {
      /* clipboard blocked — leave the toast up so the id can be read/selected */
    });
}
