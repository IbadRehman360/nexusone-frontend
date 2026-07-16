"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ban, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";

/**
 * Reached when the Azure OAuth sign-in round-trip completes but NexusOne
 * itself refuses the session — e.g. a tenant that was rejected/deactivated
 * before ever being approved (NOT_INVITED / TENANT_NOT_ENROLLED), no
 * privileged Entra role (NOT_PRIVILEGED_ADMIN), or a trial already
 * consumed by this Microsoft tenant (TRIAL_ALREADY_USED). No NexusOne
 * session exists at this point — the error is thrown before any cookies
 * are set (see auth.controller.ts's azureCallback catch block) — so there
 * is nothing to "sign out" of; the only real action is going back to try
 * sign-in again, optionally with a different Microsoft account.
 *
 * Previously this route rendered nothing at all (`return null`) — any
 * rejected/uninvited user landed on a blank white page with zero
 * explanation. `code` carries the real backend ErrorCode so this can show
 * tailored copy per case instead of one generic message.
 */
const CODE_CONTENT: Record<string, { icon: typeof Ban; title: string; body: (params: { tenantName?: string; ownerEmail?: string }) => string }> = {
  NOT_INVITED: {
    icon: KeyRound,
    title: "No pending invitation",
    body: ({ tenantName, ownerEmail }) =>
      `You don't currently have an invitation to join ${tenantName ?? "this organization's"} NexusOne workspace.${
        ownerEmail ? ` Ask ${ownerEmail} to send you one.` : " Ask an administrator to invite you."
      }`,
  },
  TENANT_NOT_ENROLLED: {
    icon: ShieldAlert,
    title: "Not enrolled in NexusOne",
    body: () => "Your organization hasn't signed up for NexusOne yet, and you don't hold a role that can start onboarding it.",
  },
  NOT_PRIVILEGED_ADMIN: {
    icon: ShieldAlert,
    title: "Admin role required",
    body: () =>
      "Starting a NexusOne trial requires a Global Administrator, Privileged Role Administrator, or Cloud Application Administrator role in your Microsoft tenant.",
  },
  TRIAL_ALREADY_USED: {
    icon: Ban,
    title: "Trial already used",
    body: () => "Your Microsoft tenant has already used its NexusOne trial. Ask your workspace Owner to purchase a plan.",
  },
};

const DEFAULT_CONTENT = {
  icon: Ban,
  title: "Sign-in failed",
  body: () => "Something went wrong completing sign-in. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? undefined;
  const tenantName = searchParams.get("tenantName") ?? undefined;
  const ownerEmail = searchParams.get("ownerEmail") ?? undefined;

  const content = (code && CODE_CONTENT[code]) || DEFAULT_CONTENT;
  const Icon = content.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-5">
          <Icon size={20} className="text-error-400" />
        </div>
        <h1 className="text-lg font-bold text-foreground">{content.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{content.body({ tenantName, ownerEmail })}</p>
        <Link href="/signin">
          <Button variant="outline" size="sm" className="mt-6">
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthErrorContent />
    </Suspense>
  );
}
