"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Cpu,
  Share2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  LayoutDashboard,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Ingestion & Streaming",
    icon: Upload,
    headline: "Data enters the Vault mesh",
    description: "Objects streamed via S3 API or high-throughput gRPC arrive at edge proxy gateways with zero buffering bottlenecks.",
    telemetry: "STREAM: 10 Gbps • TCP/mTLS",
  },
  {
    step: "02",
    title: "Polynomial Chunking",
    icon: Cpu,
    headline: "Reed-Solomon RS(4+2) Striping",
    description: "The sharding engine computes Cauchy distribution matrices, partitioning bytes into 4 data shards and computing 2 independent parity shards.",
    telemetry: "GALOIS FIELD: GF(2^8) • 1.50x OVERHEAD",
  },
  {
    step: "03",
    title: "Distributed Placement",
    icon: Share2,
    headline: "Isolated Failure Domains",
    description: "Each shard is dispatched simultaneously across isolated server racks and regional availability zones to prevent co-located hardware vulnerability.",
    telemetry: "TOPOLOGY: 6 HARDWARE NODES DISPATCHED",
  },
  {
    step: "04",
    title: "Failure Detection",
    icon: AlertTriangle,
    headline: "Zero Impact on Quorum",
    description: "Should physical drives burn out or entire storage nodes power down, client read requests are seamlessly reconstructed on-the-fly.",
    telemetry: "TOLERANCE: 2 SIMULTANEOUS LOSSES",
  },
  {
    step: "05",
    title: "Autonomous Recovery",
    icon: RefreshCw,
    headline: "Self-Healing Shard Synthesis",
    description: "Surviving peer nodes synthesize missing blocks in the background and commit them to hot-spare nodes without operator intervention.",
    telemetry: "SPEED: 1.2 GB/S AUTO-RECONSTRUCTION",
  },
  {
    step: "06",
    title: "Cryptographic Scrub",
    icon: ShieldCheck,
    headline: "End-to-End SHA-256 Assurance",
    description: "Continuous background scrubs inspect physical media against cryptographic checksums, eliminating silent bit rot forever.",
    telemetry: "DURABILITY: 99.999999999% (11 9s)",
  },
];

export function ScrollJourney() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
          THE DISTRIBUTED LIFECYCLE
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
          The Journey of an Object in Vault
        </h2>
        <p className="text-xs sm:text-sm text-[#9AA3AF]">
          How bytes transition from raw user payload to an invincible, self-repairing distributed constellation.
        </p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {JOURNEY_STEPS.map((s, index) => {
          const Icon = s.icon;
          const isActive = activeStep === index;

          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(index)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#171A1F] border-[#4F7CFF] shadow-[0_0_15px_rgba(79,124,255,0.2)]"
                  : "bg-[#111418] border-[#252A31] hover:border-[#4F7CFF]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#69717D]">{s.step}</span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4F7CFF]" : "text-[#9AA3AF]"}`} />
              </div>
              <span className={`block text-xs font-semibold ${isActive ? "text-[#F5F7FA]" : "text-[#9AA3AF]"}`}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Feature Display */}
      {(() => {
        const current = JOURNEY_STEPS[activeStep];
        const Icon = current.icon;

        return (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111418] border border-[#252A31] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono text-[10px]">
                  STEP {current.step}
                </Badge>
                <span className="font-mono text-xs text-[#35C98B] flex items-center gap-1">
                  <Check className="w-3 h-3" /> VERIFIED PROTOCOL
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
                {current.headline}
              </h3>

              <p className="text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
                {current.description}
              </p>

              <div className="p-2.5 rounded bg-[#0C0E11] border border-[#252A31] font-mono text-xs text-[#5CA9FF]">
                {current.telemetry}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#0C0E11] border border-[#252A31] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#171A1F] border border-[#4F7CFF]/40 flex items-center justify-center text-[#4F7CFF] shadow-[0_0_20px_rgba(79,124,255,0.25)]">
                <Icon className="w-7 h-7" />
              </div>
              <span className="font-mono text-xs text-[#F5F7FA] font-bold">
                {current.title}
              </span>
              <span className="text-[11px] text-[#69717D]">
                Step {activeStep + 1} of 6 in Vault Engine
              </span>
            </div>
          </div>
        );
      })()}

      <div className="text-center pt-2">
        <Link href="/dashboard">
          <Button variant="secondary" className="gap-2 border-[#252A31] hover:border-[#4F7CFF]/50 text-xs">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#4F7CFF]" />
            <span>Launch Operator Telemetry Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
