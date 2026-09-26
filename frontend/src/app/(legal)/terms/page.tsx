import React from "react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for Vault distributed storage infrastructure.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
      <div className="border-b border-[#252A31] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
          Terms of Service
        </h1>
        <p className="text-xs text-[#69717D] font-mono mt-1">
          Effective Date: September 26, 2026 • Version 2.4-demo
        </p>
      </div>

      <div className="p-3.5 rounded bg-[#171A1F] border border-[#252A31] text-[11px] text-[#E6B65C]">
        <strong>Demonstration Notice:</strong> Sample terms of service for the Vault project.
      </div>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        1. Cluster Operations and Service Availability
      </h2>
      <p>
        Vault provides distributed storage management and erasure coding synthesis software. In self-hosted community installations, operational uptime is subject to the underlying physical compute, network, and disk hardware provisioned by the operator.
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        2. Acceptable Infrastructure Use
      </h2>
      <p>
        Users agree not to utilize Vault clusters for unlawful payload distribution, denial-of-service amplification, or activities that compromise peer node integrity across the distributed mesh.
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        3. Limitation of Liability
      </h2>
      <p>
        To the maximum extent permitted by applicable law, Vault software is provided &quot;as is&quot; without warranties of any kind. Operators remain responsible for configuring appropriate parity redundancy parameters according to their fault domain requirements.
      </p>
    </article>
  );
}
