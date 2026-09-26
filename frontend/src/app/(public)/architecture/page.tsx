import React from "react";
import { ShardVisualization } from "@/components/architecture/shard-visualization";
import { InteractiveSystemMap } from "@/components/architecture/interactive-system-map";
import {
  Server,
  Layers,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "Architecture",
  description: "Technical architecture and system specification for Vault distributed storage.",
};

export default function ArchitecturePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-mono text-[#35C98B] uppercase tracking-wider font-semibold">
          TECHNICAL SPECIFICATION
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F7FA]">
          Vault System Architecture
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
          Comprehensive blueprint for stateless ingress gateways, Reed-Solomon polynomial engines, and decentralized node daemons.
        </p>
      </div>

      {/* Dynamic Infrastructure Topology Map */}
      <InteractiveSystemMap />

      {/* Shard Visualization */}
      <ShardVisualization />

      {/* Architectural Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <Terminal className="w-5 h-5 text-[#4F7CFF]" />
          <h3 className="text-base font-semibold text-[#F5F7FA]">
            Tier 1: Stateless Ingress
          </h3>
          <p className="text-xs text-[#9AA3AF] leading-relaxed">
            Scales horizontally behind L4 load balancers. Receives S3 PUT/GET or gRPC streams, terminates TLS 1.3, and computes Galois field matrices in SIMD registers.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <Layers className="w-5 h-5 text-[#35C98B]" />
          <h3 className="text-base font-semibold text-[#F5F7FA]">
            Tier 2: Shard Distribution
          </h3>
          <p className="text-xs text-[#9AA3AF] leading-relaxed">
            Applies consistent hashing and deterministic topology rings to dispatch 4 data shards + 2 parity shards to separate power racks and availability regions.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <Server className="w-5 h-5 text-[#E6B65C]" />
          <h3 className="text-base font-semibold text-[#F5F7FA]">
            Tier 3: Storage Daemons
          </h3>
          <p className="text-xs text-[#9AA3AF] leading-relaxed">
            Lightweight, low-latency Go/Rust daemons binding directly to local NVMe or high-capacity SATA drives via raw Linux io_uring kernel primitives.
          </p>
        </div>
      </div>

      {/* Formal Math Specs */}
      <div className="p-8 rounded-xl bg-[#111418] border border-[#252A31] space-y-4">
        <h2 className="text-xl font-bold text-[#F5F7FA]">
          Erasure Coding Polynomial Formulation
        </h2>
        <p className="text-xs text-[#9AA3AF] leading-relaxed">
          Vault implements Vandermonde / Cauchy Reed-Solomon matrices over Galois Field GF(2^8). For any object payload partitioned into k = 4 data blocks:
        </p>

        <div className="p-4 rounded bg-[#0C0E11] border border-[#252A31] font-mono text-xs text-[#35C98B] space-y-2 overflow-x-auto">
          <div>P_1 = α^0 * D_1 ⊕ α^1 * D_2 ⊕ α^2 * D_3 ⊕ α^3 * D_4</div>
          <div>P_2 = β^0 * D_1 ⊕ β^1 * D_2 ⊕ β^2 * D_3 ⊕ β^3 * D_4</div>
          <div className="text-[#69717D] pt-1">
            {"// Where α, β are generator elements in GF(2^8) and ⊕ denotes bitwise XOR."}
          </div>
        </div>

        <p className="text-xs text-[#9AA3AF] leading-relaxed">
          Because any 4 of the 6 total equations form a linearly independent system, matrix inversion reconstructs the exact original data whenever at least 4 shards are reachable.
        </p>
      </div>
    </div>
  );
}
