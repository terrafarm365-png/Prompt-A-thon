import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VaultLogoProps {
  className?: string;
  showText?: boolean;
  versionBadge?: string;
  href?: string;
}

export function VaultLogo({
  className,
  showText = true,
  versionBadge,
  href = "/",
}: VaultLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="relative w-8 h-8 rounded-md bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-5 h-5"
          fill="none"
        >
          <path
            d="M9 10L16 6L23 10V22L16 26L9 22V10Z"
            stroke="#4F7CFF"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M16 6V16M23 10L16 16M9 10L16 16"
            stroke="#4F7CFF"
            strokeWidth="1.25"
            strokeOpacity="0.8"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="2.5" fill="#35C98B" />
          <circle
            cx="16"
            cy="16"
            r="4"
            stroke="#35C98B"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {showText && (
        <span className="font-semibold tracking-wider text-[#F5F7FA] text-base font-sans">
          VAULT
        </span>
      )}

      {versionBadge && (
        <span className="px-1.5 py-0.5 bg-[#282A2D] rounded text-[#9AA3AF] font-mono text-[11px] border border-[#333538]">
          {versionBadge}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
