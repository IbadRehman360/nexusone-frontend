"use client";

import { Public_Sans } from "next/font/google";
import {
  MicrosoftSignInButton,
  SignInHeader,
  SignInVisualPanel,
} from "@/src/components/pages/signin";
import { initiateAzureLogin } from "@/src/services/auth";

const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Page() {
  const handleLogin = () => {
    initiateAzureLogin();
  };

  return (
    <div className={`${publicSans.className} min-h-screen bg-background flex`}>
      <SignInVisualPanel />

      {/* Right: sign-in card */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        {/* Brand accent glow — uses info token so it adapts to theme */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-30%,rgb(var(--info)/0.05),transparent_20%)]" />

        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-115">

          {/* Auth card */}
          <div className="w-full rounded glass-card p-8 sm:p-10">

            <SignInHeader />

            <div className="space-y-3">
              <MicrosoftSignInButton onClick={handleLogin} isLoading={false} />
            </div>

            {/* Trial note */}
            <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
              New to NexusOne?{" "}
              <span className="text-info-400 font-medium">Start a 14-day trial</span>{" "}
              by signing in as your tenant&apos;s privileged admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
