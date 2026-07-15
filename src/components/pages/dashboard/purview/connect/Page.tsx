"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { FormField, formInputClass } from "@/src/components/ui/overlays/CreateModal";
import {
  initiateModuleConsent,
  setPurviewConnectionDetails,
  recheckPurviewConnection,
  getModuleConnectionStatus,
  type ModuleConnectionStatus,
  type PurviewVerificationResult,
} from "@/src/services/module-consent/moduleConsentApi";
import { OnboardingStepper, type OnboardingStep } from "./OnboardingStepper";

const STEPS: OnboardingStep[] = [
  { id: "readiness", label: "Do you have Purview?" },
  { id: "network-access", label: "Network access" },
  { id: "admin-consent", label: "Admin consent" },
  { id: "connection-details", label: "Connection details" },
  { id: "log-analytics-role", label: "Log Analytics role" },
  { id: "collection-roles", label: "Collection roles" },
  { id: "verification", label: "Verification" },
];

const RESUMABLE_STEPS = ["connection-details", "log-analytics-role", "collection-roles"] as const;
type ResumableStep = (typeof RESUMABLE_STEPS)[number];

// Purview account names are the subdomain segment only (e.g. "contoso" for
// https://contoso.purview.azure.com) — mirrors the backend's own validation
// so a typo is caught before saving, not after.
const ACCOUNT_NAME_PATTERN = /^[a-z0-9-]{3,63}$/i;
const NEXUSONE_PURVIEW_APP_NAME = "Nexusone - Purview";

// Real Microsoft deep links, not fabricated:
// - Purview governance portal accepts /resource/{accountName} directly.
// - Azure Portal's HubsExtension browse blade, filtered to Log Analytics
//   workspaces, is a genuine deep-link format (we only hold the workspace's
//   GUID, not its subscription/resource group, so the customer picks their
//   own workspace from this filtered list rather than a specific-resource link).
// - The "I don't have one yet" escape hatch points at Microsoft's own
//   quickstart, not a fabricated NexusOne page.
const LOG_ANALYTICS_BROWSE_URL =
  "https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.OperationalInsights%2Fworkspaces";
const CREATE_PURVIEW_ACCOUNT_DOCS_URL =
  "https://learn.microsoft.com/en-us/purview/legacy/create-microsoft-purview-portal";

type StepId = (typeof STEPS)[number]["id"];

// Given a requested resume target and the tenant's actual connection status,
// returns the step that's actually safe to show — never trust the query
// param alone, since it can't tell "consent genuinely completed" apart from
// "this link is stale / consent was abandoned".
function resolveResumeStep(requested: ResumableStep, status: ModuleConnectionStatus): StepId {
  if (!status.consentCompleted) return "admin-consent";
  if (requested === "connection-details") return "connection-details";
  return status.detailsSubmitted ? requested : "connection-details";
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChecklistRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      {passed ? (
        <CheckCircle2 size={16} className="text-success-400 shrink-0" />
      ) : (
        <XCircle size={16} className="text-error-400 shrink-0" />
      )}
      <span className={`text-sm ${passed ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm">
        {label} <ExternalLink size={13} />
      </Button>
    </a>
  );
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<StepId>("readiness");
  // True until the initial resume check below resolves. "step" defaults to
  // "readiness" before that — rendering it during the gap would flash step 1
  // for a moment on every load (and even more visibly right after Microsoft
  // consent, where the true target is step 4). Nothing about the wizard
  // renders while this is true; see the loading gate near the bottom.
  const [resolvingStep, setResolvingStep] = useState(true);
  const [hasAccount, setHasAccount] = useState<"yes" | "no" | null>(null);
  const [networkAccess, setNetworkAccess] = useState<"public" | "private" | null>(null);

  const [connecting, setConnecting] = useState(false);

  const [accountName, setAccountName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [checkingLA, setCheckingLA] = useState(false);
  const [checkingCollection, setCheckingCollection] = useState(false);
  const [result, setResult] = useState<PurviewVerificationResult | null>(null);

  // A customer returning from Microsoft's consent screen lands back here
  // with ?step=... — but the query param alone can't be trusted: if consent
  // never actually completed (e.g. an abandoned attempt, or a stale
  // bookmarked link), jumping straight to a later step could let the
  // customer act against a connection that isn't in the state assumed.
  // Verify with the backend's own record before honoring it.
  //
  // Once consumed, the param is stripped from the URL (router.replace, no
  // history entry) — otherwise it stays there forever, and re-opening this
  // exact URL later (a refresh, a bookmark, clicking "Connect" again while
  // it's still in the address bar) would keep re-triggering the jump-ahead
  // instead of a genuine first-time visit landing on step 1 like it should.
  useEffect(() => {
    const resumeAt = searchParams.get("step");
    // "grant-access" is the old, pre-split step id from an earlier revision
    // of this wizard — treat it the same as the first step it became.
    const requested = (
      resumeAt === "grant-access" ? "log-analytics-role" : resumeAt
    ) as string | null;

    // Always check the tenant's actual saved progress on load — not just
    // when a ?step= redirect param is present. A plain page refresh or a
    // direct visit to this URL carries no query param at all, but the
    // backend already remembers whatever was genuinely completed (consent,
    // connection details); without this check every refresh would silently
    // discard that progress and restart the whole wizard from "Do you have
    // Purview?", which is what a customer would reasonably read as the
    // connection having been lost.
    void (async () => {
      try {
        const status = await getModuleConnectionStatus("PURVIEW");
        if (requested && RESUMABLE_STEPS.includes(requested as ResumableStep)) {
          setStep(resolveResumeStep(requested as ResumableStep, status));
        } else if (status.consentCompleted) {
          // No explicit target (plain refresh/direct visit) — resume at the
          // furthest step this tenant has actually reached rather than
          // resetting to step 1.
          setStep(status.detailsSubmitted ? "log-analytics-role" : "connection-details");
        }
        // Neither condition met (no target requested AND consent not yet
        // completed) — nothing genuinely saved server-side yet, so leaving
        // the default "readiness" step stand is correct, not a regression.
      } catch {
        // Status check failed (e.g. the same session-expiry that can hit
        // any authenticated call) — leave the wizard on its current step
        // rather than guessing; the customer's own next action (recheck,
        // save, sign in again) will surface the real error.
      } finally {
        if (resumeAt) router.replace("/dashboard/purview/connect");
        setResolvingStep(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountNameError =
    accountName.length > 0 && !ACCOUNT_NAME_PATTERN.test(accountName)
      ? 'Enter just the account name (e.g. "contoso"), not the full URL.'
      : undefined;
  const canSubmitDetails =
    accountName.trim().length > 0 && !accountNameError && workspaceId.trim().length > 0;

  const purviewPortalUrl = accountName.trim()
    ? `https://web.purview.azure.com/resource/${encodeURIComponent(accountName.trim())}`
    : "https://web.purview.azure.com";

  const completedStepIds = new Set<StepId>(
    STEPS.slice(0, STEPS.findIndex((s) => s.id === step)).map((s) => s.id),
  );
  // "readiness" and "network-access" are answered by clicking a button,
  // nothing more — they never get a green checkmark implying we've confirmed
  // anything. Every other step only becomes "past" once a real fact is
  // confirmed: "admin-consent" only advances after Microsoft consent
  // actually completed, "connection-details" after the save succeeds, and
  // the two role-grant steps only advance after their live check passes.
  const verifiedStepIds = new Set<StepId>([
    "admin-consent",
    "connection-details",
    "log-analytics-role",
    "collection-roles",
  ]);

  const handleAdminConsent = async () => {
    setConnecting(true);
    try {
      const { authorizationUrl } = await initiateModuleConsent("PURVIEW");
      window.location.href = authorizationUrl;
    } catch (err) {
      toast.error("Couldn't start Connect", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setConnecting(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!canSubmitDetails) return;
    setSavingDetails(true);
    try {
      await setPurviewConnectionDetails(accountName.trim(), workspaceId.trim());
      setStep("log-analytics-role");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      if (message.toLowerCase().includes("complete the microsoft admin consent")) {
        setStep("admin-consent");
      }
      toast.error("Couldn't save connection details", { description: message });
    } finally {
      setSavingDetails(false);
    }
  };

  // Both role checks run together server-side (cheap, one round trip) — but
  // each step only ever advances ONE step forward on success, even if the
  // response says the whole connection is already active (e.g. the customer
  // granted both roles before coming back to recheck). Jumping straight from
  // "Log Analytics role" to "Verification" — skipping over "Collection
  // roles" without ever showing it — reads as the wizard glitching, not as
  // "good news, you're already done": the customer never gets confirmation
  // that the collection-roles grant they made was actually seen.
  const runRecheck = async (
    forStep: "log-analytics-role" | "collection-roles",
    setChecking: (v: boolean) => void,
  ) => {
    setChecking(true);
    try {
      const res = await recheckPurviewConnection();
      setResult(res);
      if (forStep === "log-analytics-role") {
        if (res.logAnalyticsReachable) setStep("collection-roles");
      } else if (res.active) {
        setStep("verification");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      // The backend refuses to recheck a connection whose Microsoft consent
      // never actually completed (a stale link, or an abandoned first
      // attempt) — send the customer back to redo that step instead of
      // leaving them stuck on a role-grant screen they can't get past.
      if (message.toLowerCase().includes("not been connected yet")) {
        setStep("admin-consent");
      }
      toast.error("Couldn't check connection", { description: message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connect Purview"
        description="Connect your existing Microsoft Purview account — NexusOne never creates one for you."
        breadcrumbs={[
          { label: "Purview", href: "/dashboard/purview", icon: ShieldCheck },
          { label: "Connect" },
        ]}
      />

      {resolvingStep ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <OnboardingStepper
          steps={STEPS}
          currentStepId={step}
          completedStepIds={completedStepIds}
          verifiedStepIds={verifiedStepIds}
        />

        <div>
          {step === "readiness" && (
            <StepShell
              title="Do you already have a Microsoft Purview account?"
              description="NexusOne connects to an existing account — it never creates one for you."
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={hasAccount === "yes" ? "default" : "outline"}
                    onClick={() => setHasAccount("yes")}
                  >
                    Yes, I have one
                  </Button>
                  <Button
                    variant={hasAccount === "no" ? "default" : "outline"}
                    onClick={() => setHasAccount("no")}
                  >
                    No, not yet
                  </Button>
                </div>

                {hasAccount === "no" && (
                  <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-header-bg) p-3.5 space-y-2.5">
                    <p className="text-xs text-muted-foreground">
                      You'll need a Purview account (and a paired Log Analytics workspace) before you
                      can connect. This is a one-time setup in your own Azure subscription.
                    </p>
                    <ExternalLinkButton
                      href={CREATE_PURVIEW_ACCOUNT_DOCS_URL}
                      label="How to create a Purview account"
                    />
                    <p className="text-[11px] text-muted-foreground/70">
                      Come back here once it's set up.
                    </p>
                  </div>
                )}

                <Button onClick={() => setStep("network-access")} disabled={hasAccount !== "yes"}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </StepShell>
          )}

          {step === "network-access" && (
            <StepShell
              title="Network access"
              description="Is your Purview account on a public endpoint, or restricted behind a private endpoint or firewall?"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={networkAccess === "public" ? "default" : "outline"}
                    onClick={() => setNetworkAccess("public")}
                  >
                    Public endpoint
                  </Button>
                  <Button
                    variant={networkAccess === "private" ? "default" : "outline"}
                    onClick={() => setNetworkAccess("private")}
                  >
                    Private endpoint / firewall restricted
                  </Button>
                </div>

                {networkAccess === "private" && (
                  <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-header-bg) p-3.5 text-xs text-muted-foreground">
                    You'll need to allow NexusOne's service through your firewall or private
                    endpoint configuration before the connection can succeed.{" "}
                    <a
                      href="mailto:support@nexusone.app?subject=Purview%20network%20access%20for%20Nexusone%20-%20Purview"
                      className="text-info-400 hover:underline"
                    >
                      Contact support
                    </a>{" "}
                    for our current outbound IP ranges.
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep("readiness")}>
                    Back
                  </Button>
                  <Button onClick={() => setStep("admin-consent")} disabled={!networkAccess}>
                    Continue <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </StepShell>
          )}

          {step === "admin-consent" && (
            <StepShell
              title="Grant admin consent"
              description="Sign in with Microsoft to grant read access to DLP alerts and sensitivity labels. This is separate from your NexusOne sign-in."
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-info/10 text-info-400 border border-info/20">
                    Grants: {NEXUSONE_PURVIEW_APP_NAME}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep("network-access")} disabled={connecting}>
                    Back
                  </Button>
                  <Button onClick={handleAdminConsent} loading={connecting}>
                    Sign in with Microsoft
                  </Button>
                </div>
              </div>
            </StepShell>
          )}

          {step === "connection-details" && (
            <StepShell
              title="Connection details"
              description="Enter identifiers so we know which account and workspace to connect to — no Microsoft sign-in needed for this step."
            >
              <div className="space-y-4">
                <FormField
                  label="Purview account name"
                  required
                  error={accountNameError}
                  hint={'e.g. "contoso" for https://contoso.purview.azure.com'}
                >
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="contoso"
                    className={formInputClass(!!accountNameError)}
                    disabled={savingDetails}
                  />
                </FormField>

                <FormField
                  label="Log Analytics workspace ID"
                  required
                  hint="The workspace paired with your Purview account"
                >
                  <input
                    type="text"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    placeholder="3235d0ce-433e-4ae3-bc99-8c7dbaddfdb8"
                    className={formInputClass()}
                    disabled={savingDetails}
                  />
                </FormField>

                <Button onClick={handleSaveDetails} disabled={!canSubmitDetails} loading={savingDetails}>
                  Save and continue
                </Button>
              </div>
            </StepShell>
          )}

          {step === "log-analytics-role" && (
            <StepShell
              title="Grant the Log Analytics role"
              description="One-time role grant in the Azure Portal — not here."
            >
              <div className="space-y-4">
                <ol className="space-y-1.5 text-sm text-foreground/90 pl-5 list-decimal">
                  <li>
                    Open your Log Analytics workspace in the Azure Portal{" "}
                    <a
                      href={LOG_ANALYTICS_BROWSE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex align-middle text-muted-foreground hover:text-info-400"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </li>
                  <li>Go to <span className="font-medium">Access control (IAM)</span> → Add role assignment</li>
                  <li>
                    Select role <span className="font-medium">Log Analytics Reader</span>
                  </li>
                  <li>
                    Assign it to <span className="font-semibold">{NEXUSONE_PURVIEW_APP_NAME}</span>
                  </li>
                </ol>

                <p className="text-xs text-muted-foreground">
                  Requires Owner, User Access Administrator, or Role Based Access Control
                  Administrator on the resource group hosting the workspace — not necessarily the
                  same person who completed the previous step. Feel free to forward this page to them.
                </p>

                {result && (
                  <div className="pt-1">
                    <ChecklistRow label="Log Analytics workspace reachable" passed={result.logAnalyticsReachable} />
                    {!result.logAnalyticsReachable && result.failureReason && (
                      <p className="mt-1 pl-6 text-xs text-muted-foreground">{result.failureReason}</p>
                    )}
                  </div>
                )}

                <Button onClick={() => runRecheck("log-analytics-role", setCheckingLA)} loading={checkingLA}>
                  I've granted this role — recheck
                </Button>
              </div>
            </StepShell>
          )}

          {step === "collection-roles" && (
            <StepShell
              title="Grant collection roles"
              description="One-time role grant in the Purview governance portal (Purview Studio) — not here."
            >
              <div className="space-y-4">
                <ol className="space-y-1.5 text-sm text-foreground/90 pl-5 list-decimal">
                  <li>Open your Purview governance portal</li>
                  <li>Go to <span className="font-medium">Data Map</span> → Collections</li>
                  <li>Select your root collection → Role assignments</li>
                  <li>
                    Add <span className="font-semibold">{NEXUSONE_PURVIEW_APP_NAME}</span> as a member
                  </li>
                  <li>Assign it these roles:</li>
                </ol>
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {["Data Reader", "Data Curator", "Insights Reader"].map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-info/10 text-info-400 border border-info/20"
                    >
                      {role}
                    </span>
                  ))}
                </div>

                <ExternalLinkButton href={purviewPortalUrl} label="Open your Purview governance portal" />

                <p className="text-xs text-muted-foreground">
                  Requires Collection Administrator on this Purview account, or Global Administrator
                  in Entra ID.
                </p>

                {result && (
                  <div className="pt-1">
                    <ChecklistRow label="Purview account reachable" passed={result.purviewReachable} />
                    {!result.purviewReachable && result.failureReason && (
                      <p className="mt-1 pl-6 text-xs text-muted-foreground">{result.failureReason}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep("log-analytics-role")}>
                    Back
                  </Button>
                  <Button
                    onClick={() => runRecheck("collection-roles", setCheckingCollection)}
                    loading={checkingCollection}
                  >
                    I've granted these roles — recheck
                  </Button>
                </div>
              </div>
            </StepShell>
          )}

          {step === "verification" && (
            <StepShell title="Verification">
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-success/10 mb-4">
                  <CheckCircle2 size={28} className="text-success-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Connection active</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your Purview account and Log Analytics workspace are connected.
                </p>
                <Button className="mt-5" onClick={() => router.push("/dashboard/purview")}>
                  Go to Purview
                </Button>
              </div>
            </StepShell>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
