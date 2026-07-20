"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { initiateAzureLogin } from "@/src/services/auth";

/**
 * Reached when the SSO/consent callback fails (see auth.controller.ts's
 * azureCallback / sharedAppConsentCallback catch blocks, which redirect here
 * with `error` + `code`, and for unexpected failures a `correlationId`
 * instead of the raw internal error — never put a raw exception message in
 * this URL). Previously a stub that rendered nothing, so a failed login
 * showed a blank page with zero explanation.
 */
export default function Page() {
  const searchParams = useSearchParams();
  const message = searchParams.get("error") ?? "Something went wrong signing you in.";
  const code = searchParams.get("code");
  const tenantName = searchParams.get("tenantName");
  const ownerEmail = searchParams.get("ownerEmail");
  const correlationId = searchParams.get("correlationId");

  const isNotInvited = code === "NOT_INVITED" || code === "TENANT_NOT_ENROLLED";

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 border border-error-400/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={20} className="text-error-400" />
        </div>

        <h1 className="text-lg font-bold text-foreground">Couldn&apos;t sign you in</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>

        {isNotInvited && ownerEmail && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Ask {tenantName ? `${tenantName}'s` : "your organization's"} admin ({ownerEmail}) to send you an invitation.
          </p>
        )}

        {correlationId && (
          <p className="mt-4 text-xs text-muted-foreground">
            Reference ID: <span className="font-mono">{correlationId}</span>
          </p>
        )}

        <Button className="mt-6" onClick={initiateAzureLogin}>
          Try again
        </Button>
      </div>
    </div>
  );
}
