import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Layers,
  ShieldCheck,
  Zap,
  Server,
  HardDrive,
  Lock,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Features",
  description: "Enterprise infrastructure features of Vault distributed object storage.",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Layers,
      title: "Reed-Solomon RS(4+2) Erasure Coding",
      description:
        "Stripes every stored payload across 4 data chunks and 2 parity chunks. Tolerates 2 simultaneous node crashes with 66.7% storage efficiency.",
    },
    {
      icon: Zap,
      title: "Autonomous Peer-to-Peer Shard Healing",
      description:
        "Surviving storage nodes autonomously discover parity imbalances and rebuild degraded shards in parallel across cluster network mesh.",
    },
    {
      icon: ShieldCheck,
      title: "Cryptographic SHA-256 Bit-Rot Prevention",
      description:
        "Active background scrub constantly reads and validates stored blocks against original cryptographic digests, discarding flipped bits.",
    },
    {
      icon: Server,
      title: "Stateless Ingress Architecture",
      description:
        "Ingress gateways terminate S3/gRPC requests and perform Reed-Solomon polynomial math without requiring centralized state stores.",
    },
    {
      icon: Lock,
      title: "At-Rest Enclave & Mutual TLS Encryption",
      description:
        "Full hardware AES-256-GCM block encryption with ephemeral mTLS certificate mesh for all node-to-node shard sync pipelines.",
    },
    {
      icon: HardDrive,
      title: "High Performance NVMe & Multi-Tier Disks",
      description:
        "Engineered for mixed hardware topologies: hot NVMe cache tiers with high-density spinning cold storage drives.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F7FA]">
          Engineered for Zero Data Loss
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
          Explore the resilient distributed storage capabilities that power Vault deployments across cloud platforms and on-premise hardware clusters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 hover:border-[#353B45] transition-colors"
            >
              <div className="w-10 h-10 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center text-[#4F7CFF]">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#F5F7FA]">
                {feat.title}
              </h3>
              <p className="text-xs text-[#9AA3AF] leading-relaxed">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-8 rounded-xl bg-[#111418] border border-[#252A31] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-[#F5F7FA]">
            Explore the technical specification
          </h2>
          <p className="text-xs text-[#9AA3AF] mt-1">
            Deep dive into the mathematical matrix behind Vault erasure coding.
          </p>
        </div>
        <Link href="/architecture">
          <Button className="gap-2">
            <span>Read Architecture</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
