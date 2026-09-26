import React from "react";

export const metadata = {
  title: "Acceptable Use Policy",
  description: "Acceptable use guidelines for Vault distributed storage infrastructure.",
};

export default function AcceptableUsePage() {
  return (
    <article className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
      <div className="border-b border-[#252A31] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
          Acceptable Use Policy
        </h1>
        <p className="text-xs text-[#69717D] font-mono mt-1">
          Effective Date: September 26, 2026 • Version 2.4-demo
        </p>
      </div>

      <div className="p-3.5 rounded bg-[#171A1F] border border-[#252A31] text-[11px] text-[#E6B65C]">
        <strong>Demonstration Notice:</strong> Sample acceptable use policy for the Vault project.
      </div>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        1. Prohibited Activities
      </h2>
      <p>
        Users and cluster operators may not use Vault services to store or distribute malicious code, execute distributed denial-of-service (DDoS) campaigns, probe unauthorized cluster networks, or violate applicable international intellectual property laws.
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        2. System Integrity and Fair Resource Use
      </h2>
      <p>
        Intentional subversion of Reed-Solomon parity schemes, artificial degradation of cluster quorum, or flooding peer repair pipelines to degrade storage performance is strictly prohibited.
      </p>
    </article>
  );
}
