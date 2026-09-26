"use client";

import React, { useState } from "react";
import { Terminal, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ShardVisualization() {
  const [offlineNodes, setOfflineNodes] = useState<Set<number>>(new Set());

  const toggleNodeFailure = (index: number) => {
    const next = new Set(offlineNodes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      if (next.size >= 2) {
        // Clear if already at max tolerance to demonstrate recovery
        next.clear();
      }
      next.add(index);
    }
    setOfflineNodes(next);
  };

  const simulateRandomFailure = () => {
    // Fail 2 nodes (e.g. Node 2 and Node 5)
    if (offlineNodes.size > 0) {
      setOfflineNodes(new Set());
    } else {
      setOfflineNodes(new Set([1, 4]));
    }
  };

  const nodes = [
    { name: "Node A", region: "us-east-1a", shard: "Shard D1", size: "50 MB", isParity: false },
    { name: "Node B", region: "us-east-1b", shard: "Shard D2", size: "50 MB", isParity: false },
    { name: "Node C", region: "us-central-1", shard: "Shard D3", size: "50 MB", isParity: false },
    { name: "Node D", region: "us-west-2a", shard: "Shard D4", size: "50 MB", isParity: false },
    { name: "Node E", region: "eu-west-1a", shard: "Parity P1", size: "50 MB", isParity: true },
    { name: "Node F", region: "ap-southeast-1", shard: "Parity P2", size: "50 MB", isParity: true },
  ];

  const survivingCount = 6 - offlineNodes.size;
  const canReconstruct = survivingCount >= 4;

  return (
    <div className="w-full rounded-lg bg-[#111418] border border-[#252A31] p-6 md:p-8 flex flex-col items-center">
      {/* Controls Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-[#1E2229] gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={canReconstruct ? "success" : "error"} dot>
            {canReconstruct
              ? `Quorum Intact (${survivingCount}/6 Nodes Active)`
              : "Quorum Breached (<4 Shards)"}
          </Badge>
          <span className="text-xs text-[#9AA3AF]">
            Reed-Solomon RS(4+2) Tolerates 2 Simultaneous Node Failures
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={simulateRandomFailure}
          className="gap-1.5 border-[#252A31] hover:border-[#4F7CFF]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            {offlineNodes.size > 0 ? "Restore All Nodes" : "Simulate 2-Node Outage"}
          </span>
        </Button>
      </div>

      {/* Ingress Tier */}
      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="w-full py-2.5 px-4 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-between font-mono text-xs">
          <span className="flex items-center gap-2 text-[#F5F7FA] font-medium">
            <Terminal className="w-4 h-4 text-[#4F7CFF]" />
            Client Ingress (S3 / gRPC / CLI)
          </span>
          <span className="text-[#35C98B] text-[10px] bg-[#1E2023] px-1.5 py-0.5 rounded border border-[#252A31]">
            200 MB Payload
          </span>
        </div>
        <div className="h-6 w-px bg-[#252A31] my-1" />
      </div>

      {/* Gateway Sharding Tier */}
      <div className="w-full max-w-lg mt-1 p-3.5 rounded bg-[#171A1F] border border-[#4F7CFF]/40 flex flex-col items-center text-center shadow-lg">
        <div className="flex items-center gap-2 font-mono text-xs text-[#4F7CFF] font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Vault Ingress & Sharding Gateway</span>
        </div>
        <div className="text-[11px] font-mono text-[#9AA3AF] mt-1">
          TLS 1.3 Termination • Reed-Solomon RS(4+2) Matrix Chunk Engine
        </div>
      </div>

      {/* Connector line */}
      <div className="w-full max-w-4xl flex items-center justify-center my-4 relative">
        <div className="w-11/12 h-px bg-[#252A31] hidden md:block" />
      </div>

      {/* 6 Storage Node Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {nodes.map((node, index) => {
          const isFailed = offlineNodes.has(index);

          return (
            <div
              key={node.name}
              onClick={() => toggleNodeFailure(index)}
              className={`p-3 rounded border font-mono transition-all cursor-pointer select-none ${
                isFailed
                  ? "bg-[#E05D6F]/10 border-[#E05D6F]/40 opacity-75"
                  : node.isParity
                  ? "bg-[#171A1F] border-[#E6B65C]/40 hover:border-[#E6B65C]"
                  : "bg-[#171A1F] border-[#252A31] hover:border-[#4F7CFF]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#F5F7FA] text-xs font-semibold">
                  {node.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFailed
                      ? "bg-[#E05D6F]"
                      : node.isParity
                      ? "bg-[#E6B65C]"
                      : "bg-[#35C98B]"
                  }`}
                />
              </div>

              <div className="text-[10px] text-[#69717D] mt-0.5">
                {node.region}
              </div>

              <div
                className={`mt-2.5 text-[11px] font-medium px-2 py-1 rounded border flex items-center justify-between ${
                  isFailed
                    ? "bg-[#E05D6F]/20 text-[#E05D6F] border-[#E05D6F]/30"
                    : node.isParity
                    ? "bg-[#1E2023] text-[#E6B65C] border-[#252A31]"
                    : "bg-[#1E2023] text-[#4F7CFF] border-[#252A31]"
                }`}
              >
                <span>{isFailed ? "Offline" : node.shard}</span>
                <span className="text-[#9AA3AF] text-[10px]">{node.size}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recovery explanation feedback */}
      <div className="w-full mt-6 p-3 rounded bg-[#0C0E11] border border-[#252A31] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {canReconstruct ? (
            <CheckCircle className="w-4 h-4 text-[#35C98B]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#E05D6F]" />
          )}
          <span className="text-[#F5F7FA]">
            {canReconstruct
              ? "Reconstruction Status: 100% Deterministic Read Recovery from any 4 shards"
              : "Reconstruction Status: Insufficient shards (<4) for parity inversion"}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#69717D] hidden sm:inline">
          Click any node above to toggle offline state
        </span>
      </div>
    </div>
  );
}
