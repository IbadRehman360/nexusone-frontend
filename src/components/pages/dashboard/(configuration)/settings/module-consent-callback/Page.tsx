"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { completeModuleConsent } from "@/src/services/module-consent/moduleConsentApi";

type Phase = "connecting" | "success" | "failure";

/**
 * Reached after a customer approves (or declines) Microsoft's per-module
 * admin-consent screen — see auth.controller.ts's moduleConsentCallback,
 * which forwards state/tenant/admin_consent/error here verbatim. Unlike
 * /auth/tenant-consent-callback (a dead stub left over from an earlier,
 * unfinished tenant-bootstrap flow), this page actually completes the job.
 */
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Wrapped in an async IIFE so every setState call happens inside a
    // callback rather than synchronously in the effect body.
    void (async () => {
      const error = searchParams.get("error");
      const adminConsent = searchParams.get("admin_consent");
      const state = searchParams.get("state");
      const tenant = searchParams.get("tenant");

      if (error) {
        setPhase("failure");
        setMessage(searchParams.get("error_description") ?? "Consent was not granted.");
        return;
      }
      if (adminConsent !== "True" || !state || !tenant) {
        setPhase("failure");
        setMessage("Missing or incomplete response from Microsoft.");
        return;
      }

      try {
        await completeModuleConsent(state, tenant);
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        setPhase("success");
        setTimeout(() => router.replace("/dashboard"), 1500);
      } catch (err) {
        setPhase("failure");
        setMessage(err instanceof Error ? err.message : "Could not complete the connection.");
      }
    })();
  }, [searchParams, queryClient, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-8 text-center">
        {phase === "connecting" && (
          <>
            <div className="w-12 h-12 rounded-full bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={20} className="text-info-400 animate-spin" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Connecting your tenant</h1>
            <p className="mt-2 text-sm text-muted-foreground">Verifying with Microsoft — this only takes a moment.</p>
          </>
        )}
        {phase === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success-400/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={20} className="text-success-400" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Connected</h1>
            <p className="mt-2 text-sm text-muted-foreground">Taking you back to your dashboard.</p>
          </>
        )}
        {phase === "failure" && (
          <>
            <div className="w-12 h-12 rounded-full bg-error/10 border border-error-400/20 flex items-center justify-center mx-auto mb-5">
              <XCircle size={20} className="text-error-400" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Couldn&apos;t connect</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-info text-info-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to dashboard
            </a>
          </>
        )}
      </div>
    </div>
  );
}
