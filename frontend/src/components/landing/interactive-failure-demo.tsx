"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";

interface NodeState {
  id: string;
  name: string;
  region: string;
  shard: string;
  shardType: "data" | "parity";
  isOffline: boolean;
  isReconstructing?: boolean;
}

const INITIAL_NODES: NodeState[] = [
  { id: "node-a", name: "NODE A", region: "us-east-1a", shard: "D1", shardType: "data", isOffline: false },
  { id: "node-b", name: "NODE B", region: "us-east-1b", shard: "D2", shardType: "data", isOffline: false },
  { id: "node-c", name: "NODE C", region: "us-east-1c", shard: "D3", shardType: "data", isOffline: false },
  { id: "node-d", name: "NODE D", region: "us-east-2a", shard: "D4", shardType: "data", isOffline: false },
  { id: "node-e", name: "NODE E", region: "us-east-2b", shard: "P1", shardType: "parity", isOffline: false },
  { id: "node-f", name: "NODE F", region: "us-east-2c", shard: "P2", shardType: "parity", isOffline: false },
];

export function InteractiveFailureDemo() {
  const [nodes, setNodes] = useState<NodeState[]>(INITIAL_NODES);
  const [phase, setPhase] = useState<"healthy" | "failed" | "reconstructing" | "repaired">("healthy");
  const [repairProgress, setRepairProgress] = useState(0);
  const [activeStepText, setActiveStepText] = useState("All 6 hardware storage nodes responding normally.");
  const [spareNode, setSpareNode] = useState<string | null>(null);

  const runFailureSimulation = () => {
    // 1. Trigger failure of Node C
    setPhase("failed");
    setNodes((prev) =>
      prev.map((n) => (n.id === "node-c" ? { ...n, isOffline: true } : n))
    );
    setActiveStepText("Hardware failure detected on NODE C. Shard D3 unavailable! 5 surviving shards (3 Data + 2 Parity) illuminated.");
    setRepairProgress(0);
    setSpareNode(null);

    // 2. Automatically advance to Reconstruction after 2.5s
    setTimeout(() => {
      setPhase("reconstructing");
      setActiveStepText("Autonomous Repair Engine active: Synthesizing missing D3 from surviving shards via Reed-Solomon Galois Field GF(2^8) matrix inversion.");
      
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setRepairProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          // 3. Complete repair to spare Node G
          setTimeout(() => {
            setPhase("repaired");
            setSpareNode("NODE G (us-east-hotspare)");
            setActiveStepText("Reconstruction complete! Synthesized D3 shard committed to NODE G. Cluster restored to full 6/6 durability.");
          }, 600);
        }
      }, 350);
    }, 2500);
  };

  const handleReset = () => {
    setNodes(INITIAL_NODES);
    setPhase("healthy");
    setRepairProgress(0);
    setSpareNode(null);
    setActiveStepText("All 6 hardware storage nodes responding normally.");
  };

  return (
    <div className="rounded-2xl border border-[#252A31] bg-[#111418] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background glow when active */}
      <div
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          phase === "failed"
            ? "bg-[#E05D6F]/10 opacity-100"
            : phase === "reconstructing"
            ? "bg-[#E6B65C]/10 opacity-100"
            : phase === "repaired"
            ? "bg-[#35C98B]/10 opacity-100"
            : "bg-[#4F7CFF]/5 opacity-50"
        }`}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4F7CFF] font-semibold">
              FAULT TOLERANCE IN ACTION
            </span>
            <Badge
              variant={
                phase === "healthy"
                  ? "success"
                  : phase === "failed"
                  ? "error"
                  : phase === "reconstructing"
                  ? "warning"
                  : "success"
              }
              dot
              className="text-[10px]"
            >
              {phase === "healthy" && "CLUSTER HEALTHY"}
              {phase === "failed" && "NODE C OFFLINE — DEGRADED"}
              {phase === "reconstructing" && "AUTONOMOUS RECONSTRUCTION"}
              {phase === "repaired" && "RESTORED — SYSTEM HEALTHY"}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            Built to survive failure.
          </h2>
          <p className="text-xs text-[#9AA3AF] mt-1 max-w-xl">
            Watch how Vault’s Reed-Solomon RS(4+2) engine tolerates total node destruction without data loss or downtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {phase === "healthy" ? (
            <Button
              onClick={runFailureSimulation}
              className="gap-2 bg-[#E05D6F] hover:bg-[#C94A5B] text-white border-0 shadow-lg text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Node C Failure</span>
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="secondary"
              className="gap-2 border-[#252A31] hover:border-[#4F7CFF]/50 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Cluster State</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Status Banner */}
      <div className="p-3.5 rounded-lg bg-[#0C0E11] border border-[#252A31] flex items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              phase === "healthy"
                ? "bg-[#35C98B]"
                : phase === "failed"
                ? "bg-[#E05D6F] animate-ping"
                : phase === "reconstructing"
                ? "bg-[#E6B65C] animate-pulse"
                : "bg-[#35C98B]"
            }`}
          />
          <span className="text-[#F5F7FA] text-[11px] sm:text-xs">
            {activeStepText}
          </span>
        </div>

        {phase === "reconstructing" && (
          <div className="w-36 shrink-0 space-y-1">
            <div className="flex justify-between text-[10px] text-[#9AA3AF]">
              <span>SYNTHESIZING</span>
              <span>{repairProgress}%</span>
            </div>
            <Progress value={repairProgress} />
          </div>
        )}
      </div>

      {/* Six Nodes Grid (and spare node if repaired) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {nodes.map((node) => {
          const isFailed = node.isOffline;
          const isSurviving = phase === "failed" && !node.isOffline;

          return (
            <div
              key={node.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 relative ${
                isFailed
                  ? "bg-[#1F1215] border-[#E05D6F] shadow-[0_0_15px_rgba(224,93,111,0.25)]"
                  : isSurviving
                  ? "bg-[#171A1F] border-[#E6B65C] shadow-[0_0_12px_rgba(230,182,92,0.2)]"
                  : "bg-[#14171D] border-[#252A31] hover:border-[#4F7CFF]/50"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#F5F7FA]">
                  {node.name}
                </span>
                {isFailed ? (
                  <span className="font-mono text-[10px] text-[#E05D6F] font-bold">
                    OFFLINE
                  </span>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35C98B]" />
                )}
              </div>

              {/* Shard Block */}
              <div
                className={`py-2 px-2.5 rounded font-mono text-xs flex items-center justify-between border ${
                  isFailed
                    ? "bg-[#291418] border-[#E05D6F]/40 text-[#E05D6F] line-through"
                    : node.shardType === "parity"
                    ? "bg-[#241E15] border-[#E6B65C]/40 text-[#E6B65C]"
                    : "bg-[#111A2B] border-[#4F7CFF]/40 text-[#5CA9FF]"
                }`}
              >
                <span className="font-bold">{node.shard}</span>
                <span className="text-[10px] uppercase">
                  {isFailed ? "LOST" : node.shardType}
                </span>
              </div>

              {/* Region */}
              <div className="mt-2.5 text-[10px] font-mono text-[#69717D] flex justify-between">
                <span>{node.region}</span>
                <span>{isFailed ? "0 MB/s" : "4.8 Gbps"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spare Node Placement Banner if Repaired */}
      {spareNode && (
        <div className="p-4 rounded-xl bg-[#0D1814] border border-[#35C98B]/50 flex items-center justify-between flex-wrap gap-4 font-mono text-xs text-[#F5F7FA] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#11241C] border border-[#35C98B] flex items-center justify-center text-[#35C98B]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#35C98B] font-bold block">
                SUCCESSFUL FAILOVER TARGET: {spareNode}
              </span>
              <span className="text-[11px] text-[#9AA3AF]">
                Synthesized Shard D3 (33.3 MB) safely committed • Zero downtime witnessed by clients
              </span>
            </div>
          </div>

          <Badge variant="success" className="font-mono text-xs">
            100% HEALTHY
          </Badge>
        </div>
      )}

      {/* Telemetry Footnote */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-[#69717D]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#4F7CFF]" />
          <span>Matrix: RS(4+2) Galois Field GF(2^8)</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#35C98B]" />
          <span>Reconstruction Speed: 1.2 GB/sec</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E6B65C]" />
          <span>Survives: Up to 2 concurrent node failures</span>
        </div>
      </div>
    </div>
  );
}
