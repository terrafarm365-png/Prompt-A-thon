import React from "react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and cryptographic data handling principles of Vault.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
      <div className="border-b border-[#252A31] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#69717D] font-mono mt-1">
          Effective Date: September 26, 2026 • Version 2.4-demo
        </p>
      </div>

      <div className="p-3.5 rounded bg-[#171A1F] border border-[#252A31] text-[11px] text-[#E6B65C]">
        <strong>Demonstration Notice:</strong> This document represents a sample placeholder legal policy for the Vault open distributed storage frontend application.
      </div>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        1. Zero-Knowledge Object Architecture
      </h2>
      <p>
        Vault operates as a zero-knowledge distributed storage layer. Payload data is chunked and encrypted on the ingress tier before reaching hardware node disks. Vault operators do not inspect, index, or parse the content of customer objects stored within clusters.
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        2. Telemetry and Operational Logs
      </h2>
      <p>
        To ensure Reed-Solomon quorum and detect physical hardware decay, Vault nodes collect machine-level operational telemetry including CPU utilization, disk IOPS, network throughput, and cryptographic checksum validation results. This operational metadata does not contain personally identifiable information.
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        3. Data Retention and Erasure
      </h2>
      <p>
        When an object is deleted via the API or console, tombstone markers invalidate all participating Reed-Solomon data and parity shards. Cryptographic shredding ensures that orphaned blocks become mathematically irrecoverable.
      </p>
    </article>
  );
}
