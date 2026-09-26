import React from "react";
import { VaultLogo } from "@/components/layout/vault-logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <VaultLogo showText={true} versionBadge="v2.4-prod" href="/" />
        <Link
          href="/"
          className="text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
        >
          ← Return to Website
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-sm mx-auto my-8">{children}</div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-[11px] font-mono text-[#69717D]">
        Vault Infrastructure Security Enclave • Zero-Knowledge Mesh
      </div>
    </div>
  );
}
