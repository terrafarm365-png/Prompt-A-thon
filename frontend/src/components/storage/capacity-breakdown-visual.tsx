"use client";

import React, { useState } from "react";
import { formatBytes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

interface CapacityBreakdownProps {
  totalCapacity: number;
  usedCapacity: number;
}

export function CapacityBreakdownVisual({ totalCapacity, usedCapacity }: CapacityBreakdownProps) {
  // Vault RS(4+2): Logical data is 2/3 of usedCapacity, Parity is 1/3 of usedCapacity
  const logicalBytes = Math.round(usedCapacity * 0.6667);
  const parityBytes = usedCapacity - logicalBytes;
  const availableBytes = Math.max(0, totalCapacity - usedCapacity);

  const logicalPct = ((logicalBytes / totalCapacity) * 100).toFixed(1);
  const parityPct = ((parityBytes / totalCapacity) * 100).toFixed(1);
  const availablePct = ((availableBytes / totalCapacity) * 100).toFixed(1);

  const [activeShard, setActiveShard] = useState<number | null>(null);

  const SHARDS = [
    { id: "D1", name: "Data Shard 1", type: "data", node: "NODE A (us-east-1a)", color: "#4F7CFF" },
    { id: "D2", name: "Data Shard 2", type: "data", node: "NODE B (us-east-1b)", color: "#4F7CFF" },
    { id: "D3", name: "Data Shard 3", type: "data", node: "NODE C (us-east-1c)", color: "#4F7CFF" },
    { id: "D4", name: "Data Shard 4", type: "data", node: "NODE D (us-east-2a)", color: "#4F7CFF" },
    { id: "P1", name: "Parity Shard 1", type: "parity", node: "NODE E (us-east-2b)", color: "#E6B65C" },
    { id: "P2", name: "Parity Shard 2", type: "parity", node: "NODE F (us-east-2c)", color: "#E6B65C" },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#111418] border border-[#252A31] space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252A31] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
            CAPACITY ALLOCATION TELEMETRY
          </span>
          <h3 className="text-base font-bold text-[#F5F7FA]">
            Physical vs Logical Storage Commitment
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#9AA3AF]">TOTAL CAPACITY:</span>
          <span className="text-[#F5F7FA] font-bold">{formatBytes(totalCapacity)}</span>
        </div>
      </div>

      {/* 3-Tier Multi-Segment Capacity Bar */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-[#0C0E11] rounded-full overflow-hidden flex p-0.5 border border-[#252A31]">
          {/* Logical Data */}
          <div
            style={{ width: `${logicalPct}%` }}
            className="h-full bg-[#4F7CFF] rounded-l-full transition-all duration-500 relative group cursor-pointer"
            title={`Logical Payload: ${formatBytes(logicalBytes)} (${logicalPct}%)`}
          />
          {/* Parity Overhead */}
          <div
            style={{ width: `${parityPct}%` }}
            className="h-full bg-[#E6B65C] transition-all duration-500 relative group cursor-pointer"
            title={`RS(4+2) Parity Overhead: ${formatBytes(parityBytes)} (${parityPct}%)`}
          />
          {/* Available Free Space */}
          <div
            style={{ width: `${availablePct}%` }}
            className="h-full bg-[#252A31] rounded-r-full transition-all duration-500 relative group cursor-pointer"
            title={`Free Headroom: ${formatBytes(availableBytes)} (${availablePct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4F7CFF]" />
              <span className="text-[#9AA3AF]">Logical Payload:</span>
            </div>
            <div className="text-right">
              <span className="text-[#F5F7FA] font-bold block">{formatBytes(logicalBytes)}</span>
              <span className="text-[10px] text-[#69717D]">{logicalPct}%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E6B65C]" />
              <span className="text-[#9AA3AF]">RS(4+2) Parity:</span>
            </div>
            <div className="text-right">
              <span className="text-[#E6B65C] font-bold block">{formatBytes(parityBytes)}</span>
              <span className="text-[10px] text-[#69717D]">0.50x ({parityPct}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#69717D]" />
              <span className="text-[#9AA3AF]">Available Free:</span>
            </div>
            <div className="text-right">
              <span className="text-[#35C98B] font-bold block">{formatBytes(availableBytes)}</span>
              <span className="text-[10px] text-[#69717D]">{availablePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reed-Solomon RS(4+2) Visual Shard Striping Matrix */}
      <div className="pt-4 border-t border-[#1E2229] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-[#F5F7FA] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4F7CFF]" />
            REED-SOLOMON RS(4+2) ACTIVE SHARD DISTRIBUTION
          </span>
          <span className="text-[10px] font-mono text-[#69717D]">
            HOVER SHARD TO TRACE TARGET STORAGE NODE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SHARDS.map((s, idx) => (
            <div
              key={s.id}
              onMouseEnter={() => setActiveShard(idx)}
              onMouseLeave={() => setActiveShard(null)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeShard === idx
                  ? s.type === "parity"
                    ? "bg-[#241E15] border-[#E6B65C] shadow-[0_0_12px_rgba(230,182,92,0.3)]"
                    : "bg-[#111A2B] border-[#4F7CFF] shadow-[0_0_12px_rgba(79,124,255,0.3)]"
                  : "bg-[#0C0E11] border-[#252A31] hover:border-[#4F7CFF]/50"
              }`}
            >
              <span
                className={`font-mono text-sm font-bold block ${
                  s.type === "parity" ? "text-[#E6B65C]" : "text-[#5CA9FF]"
                }`}
              >
                {s.id}
              </span>
              <span className="text-[10px] text-[#9AA3AF] uppercase block mt-0.5">
                {s.type}
              </span>
              <span className="text-[9px] font-mono text-[#69717D] block truncate mt-1">
                {s.node.split(" ")[0]} {s.node.split(" ")[1]}
              </span>
            </div>
          ))}
        </div>

        {activeShard !== null && (
          <div className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] font-mono text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-[#F5F7FA] font-bold">
                {SHARDS[activeShard].name} [{SHARDS[activeShard].id}]
              </span>
              <span className="text-[#69717D]">assigned to</span>
              <span className="text-[#4F7CFF] font-semibold">{SHARDS[activeShard].node}</span>
            </div>
            <Badge
              variant={SHARDS[activeShard].type === "parity" ? "warning" : "default"}
              className="text-[10px]"
            >
              ENCRYPTED • AES-256
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
