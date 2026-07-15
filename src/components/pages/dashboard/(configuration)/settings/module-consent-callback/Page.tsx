"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { completeModuleConsent, initiateModuleConsent, getModuleConnectionStatus } from "@/src/services/module-consent/moduleConsentApi";
import { getMe } from "@/src/services/auth";
import { MODULE_LABELS, MODULE_TO_CONSENT_SERVICE, nextUnconnectedModule } from "@/src/lib/constants/modules";
import { Button } from "@/src/components/ui/inputs/Button";

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
  // Set right before redirecting into the next module's consent screen, so
  // the brief moment before the page navigates away reads as "moving on to
  // the next step" rather than looking stuck on "Connecting your tenant".
  const [nextLabel, setNextLabel] = useState<string | null>(null);
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

        // Continue the auto-connect chain: if another purchased module still
        // needs consent, redirect straight into it instead of stopping here.
        const user = await getMe();
        const next = nextUnconnectedModule(
          user.subscription?.paidModules ?? [],
          user.subscription?.connectedModules ?? [],
        );
        // Purview can't auto-connect: it needs the customer's own account
        // name + Log Analytics workspace ID first, plus two manual role
        // grants — the multi-step wizard at /dashboard/purview/connect.
        // Whether to resume mid-wizard or start from scratch depends on
        // whether Purview's OWN consent already ACTUALLY completed (this
        // callback also fires right after that, not just when some other
        // module's consent chains into Purview being next) —
        // paidModules/connectedModules can't tell these apart, and neither
        // can `status` alone: PROVISIONING is also the status right after
        // the connect form submits, before Microsoft consent has even
        // happened. `consentCompleted` (objectId actually set) is the one
        // signal that's unambiguous.
        if (next === "purview") {
          const purviewStatus = await getModuleConnectionStatus("PURVIEW");
          setPhase("success");
          // Three distinct resume points, since PROVISIONING alone can't
          // tell them apart: consent not done yet → start of the wizard
          // (readiness/network-access/admin-consent); consent done but the
          // account name/workspace ID haven't been saved → connection-details;
          // both done → the role-grant steps.
          let resumeUrl = "/dashboard/purview/connect";
          if (purviewStatus.consentCompleted) {
            resumeUrl = purviewStatus.detailsSubmitted
              ? "/dashboard/purview/connect?step=log-analytics-role"
              : "/dashboard/purview/connect?step=connection-details";
          }
          setTimeout(() => router.replace(resumeUrl), 1500);
          return;
        }
        if (next) {
          setNextLabel(MODULE_LABELS[next] ?? next);
          const { authorizationUrl } = await initiateModuleConsent(MODULE_TO_CONSENT_SERVICE[next]);
          window.location.href = authorizationUrl;
          return;
        }

        setPhase("success");
        setTimeout(() => router.replace("/dashboard"), 1500);
      } catch (err) {
        // A rapid double-click can race two parallel completions: the second
        // one reads stale "not yet connected" data and tries to re-initiate
        // a module the first one just finished connecting a moment earlier.
        // The backend correctly refuses that as redundant — but the true
        // outcome here is success, not failure, so show it that way instead
        // of a scary "Couldn't connect" for something that actually worked.
        const isAlreadyConnected =
          err instanceof Error && err.message.toLowerCase().includes("already connected");
        if (isAlreadyConnected) {
          setPhase("success");
          setTimeout(() => router.replace("/dashboard"), 1500);
          return;
        }
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
            <h1 className="text-lg font-bold text-foreground">
              {nextLabel ? `Connecting ${nextLabel}…` : "Connecting your tenant"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextLabel ? "Redirecting you to Microsoft to approve access." : "Verifying with Microsoft — this only takes a moment."}
            </p>
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
            <Link href="/dashboard" className="inline-block mt-5">
              <Button>Back to dashboard</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
