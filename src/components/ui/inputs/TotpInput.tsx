"use client";

import { useRef } from "react";
import { cn } from "@/src/lib/utils/cn";

const TOTP_LENGTH = 6;

interface TotpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  shake?: boolean;
  onShakeEnd?: () => void;
  autoFocus?: boolean;
}

/** 6-digit code entry — auto-advance, backspace-to-previous, paste-splitting. Used for both login verification and 2FA setup/disable confirmation. */
export function TotpInput({
  value,
  onChange,
  error = false,
  shake = false,
  onShakeEnd,
  autoFocus = true,
}: TotpInputProps) {
  const digits = Array.from({ length: TOTP_LENGTH }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, TOTP_LENGTH));

    if (digit && index < TOTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = value.split("");
        next[index - 1] = "";
        onChange(next.join("").slice(0, TOTP_LENGTH));
      } else {
        const next = value.split("");
        next[index] = "";
        onChange(next.join("").slice(0, TOTP_LENGTH));
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < TOTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, TOTP_LENGTH);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, TOTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className={cn("flex gap-2.5 justify-center", shake && "animate-shake")} onAnimationEnd={onShakeEnd}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-150",
            "outline-none caret-transparent bg-(--custom-table-bg)",
            error
              ? "border-error-400/60 bg-error/10 focus:border-error-400/80"
              : digit
                ? "border-info-400/70 bg-info/10 text-info-400"
                : "border-(--custom-header-input-border) hover:border-info-400/40 focus:border-info-400/60",
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
