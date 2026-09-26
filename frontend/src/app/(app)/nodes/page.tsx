"use client";

import React, { useState } from "react";
import { mockNodes } from "@/lib/mock-data/nodes";
import { NodeTable } from "@/components/nodes/node-table";
import { NodeTopologyMap } from "@/components/nodes/node-topology-map";
import { Server, CheckCircle2, AlertTriangle, HardDrive } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default function NodesPage() {
  const [nodes] = useState(mockNodes);

  const healthyCount = nodes.filter((n) => n.status === "online").length;
  const degradedCount = nodes.filter((n) => n.status === "degraded").length;

  const totalCapacity = nodes.reduce((acc, n) => acc + n.capacity, 0);
  const totalUsed = nodes.reduce((acc, n) => acc + n.used, 0);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
            Storage Nodes Fleet
          </h1>
          <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#35C98B] font-mono text-xs border border-[#252A31] flex items-center gap-1">
            <Server className="w-3.5 h-3.5" />
            6 Nodes Online
          </span>
        </div>
        <p className="text-xs text-[#9AA3AF] mt-0.5">
          Real-time daemon heartbeat, hardware telemetry, load distribution, and physical drive capacities.
        </p>
      </div>

      {/* Top 4 Fleet Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              TOTAL HARDWARE NODES
            </span>
            <Server className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <div className="text-2xl font-semibold text-[#F5F7FA]">
            {nodes.length}
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            Distributed across 3 data center regions
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              HEALTHY / ONLINE
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#35C98B]" />
          </div>
          <div className="text-2xl font-semibold text-[#35C98B]">
            {healthyCount}
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            100% Heartbeat quorum maintained
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              DEGRADED NODES
            </span>
            <AlertTriangle className="w-4 h-4 text-[#E6B65C]" />
          </div>
          <div className="text-2xl font-semibold text-[#E6B65C]">
            {degradedCount}
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            0 disk timeouts or CRC errors
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              FLEET USAGE
            </span>
            <HardDrive className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div className="text-2xl font-semibold text-[#F5F7FA]">
            {((totalUsed / totalCapacity) * 100).toFixed(1)}%
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            {formatBytes(totalUsed)} of {formatBytes(totalCapacity)}
          </span>
        </div>
      </div>

      {/* Cluster Mesh Topology Map */}
      <NodeTopologyMap nodes={nodes} />

      {/* Fleet Table */}
      <NodeTable nodes={nodes} />
    </div>
  );
}
