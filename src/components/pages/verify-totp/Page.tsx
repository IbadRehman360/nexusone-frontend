"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Public_Sans } from "next/font/google";
import { ShieldCheck } from "lucide-react";
import { SignInVisualPanel } from "@/src/components/pages/signin";
import { TotpInput } from "@/src/components/ui/inputs/TotpInput";
import { verifyMfaLogin } from "@/src/services/auth";

const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

/**
 * Reached after SSO (or, in principle, the dormant password rail) succeeds
 * for an account with 2FA enabled — the backend withholds the real session
 * and issues only the mfa_pending_token cookie, which this page's
 * verifyMfaLogin() call reads server-side. No email/identifier is passed
 * here client-side; there's nothing to leak in the URL.
 */
export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (value: string) => {
    if (submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      await verifyMfaLogin(value);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.replace("/dashboard");
    } catch {
      setError(true);
      setShake(true);
      setCode("");
      setSubmitting(false);
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    if (error) setError(false);
    if (value.length === 6) void submit(value);
  };

  return (
    <div className={`${publicSans.className} min-h-screen bg-background flex`}>
      <SignInVisualPanel />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-30%,rgb(var(--info)/0.05),transparent_20%)]" />

        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-115">
          <div className="w-full rounded glass-card p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={20} className="text-info-400" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Two-factor authentication</h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground leading-relaxed">
              Enter the 6-digit code from your authenticator app.
            </p>

            <TotpInput
              value={code}
              onChange={handleChange}
              error={error}
              shake={shake}
              onShakeEnd={() => setShake(false)}
            />

            {error && (
              <p className="mt-4 text-xs text-error-400">Invalid or expired code. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
