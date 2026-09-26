import React from "react";
import { ShardVisualization } from "@/components/architecture/shard-visualization";
import { InteractivePipeline } from "@/components/architecture/interactive-pipeline";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How Vault Works",
  description: "Step-by-step explanation of Reed-Solomon erasure coding and recovery in Vault.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Client Ingress & Hash Generation",
      description:
        "The client streams an object payload via S3 or gRPC. Vault computes a SHA-256 cryptographic digest over the entire payload before chunking begins.",
    },
    {
      step: "02",
      title: "Reed-Solomon RS(4+2) Partitioning",
      description:
        "The object is sliced into 4 equal data chunks (D1, D2, D3, D4). The gateway evaluates Galois field polynomials GF(2^8) to generate 2 parity chunks (P1, P2).",
    },
    {
      step: "03",
      title: "Distributed Striping Across Nodes",
      description:
        "The 6 resulting shards are transmitted concurrently over mTLS to 6 independent storage hardware nodes situated across distinct fault domains.",
    },
    {
      step: "04",
      title: "Deterministic Read Recovery",
      description:
        "When an object is requested, Vault initiates parallel reads to all 6 nodes. As soon as ANY 4 shards return, the original object is reconstructed instantaneously.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
          TECHNICAL OVERVIEW
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F7FA]">
          How Vault Works Under the Hood
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
          From client upload to Galois field matrix transformation and autonomous repair.
        </p>
      </div>

      {/* 4 Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item) => (
          <div
            key={item.step}
            className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 relative"
          >
            <span className="text-2xl font-bold font-mono text-[#4F7CFF]">
              {item.step}
            </span>
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              {item.title}
            </h3>
            <p className="text-xs text-[#9AA3AF] leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* 7-Stage Interactive Pipeline */}
      <InteractivePipeline />

      {/* Interactive Topology Simulator */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#F5F7FA]">
            Interactive Failure Simulator
          </h2>
          <p className="text-xs text-[#9AA3AF]">
            Test concurrent node failures and observe how Vault retains full data durability.
          </p>
        </div>

        <ShardVisualization />
      </div>

      <div className="p-8 rounded-xl bg-[#111418] border border-[#252A31] text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#F5F7FA]">
          Ready to verify the architecture specification?
        </h2>
        <p className="text-xs text-[#9AA3AF] max-w-xl mx-auto">
          Review our formal mathematical proofs and network transport benchmarking data.
        </p>
        <Link href="/architecture">
          <Button className="gap-2">
            <span>Read Architecture Specs</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
