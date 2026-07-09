"use client";

import { useState } from "react";
import { MicrosoftLogo, Spinner } from "./AuthIcons";

interface MicrosoftSignInButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const MicrosoftSignInButton = ({ onClick, isLoading }: MicrosoftSignInButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full px-4 py-3.5 rounded  font-semibold text-white overflow-hidden transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
    >
      {/* Fixed dark navy — intentional brand colour, not theme-dependent */}
      <div className="absolute inset-0 bg-[var(--ms-btn-bg)]" />
      <div className={`absolute inset-0 bg-[var(--ms-btn-bg-hover)] transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

      <span className="relative flex items-center justify-between w-full">
        {isLoading ? (
          <span className="flex items-center gap-2.5 text-sm">
            <Spinner size={16} />
            Redirecting to Microsoft...
          </span>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <MicrosoftLogo size={20} />
              <span className="text-sm font-medium">Sign in with Microsoft</span>
            </div>
            <svg
              className="w-4 h-4 shrink-0 text-white/50 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </span>
    </button>
  );
};
