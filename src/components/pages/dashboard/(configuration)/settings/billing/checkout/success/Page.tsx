"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, Loader2, AlertCircle, Mail } from "lucide-react";
import { getBillingState } from "@/src/services/billing/billingApi";
import { getMe } from "@/src/services/auth";
import { initiateModuleConsent, getModuleConnectionStatus } from "@/src/services/module-consent/moduleConsentApi";
import { MODULE_TO_CONSENT_SERVICE, nextUnconnectedModule } from "@/src/lib/constants/modules";
import { cn } from "@/src/lib/utils/cn";

const POLL_INTERVAL_MS = 1_000;
const MAX_POLLS = 90;
const DELAY_BANNER_AT = 10;
const ESCALATION_AT = 60;

const SYNC_STEPS = [
  { id: "payment", label: "Payment confirmed" },
  { id: "customer", label: "Customer record created" },
  { id: "provision", label: "Provisioning workspace" },
  { id: "features", label: "Enabling features" },
] as const;

type StepId = (typeof SYNC_STEPS)[number]["id"];
type Phase = "syncing" | "delayed" | "escalate" | "success" | "failed";

function stepsForElapsed(elapsed: number): Record<StepId, "pending" | "active" | "done"> {
  if (elapsed < 2) return { payment: "active", customer: "pending", provision: "pending", features: "pending" };
  if (elapsed < 5) return { payment: "done", customer: "active", provision: "pending", features: "pending" };
  if (elapsed < 9) return { payment: "done", customer: "done", provision: "active", features: "pending" };
  if (elapsed < 14) return { payment: "done", customer: "done", provision: "done", features: "active" };
  return { payment: "done", customer: "done", provision: "done", features: "done" };
}

function StepRow({ label, state }: { label: string; state: "pending" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="shrink-0 w-6 h-6 flex items-center justify-center">
        {state === "done" && <CheckCircle2 className="w-5 h-5 text-success-400" />}
        {state === "active" && <Loader2 className="w-5 h-5 text-info-400 animate-spin" />}
        {state === "pending" && <Circle className="w-5 h-5 text-muted-foreground/30" />}
      </span>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          state === "done" && "text-foreground",
          state === "active" && "text-info-400",
          state === "pending" && "text-muted-foreground/60",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id") ?? "unknown";

  const [phase, setPhase] = useState<Phase>("syncing");
  const [elapsed, setElapsed] = useState(0);
  const [stepStates, setStepStates] = useState(() => stepsForElapsed(0));

  const pollCount = useRef(0);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // getBillingState() can occasionally take longer than the 1s poll
  // interval (e.g. while a burst of Stripe webhooks is being processed) —
  // without this, a slow response lets the next interval tick start a
  // second overlapping poll() before the first finishes, and both can
  // independently detect success and each fire their own Connect redirect.
  const pollInFlight = useRef(false);
  // Belt-and-braces: even if overlap somehow still happens, this ensures
  // the post-success Connect/redirect logic itself only ever runs once.
  const postSuccessTriggered = useRef(false);

  const mailto = `mailto:billing-help@nexusone.app?subject=${encodeURIComponent(
    "Checkout sync stuck",
  )}&body=${encodeURIComponent(
    `Hi NexusOne Support,\n\nMy checkout sync appears to be stuck.\n\nSession ID: ${sessionId}\nTime: ${new Date().toISOString()}\n\nPlease help me activate my subscription.`,
  )}`;

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (pollInFlight.current) return; // previous tick still in flight — skip, don't overlap
    pollInFlight.current = true;
    try {
      pollCount.current += 1;
      const secs = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(secs);
      setStepStates(stepsForElapsed(secs));

      if (secs >= ESCALATION_AT) {
        stopPolling();
        setPhase("escalate");
        return;
      }
      if (secs >= DELAY_BANNER_AT) setPhase("delayed");

      if (pollCount.current >= MAX_POLLS) {
        stopPolling();
        setPhase("failed");
        return;
      }

      const state = await getBillingState();
      if (state.stripeStatus === "trialing" || state.stripeStatus === "active" || state.nexusStatus === "ACTIVE" || state.nexusStatus === "TRIAL") {
        stopPolling();
        setPhase("success");
        if (postSuccessTriggered.current) return; // already handled by an earlier tick
        postSuccessTriggered.current = true;
        // Once billing is confirmed synced, walk straight into Microsoft
        // consent for whatever was just bought instead of dropping the
        // customer on the billing page to go find a Connect button
        // themselves — same auto-chain the module-consent-callback page
        // continues after each consent completes.
        setTimeout(async () => {
          try {
            const user = await getMe();
            const next = nextUnconnectedModule(
              user.subscription?.paidModules ?? [],
              user.subscription?.connectedModules ?? [],
            );
            // Purview can't auto-connect: it needs the customer's own
            // account name + Log Analytics workspace ID first, plus two
            // manual role grants — the multi-step wizard at
            // /dashboard/purview/connect. Check consentCompleted (objectId
            // actually set), not just `status` — PROVISIONING alone doesn't
            // distinguish "consent already done, needs role grants" from
            // "connect form was submitted but Microsoft consent never
            // finished" (e.g. an abandoned prior attempt).
            if (next === "purview") {
              const purviewStatus = await getModuleConnectionStatus("PURVIEW");
              let resumeUrl = "/dashboard/purview/connect";
              if (purviewStatus.consentCompleted) {
                resumeUrl = purviewStatus.detailsSubmitted
                  ? "/dashboard/purview/connect?step=log-analytics-role"
                  : "/dashboard/purview/connect?step=connection-details";
              }
              router.replace(resumeUrl);
              return;
            }
            if (next) {
              const { authorizationUrl } = await initiateModuleConsent(MODULE_TO_CONSENT_SERVICE[next]);
              window.location.href = authorizationUrl;
              return;
            }
          } catch {
            // Never block the customer here — fall through to the normal
            // billing redirect if we can't tell what's left to connect.
          }
          router.replace("/dashboard/settings/billing");
        }, 1_500);
      }
    } catch {
      // Transient fetch errors are expected during provisioning — keep polling
    } finally {
      pollInFlight.current = false;
    }
  }, [stopPolling, router]);

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return stopPolling;
  }, [poll, stopPolling]);

  if (phase === "escalate" || phase === "failed") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="w-7 h-7 text-warning-400" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Still working on it…</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your payment was processed, but activating your subscription is taking longer than expected. Our team has been notified — no action is
            needed on your end.
          </p>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 text-left space-y-1">
            <p className="text-xs font-mono text-muted-foreground">Reference</p>
            <p className="text-xs font-mono text-foreground/80 break-all">{sessionId}</p>
          </div>
          <p className="text-sm text-muted-foreground">If this persists, contact us and include your reference ID above.</p>
          <a
            href={mailto}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-info-400 hover:opacity-90 text-white text-sm font-medium transition-opacity"
          >
            <Mail className="w-4 h-4" />
            Email Support
          </a>
          <button onClick={() => router.replace("/dashboard/settings/billing")} className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
            Go to billing dashboard
          </button>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="w-8 h-8 text-success-400" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">You're all set!</h1>
          <p className="text-sm text-muted-foreground">Redirecting you to your billing dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-2xl border border-(--custom-table-border) bg-(--custom-table-header-bg) p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-info/10">
            <Loader2 className="w-6 h-6 text-info-400 animate-spin" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Activating your subscription</h1>
          {phase === "delayed" ? (
            <p className="text-sm text-warning-400">Hang tight — this is taking a moment</p>
          ) : (
            <p className="text-sm text-muted-foreground">Just a few seconds…</p>
          )}
        </div>

        <div className="divide-y divide-(--custom-table-border)">
          {SYNC_STEPS.map((step) => (
            <StepRow key={step.id} label={step.label} state={stepStates[step.id]} />
          ))}
        </div>

        <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-info-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (elapsed / ESCALATION_AT) * 100)}%` }} />
        </div>

        {phase === "delayed" && (
          <p className="text-xs text-center text-muted-foreground">This can happen during high traffic. Your payment was accepted — the subscription will activate shortly.</p>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
