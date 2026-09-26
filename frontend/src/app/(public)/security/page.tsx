import React from "react";
import { Lock, ShieldCheck, Key, FileCheck } from "lucide-react";

export const metadata = {
  title: "Security",
  description: "Cryptographic integrity and enterprise security architecture of Vault.",
};

export default function SecurityPage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Cryptographic SHA-256 Verification",
      description:
        "Every byte written to the cluster is verified against its cryptographic checksum at rest and during transit. Bit flips caused by cosmic rays or hardware decay are immediately detected and pruned.",
    },
    {
      icon: Lock,
      title: "Zero-Trust mTLS Interconnects",
      description:
        "Cluster nodes authenticate one another using short-lived SPIFFE/SPIRE x509 certificates. Unauthenticated network requests are rejected at the transport layer with zero socket exposure.",
    },
    {
      icon: Key,
      title: "AES-256-GCM Enclave Encryption",
      description:
        "Objects are encrypted before shard distribution. Individual nodes only possess isolated shards with unique ephemeral salt keys, rendering stolen or discarded drives indecipherable.",
    },
    {
      icon: FileCheck,
      title: "Continuous Automated Disk Scrubbing",
      description:
        "Background daemons cycle through all stored blocks, verifying cryptographic digests at configured intervals and automatically invoking peer repair on the first hint of checksum drift.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-mono text-[#35C98B] uppercase tracking-wider font-semibold">
          ZERO COMPROMISE
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F7FA]">
          Security & Cryptographic Guarantees
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
          How Vault secures petabytes of sensitive enterprise data against tampering, silent corruption, and unauthorized physical access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3"
            >
              <div className="w-10 h-10 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center text-[#35C98B]">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#F5F7FA]">
                {item.title}
              </h3>
              <p className="text-xs text-[#9AA3AF] leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
