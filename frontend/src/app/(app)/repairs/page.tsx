"use client";

import React, { useState } from "react";
import { mockRepairs } from "@/lib/mock-data/repairs";
import { RepairTable } from "@/components/repairs/repair-table";
import { ShardReconstructionVisual } from "@/components/repairs/shard-reconstruction-visual";
import { Wrench, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function RepairsPage() {
  const [repairs] = useState(mockRepairs);

  const activeCount = repairs.filter(
    (r) => r.status === "in-progress" || r.status === "queued"
  ).length;
  const completedCount = repairs.filter((r) => r.status === "completed").length;
  const failedCount = repairs.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
            Autonomous Repair Center
          </h1>
          <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#4F7CFF] font-mono text-xs border border-[#252A31] flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" />
            Reed-Solomon RS(4+2) Synthesis
          </span>
        </div>
        <p className="text-xs text-[#9AA3AF] mt-0.5">
          Automatic peer-to-peer parity reconstruction pipelines for missing or degraded storage shards.
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              ACTIVE REPAIRS
            </span>
            <Wrench className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <div className="text-2xl font-semibold text-[#F5F7FA]">
            {activeCount}
          </div>
          <span className="font-mono text-[11px] text-[#E6B65C]">
            1 reconstructing • 1 queued
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              COMPLETED TODAY
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#35C98B]" />
          </div>
          <div className="text-2xl font-semibold text-[#35C98B]">
            {completedCount + 12}
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            100% Shard parity bit fidelity
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              FAILED REPAIRS
            </span>
            <AlertTriangle className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div className="text-2xl font-semibold text-[#F5F7FA]">
            {failedCount}
          </div>
          <span className="font-mono text-[11px] text-[#35C98B]">
            Zero unrecoverable partitions
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              AVG REPAIR TIME
            </span>
            <Clock className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div className="text-2xl font-semibold font-mono text-[#F5F7FA]">
            48s
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            Direct peer NVMe rebalance
          </span>
        </div>
      </div>

      {/* Live Shard Reconstruction Pipeline */}
      <ShardReconstructionVisual />

      {/* Repair Table */}
      <RepairTable repairs={repairs} />
    </div>
  );
}
