"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { PageHeader } from "@/src/components/ui/navigation/PageHeader";
import { Button } from "@/src/components/ui/inputs/Button";
import { Modal } from "@/src/components/ui/overlays/Modal";
import { TotpInput } from "@/src/components/ui/inputs/TotpInput";
import { useAuth } from "@/src/hooks/useAuth";
import { startMfaSetup, confirmMfaSetup, disableMfa } from "@/src/services/auth";

type ModalPhase = "closed" | "setup" | "disable";

export default function Page() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = user?.mfaEnabled ?? false;

  const [phase, setPhase] = useState<ModalPhase>("closed");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

  const closeModal = () => {
    setPhase("closed");
    setCode("");
    setError(false);
    setQrCode(null);
    setManualKey(null);
  };

  const openSetup = async () => {
    setStarting(true);
    try {
      const result = await startMfaSetup();
      setQrCode(result.qrCode);
      setManualKey(result.manualKey);
      setPhase("setup");
    } catch (err) {
      toast.error("Couldn't start 2FA setup", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setStarting(false);
    }
  };

  const confirmCode = async (value: string) => {
    setConfirming(true);
    try {
      if (phase === "setup") {
        await confirmMfaSetup(value);
        toast.success("Two-factor authentication enabled");
      } else {
        await disableMfa(value);
        toast.success("Two-factor authentication disabled");
      }
      await invalidate();
      closeModal();
    } catch (err) {
      setError(true);
      setShake(true);
      setCode("");
      toast.error(phase === "setup" ? "Invalid code" : "Couldn't disable 2FA", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (error) setError(false);
    if (value.length === 6) void confirmCode(value);
  };

  const copyKey = () => {
    if (!manualKey) return;
    navigator.clipboard.writeText(manualKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Manage two-factor authentication for your account."
        breadcrumbs={[{ label: "Security", icon: ShieldCheck }]}
      />

      <div className="rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                enabled ? "bg-success/10 border-success-400/20" : "bg-info/10 border-info/20"
              }`}
            >
              <ShieldCheck size={18} className={enabled ? "text-success-400" : "text-info-400"} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
                {enabled
                  ? "Your account is protected with an authenticator app. You'll be asked for a code every time you sign in."
                  : "Add an extra layer of security — after signing in with Microsoft, you'll also need a code from an authenticator app."}
              </p>
            </div>
          </div>
          {enabled ? (
            <Button variant="danger-outline" size="sm" onClick={() => setPhase("disable")}>
              Disable
            </Button>
          ) : (
            <Button size="sm" onClick={openSetup} loading={starting}>
              Enable
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={phase === "setup"}
        onClose={closeModal}
        title="Set up two-factor authentication"
        size="sm"
        closeOnOverlayClick={false}
        loading={confirming}
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app (Microsoft Authenticator, Google Authenticator, 1Password,
            etc.), then enter the 6-digit code it shows.
          </p>
          {qrCode && (
            // eslint-disable-next-line @next/next/no-img-element -- data: URI QR code, not a candidate for next/image optimization
            <img
              src={qrCode}
              alt="Scan with your authenticator app"
              width={180}
              height={180}
              className="mx-auto rounded-lg border border-(--custom-table-border)"
            />
          )}
          {manualKey && (
            <button
              type="button"
              onClick={copyKey}
              className="mx-auto flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {manualKey}
            </button>
          )}
          <TotpInput value={code} onChange={handleCodeChange} error={error} shake={shake} onShakeEnd={() => setShake(false)} />
          {error && <p className="text-center text-xs text-error-400">Invalid code. Please try again.</p>}
        </div>
      </Modal>

      <Modal
        isOpen={phase === "disable"}
        onClose={closeModal}
        title="Disable two-factor authentication"
        variant="danger"
        size="sm"
        closeOnOverlayClick={false}
        loading={confirming}
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Enter a current code from your authenticator app to confirm.</p>
          <TotpInput value={code} onChange={handleCodeChange} error={error} shake={shake} onShakeEnd={() => setShake(false)} />
          {error && <p className="text-center text-xs text-error-400">Invalid code. Please try again.</p>}
        </div>
      </Modal>
    </div>
  );
}
