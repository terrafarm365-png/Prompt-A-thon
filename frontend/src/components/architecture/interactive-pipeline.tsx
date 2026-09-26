"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Cpu,
  Layers,
  Share2,
  Activity,
  RefreshCw,
  Wrench,
  HardDrive,
  ArrowRight,
} from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  description: string;
  shardsState: { label: string; type: "data" | "parity"; status: "active" | "standby" | "reconstructing" | "dim" }[];
  nodesState: { name: string; status: "idle" | "writing" | "reading" | "recovering" }[];
  mathDetail: string;
}

const STEPS: PipelineStep[] = [
  {
    id: "upload",
    name: "01. UPLOAD",
    sub: "Ingress",
    icon: Upload,
    headline: "Client Ingress via S3 API or High-Speed gRPC",
    description: "The object stream arrives at the ingress gateway. The header metadata is registered in the raft quorum and the payload buffer is prepared for mathematical partitioning.",
    shardsState: [
      { label: "RAW", type: "data", status: "active" },
      { label: "STREAM", type: "data", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "idle" },
      { name: "NODE B", status: "idle" },
      { name: "NODE C", status: "idle" },
      { name: "NODE D", status: "idle" },
      { name: "NODE E", status: "idle" },
      { name: "NODE F", status: "idle" },
    ],
    mathDetail: "Buffer: 240 MB chunk stream • TLS 1.3 mTLS authenticated",
  },
  {
    id: "chunk",
    name: "02. CHUNK",
    sub: "Slicing",
    icon: Cpu,
    headline: "Deterministic 4-Way Data Partitioning",
    description: "The raw payload is sliced into 4 equal segments of 60 MB each (D1, D2, D3, D4). Each chunk is assigned a deterministic sequence index and cryptographic salt.",
    shardsState: [
      { label: "D1 (60MB)", type: "data", status: "active" },
      { label: "D2 (60MB)", type: "data", status: "active" },
      { label: "D3 (60MB)", type: "data", status: "active" },
      { label: "D4 (60MB)", type: "data", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "idle" },
      { name: "NODE B", status: "idle" },
      { name: "NODE C", status: "idle" },
      { name: "NODE D", status: "idle" },
      { name: "NODE E", status: "idle" },
      { name: "NODE F", status: "idle" },
    ],
    mathDetail: "Segment size: S = Total / 4 = 60 MB • Endianess preserved",
  },
  {
    id: "erasure-code",
    name: "03. ERASURE CODE",
    sub: "RS(4+2)",
    icon: Layers,
    headline: "Galois Field Matrix Multiplication",
    description: "Using a Vandermonde or Cauchy distribution matrix over GF(2^8), Vault computes 2 independent parity shards (P1, P2) capable of solving for any 2 lost variables.",
    shardsState: [
      { label: "D1", type: "data", status: "dim" },
      { label: "D2", type: "data", status: "dim" },
      { label: "D3", type: "data", status: "dim" },
      { label: "D4", type: "data", status: "dim" },
      { label: "P1 (Parity)", type: "parity", status: "active" },
      { label: "P2 (Parity)", type: "parity", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "idle" },
      { name: "NODE B", status: "idle" },
      { name: "NODE C", status: "idle" },
      { name: "NODE D", status: "idle" },
      { name: "NODE E", status: "idle" },
      { name: "NODE F", status: "idle" },
    ],
    mathDetail: "[P1, P2]^T = G_{2x4} · [D1, D2, D3, D4]^T in Galois Field GF(2^8)",
  },
  {
    id: "distribute",
    name: "04. DISTRIBUTE",
    sub: "Striping",
    icon: Share2,
    headline: "Parallel Zero-Trust Shard Distribution",
    description: "All 6 shards are transmitted simultaneously across the internal mesh network to separate physical hardware nodes located across independent racks and power circuits.",
    shardsState: [
      { label: "D1 → Node A", type: "data", status: "active" },
      { label: "D2 → Node B", type: "data", status: "active" },
      { label: "D3 → Node C", type: "data", status: "active" },
      { label: "D4 → Node D", type: "data", status: "active" },
      { label: "P1 → Node E", type: "parity", status: "active" },
      { label: "P2 → Node F", type: "parity", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "writing" },
      { name: "NODE B", status: "writing" },
      { name: "NODE C", status: "writing" },
      { name: "NODE D", status: "writing" },
      { name: "NODE E", status: "writing" },
      { name: "NODE F", status: "writing" },
    ],
    mathDetail: "Concurrent IOPS: 6 parallel mTLS streams • NVMe commit",
  },
  {
    id: "monitor",
    name: "05. MONITOR",
    sub: "Scrubbing",
    icon: Activity,
    headline: "Continuous Background SHA-256 Scrub",
    description: "Storage daemons constantly re-verify the cryptographic checksums of stored shards at rest. Bit rot or cosmic ray silent degradation is spotted before read impact.",
    shardsState: [
      { label: "D1: OK", type: "data", status: "active" },
      { label: "D2: OK", type: "data", status: "active" },
      { label: "D3: OK", type: "data", status: "active" },
      { label: "D4: OK", type: "data", status: "active" },
      { label: "P1: OK", type: "parity", status: "active" },
      { label: "P2: OK", type: "parity", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "reading" },
      { name: "NODE B", status: "reading" },
      { name: "NODE C", status: "reading" },
      { name: "NODE D", status: "reading" },
      { name: "NODE E", status: "reading" },
      { name: "NODE F", status: "reading" },
    ],
    mathDetail: "Checksum frequency: Every 6 hours • Zero client read degradation",
  },
  {
    id: "recover",
    name: "06. RECOVER",
    sub: "Tolerate",
    icon: RefreshCw,
    headline: "Zero-Downtime Read Reconstruction",
    description: "Even if 2 nodes are completely missing or powered off, client reads proceed at full throughput. The gateway reconstructs the original object from any surviving 4 shards.",
    shardsState: [
      { label: "D1: ONLINE", type: "data", status: "active" },
      { label: "D2: LOST", type: "data", status: "dim" },
      { label: "D3: ONLINE", type: "data", status: "active" },
      { label: "D4: LOST", type: "data", status: "dim" },
      { label: "P1: ONLINE", type: "parity", status: "active" },
      { label: "P2: ONLINE", type: "parity", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "reading" },
      { name: "NODE B", status: "idle" },
      { name: "NODE C", status: "reading" },
      { name: "NODE D", status: "idle" },
      { name: "NODE E", status: "reading" },
      { name: "NODE F", status: "reading" },
    ],
    mathDetail: "Matrix Inversion: [D1, D3, P1, P2] -> Inverse Matrix -> Original Payload",
  },
  {
    id: "repair",
    name: "07. REPAIR",
    sub: "Healing",
    icon: Wrench,
    headline: "Autonomous Shard Synthesis to Standby Nodes",
    description: "The cluster detects diminished redundancy and assigns a background reconstruction job to synthesize missing shards and write them to healthy spare nodes.",
    shardsState: [
      { label: "D1", type: "data", status: "active" },
      { label: "D2 (Rebuilt)", type: "data", status: "reconstructing" },
      { label: "D3", type: "data", status: "active" },
      { label: "D4 (Rebuilt)", type: "data", status: "reconstructing" },
      { label: "P1", type: "parity", status: "active" },
      { label: "P2", type: "parity", status: "active" },
    ],
    nodesState: [
      { name: "NODE A", status: "reading" },
      { name: "NODE G (SPARE)", status: "writing" },
      { name: "NODE C", status: "reading" },
      { name: "NODE H (SPARE)", status: "writing" },
      { name: "NODE E", status: "reading" },
      { name: "NODE F", status: "reading" },
    ],
    mathDetail: "Bandwidth-throttled peer-to-peer healing • Full 6/6 restored",
  },
];

export function InteractivePipeline() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="rounded-2xl border border-[#252A31] bg-[#111418] p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* 7-Step Navigation Pill Header */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 border-b border-[#252A31]">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isCurrent = currentStep === idx;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`px-3 py-2 rounded-xl text-left font-mono transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isCurrent
                  ? "bg-[#171A1F] border border-[#4F7CFF] text-[#F5F7FA] shadow-[0_0_12px_rgba(79,124,255,0.25)]"
                  : "bg-transparent border border-transparent text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#14171D]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-[#4F7CFF]" : "text-[#69717D]"}`} />
              <div className="text-left">
                <span className="block text-[11px] font-bold">{s.name}</span>
                <span className="block text-[9px] text-[#69717D]">{s.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Diagram Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-[#0C0E11] border border-[#252A31] space-y-6">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#69717D]">TOPOLOGY SIMULATION</span>
              <span className="text-[#4F7CFF]">PHASE: {step.name}</span>
            </div>

            {/* Shard State Blocks */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#9AA3AF] uppercase tracking-wider block">
                Object Shard Allocation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                {step.shardsState.map((sh, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border text-center transition-all ${
                      sh.status === "active"
                        ? sh.type === "parity"
                          ? "bg-[#241E15] border-[#E6B65C] text-[#E6B65C]"
                          : "bg-[#111A2B] border-[#4F7CFF] text-[#5CA9FF]"
                        : sh.status === "reconstructing"
                        ? "bg-[#1A261E] border-[#35C98B] text-[#35C98B] animate-pulse"
                        : "bg-[#171A1F] border-[#252A31] text-[#69717D] opacity-40"
                    }`}
                  >
                    <span className="block font-bold">{sh.label}</span>
                    <span className="text-[9px] uppercase tracking-wider">{sh.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Nodes Fleet State */}
            <div className="space-y-2 pt-2 border-t border-[#1E2229]">
              <span className="text-[10px] font-mono text-[#9AA3AF] uppercase tracking-wider block">
                Storage Node Mesh Activity
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-[11px]">
                {step.nodesState.map((node, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-center ${
                      node.status === "writing"
                        ? "bg-[#111A2B] border-[#4F7CFF] text-[#4F7CFF]"
                        : node.status === "reading"
                        ? "bg-[#1A261E] border-[#35C98B] text-[#35C98B]"
                        : node.status === "recovering"
                        ? "bg-[#241E15] border-[#E6B65C] text-[#E6B65C]"
                        : "bg-[#14171D] border-[#252A31] text-[#69717D]"
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 mx-auto mb-1 opacity-75" />
                    <span className="block font-semibold text-[10px]">{node.name}</span>
                    <span className="text-[8px] uppercase">{node.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#14171D] border border-[#252A31] font-mono text-xs text-[#5CA9FF]">
            {step.mathDetail}
          </div>
        </div>

        {/* Right: Technical Explanation */}
        <div className="lg:col-span-5 space-y-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#171A1F] border border-[#4F7CFF]/40 flex items-center justify-center text-[#4F7CFF]">
            <StepIcon className="w-5 h-5" />
          </div>

          <Badge variant="default" className="font-mono text-xs">
            STAGE {currentStep + 1} OF 7
          </Badge>

          <h3 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            {step.headline}
          </h3>

          <p className="text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
            {step.description}
          </p>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded bg-[#171A1F] hover:bg-[#252A31] border border-[#252A31] text-xs font-mono text-[#F5F7FA] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous Stage
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              disabled={currentStep === STEPS.length - 1}
              className="px-3 py-1.5 rounded bg-[#4F7CFF] hover:bg-[#3E6AE1] text-xs font-mono text-white disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
