"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, Copy, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { Button } from "@/src/components/ui/inputs/Button";
import { formInputClass } from "@/src/components/ui/overlays/CreateModal";
import { initiateConsent } from "@/src/services/tenants/tenantApi";

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STEPS = ["Enter Tenant ID", "Grant admin consent", "Tenant ready"];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-5">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                i < step ? "bg-success-400 border-success-400" : i === step ? "border-info-400" : "border-border/40"
              }`}
            >
              {i < step && <Check size={12} className="text-background" />}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${i <= step ? "text-foreground" : "text-muted-foreground/50"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? "bg-success-400/40" : "bg-border/30"}`} />}
        </div>
      ))}
    </div>
  );
}

interface ConnectTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectTenantModal({ isOpen, onClose }: ConnectTenantModalProps) {
  const [tenantId, setTenantId] = useState("");
  const [phase, setPhase] = useState<"idle" | "consenting">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const isValid = GUID_RE.test(tenantId.trim());

  const handleClose = () => {
    setTenantId("");
    setPhase("idle");
    setAuthorizationUrl(null);
    setPopupBlocked(false);
    onClose();
  };

  const handleStartConsent = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const { authorizationUrl: url } = await initiateConsent(tenantId.trim());
      setAuthorizationUrl(url);
      const win = window.open(url, "_blank");
      setPopupBlocked(!win);
      setPhase("consenting");
    } catch (err) {
      toast.error("Failed to start consent flow", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const reopenConsentTab = () => {
    if (!authorizationUrl) return;
    const win = window.open(authorizationUrl, "_blank");
    setPopupBlocked(!win);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect a Microsoft tenant" variant="info" size="md">
      <StepIndicator step={phase === "idle" ? 0 : 1} />

      {phase === "idle" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg) p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Where to find your Tenant ID</p>
              <a
                href="https://portal.azure.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-info-400 hover:underline"
              >
                Open Azure Portal <ExternalLink size={11} />
              </a>
            </div>
            <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-0.5">
              <li>Sign in at portal.azure.com</li>
              <li>Go to Microsoft Entra ID → Overview</li>
              <li>Copy the Tenant ID value (looks like a UUID)</li>
            </ol>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Azure Tenant ID</label>
            <input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={formInputClass(tenantId.length > 0 && !isValid)}
            />
            {tenantId.length > 0 && !isValid && <p className="text-[11px] text-error-400 mt-1">Enter a valid tenant ID (UUID format).</p>}
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-info/10 border border-info/20">
            <AlertTriangle size={13} className="text-info-400 shrink-0 mt-0.5" />
            <p className="text-xs text-info-400">
              A Microsoft Global Administrator (or Privileged Role Administrator) of that tenant must approve the consent screen. If that&apos;s not
              you, share the consent link with someone who is.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleStartConsent} disabled={!isValid} loading={submitting} rightIcon={<ExternalLink size={13} />}>
              Start consent flow
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {popupBlocked ? (
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-3.5 space-y-2.5">
              <p className="text-xs font-semibold text-warning-400 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Popup blocked by your browser
              </p>
              <p className="text-xs text-muted-foreground">
                We tried to open the Microsoft consent screen in a new tab but the browser refused. Allow popups for this site, or use "Reopen
                consent tab" below — or copy the URL into a new tab manually.
              </p>
              {authorizationUrl && (
                <div className="flex items-center gap-2">
                  <input readOnly value={authorizationUrl} className={formInputClass() + " text-[11px]"} />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => { navigator.clipboard.writeText(authorizationUrl).catch(() => {}); toast.success("Copied"); }}
                    aria-label="Copy URL"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-(--custom-table-border) bg-(--custom-table-bg) p-4 flex flex-col items-center gap-2 text-center">
              <Loader2 size={18} className="text-info-400 animate-spin" />
              <p className="text-sm font-medium text-foreground">Waiting for Microsoft consent…</p>
              <p className="text-xs text-muted-foreground">
                A Global Administrator on that tenant needs to approve the consent screen in the tab we opened.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 rounded-lg border border-(--custom-table-border) px-3 py-2">
            <span className="text-[11px] font-mono text-muted-foreground truncate">{tenantId}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { navigator.clipboard.writeText(tenantId).catch(() => {}); toast.success("Copied"); }}
              aria-label="Copy tenant ID"
            >
              <Copy size={12} />
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={reopenConsentTab} leftIcon={<ExternalLink size={13} />}>
              Reopen consent tab
            </Button>
            <Button size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
