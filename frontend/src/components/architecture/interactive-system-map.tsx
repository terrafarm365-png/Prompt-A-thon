"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Layers,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Database,
  Terminal,
  Activity,
  ArrowDown,
  Info,
  Network,
} from "lucide-react";

interface ComponentNode {
  id: string;
  title: string;
  category: "core" | "satellite";
  protocol: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  telemetry: string;
}

const SYSTEM_NODES: ComponentNode[] = [
  {
    id: "client",
    title: "Client Application",
    category: "core",
    protocol: "S3 API / REST / gRPC",
    icon: Terminal,
    description: "SDK client or external microservice performing standard AWS S3 PutObject or GetObject operations with authentication tokens.",
    telemetry: "Ingress bandwidth: Up to 40 Gbps aggregate",
  },
  {
    id: "gateway",
    title: "API Gateway & Router",
    category: "core",
    protocol: "Envoy / mTLS Proxy",
    icon: Network,
    description: "Terminates external TLS, performs rate limiting, IAM authorization, and routes object requests to the appropriate cluster bucket namespace.",
    telemetry: "Latency: < 0.8ms p99 overhead",
  },
  {
    id: "metadata",
    title: "Metadata Service Ring",
    category: "core",
    protocol: "Raft Consensus (3-node)",
    icon: Database,
    description: "Distributes inode mappings, chunk identifiers, and deterministic node allocations using a zero-contention distributed Raft log.",
    telemetry: "Quorum: 3/3 synchronized • Commit latency 1.2ms",
  },
  {
    id: "storage-engine",
    title: "Storage Execution Engine",
    category: "core",
    protocol: "Internal Zero-Copy Buffer",
    icon: Cpu,
    description: "Manages streaming memory buffers, coordinates chunk serialization, and schedules parallel disk I/O operations.",
    telemetry: "Zero-copy streaming • Kernel bypass DMA",
  },
  {
    id: "erasure-coding",
    title: "Erasure Coding Unit",
    category: "core",
    protocol: "RS(4+2) Galois Field GF(2^8)",
    icon: Layers,
    description: "Applies Cauchy distribution matrix transformation to produce 4 data shards and 2 parity shards with AVX-512 SIMD hardware acceleration.",
    telemetry: "Throughput: 8.4 GB/sec per core",
  },
  {
    id: "node-cluster",
    title: "6-Node Storage Cluster",
    category: "core",
    protocol: "Direct NVMe Block Media",
    icon: Server,
    description: "Physical hardware storage node fleet across 3 availability zones and isolated power/network failure domains.",
    telemetry: "Total Raw: 120 TB • Usable: 80 TB",
  },
];

const SATELLITE_SERVICES: ComponentNode[] = [
  {
    id: "health-monitor",
    title: "Health Monitor",
    category: "satellite",
    protocol: "Gossip Protocol (500ms)",
    icon: Activity,
    description: "Probes heartbeats across all nodes. Detects dropped connections within 1500ms and issues topology degradation alerts.",
    telemetry: "Heartbeat: 2 Hz • SLA verification",
  },
  {
    id: "repair-manager",
    title: "Repair Manager",
    category: "satellite",
    protocol: "Autonomous Peer Synthesis",
    icon: RefreshCw,
    description: "Orchestrates background reconstruction when a shard is lost. Pulls 4 surviving shards, solves linear equations, and commits to spare nodes.",
    telemetry: "Heal bandwidth: 1.2 GB/sec throttled",
  },
  {
    id: "integrity-checker",
    title: "Integrity Checker",
    category: "satellite",
    protocol: "SHA-256 Background Scrub",
    icon: ShieldCheck,
    description: "Continuously traverses all stored shards at rest. Detects hardware bit rot, silent sector corruption, and triggers immediate replacement.",
    telemetry: "Scrub cycle: 100% inspected every 7 days",
  },
  {
    id: "rebalancer",
    title: "Rebalancer Engine",
    category: "satellite",
    protocol: "Consistent Hashing Ring",
    icon: Cpu,
    description: "Dynamically migrates shards when new storage nodes are provisioned, preventing hotspots and maintaining balanced disk usage.",
    telemetry: "Max variance: < 4% disk utilization skew",
  },
];

export function InteractiveSystemMap() {
  const [selectedNode, setSelectedNode] = useState<ComponentNode>(SYSTEM_NODES[4]);

  return (
    <div className="rounded-2xl border border-[#252A31] bg-[#111418] p-6 sm:p-8 space-y-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-6">
        <div>
          <span className="text-[11px] font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
            DYNAMIC TOPOLOGY GRAPH
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            Vault Infrastructure Architecture Map
          </h2>
          <p className="text-xs text-[#9AA3AF] mt-1">
            Click any component or daemon to inspect its network protocol, throughput telemetry, and internal role.
          </p>
        </div>

        <Badge variant="default" className="font-mono text-xs self-start sm:self-auto">
          INTERACTIVE TELEMETRY
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Vertical Pipeline + Surrounding Satellites (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Vertical Data Highway */}
          <div className="p-6 rounded-xl bg-[#0C0E11] border border-[#252A31] relative">
            <span className="text-[10px] font-mono text-[#69717D] uppercase tracking-wider block mb-4">
              PRIMARY DATA HIGHWAY (INGRESS → STRIPING)
            </span>

            <div className="space-y-3 relative">
              {SYSTEM_NODES.map((node, index) => {
                const Icon = node.icon;
                const isSelected = selectedNode.id === node.id;

                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-[#171A1F] border-[#4F7CFF] shadow-[0_0_15px_rgba(79,124,255,0.25)]"
                          : "bg-[#14171D] border-[#252A31] hover:border-[#4F7CFF]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#4F7CFF] text-white"
                              : "bg-[#1E2023] text-[#9AA3AF] group-hover:text-[#4F7CFF]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-[#F5F7FA] block">
                            {node.title}
                          </span>
                          <span className="font-mono text-[10px] text-[#69717D]">
                            {node.protocol}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={isSelected ? "default" : "secondary"}
                        className="font-mono text-[9px]"
                      >
                        STAGE 0{index + 1}
                      </Badge>
                    </div>

                    {index < SYSTEM_NODES.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="w-3.5 h-3.5 text-[#4F7CFF] animate-bounce" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Surrounding Autonomous Satellite Daemons */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#69717D] uppercase tracking-wider block">
              AUTONOMOUS CLUSTER SATELLITE DAEMONS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SATELLITE_SERVICES.map((sat) => {
                const Icon = sat.icon;
                const isSelected = selectedNode.id === sat.id;

                return (
                  <div
                    key={sat.id}
                    onClick={() => setSelectedNode(sat)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 group ${
                      isSelected
                        ? "bg-[#171A1F] border-[#35C98B] shadow-[0_0_15px_rgba(53,201,139,0.25)]"
                        : "bg-[#14171D] border-[#252A31] hover:border-[#35C98B]/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#35C98B] text-black"
                          : "bg-[#1E2023] text-[#9AA3AF] group-hover:text-[#35C98B]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-[#F5F7FA] block">
                        {sat.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#69717D]">
                        {sat.protocol}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Component Detail Panel (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-[#0C0E11] border border-[#252A31] space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2229]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#4F7CFF]" />
              <span className="font-mono text-xs text-[#69717D] uppercase">
                DIAGNOSTIC TELEMETRY
              </span>
            </div>
            <Badge
              variant={selectedNode.category === "core" ? "default" : "success"}
              className="font-mono text-[9px]"
            >
              {selectedNode.category.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#F5F7FA]">
              {selectedNode.title}
            </h3>
            <span className="font-mono text-xs text-[#4F7CFF] block">
              Protocol: {selectedNode.protocol}
            </span>
          </div>

          <p className="text-xs text-[#9AA3AF] leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="p-3 rounded-lg bg-[#14171D] border border-[#252A31] font-mono text-[11px] text-[#35C98B] space-y-1">
            <span className="text-[10px] text-[#69717D] block uppercase">
              Operational Performance
            </span>
            <span>{selectedNode.telemetry}</span>
          </div>

          <div className="pt-2 text-[10px] font-mono text-[#69717D] flex items-center justify-between border-t border-[#1E2229]">
            <span>FAULT ISOLATION</span>
            <span className="text-[#35C98B]">PROTECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
