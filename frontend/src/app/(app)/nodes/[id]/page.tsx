"use client";

import React, { use } from "react";
import Link from "next/link";
import { mockNodes } from "@/lib/mock-data/nodes";
import { mockRepairs } from "@/lib/mock-data/repairs";
import { NodeStatusBadge } from "@/components/ui/status-indicator";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Server,
  Cpu,
  Activity,
  HardDrive,
  Network,
  CheckCircle2,
  Layers,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";

export default function NodeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const node = mockNodes.find((n) => n.id === resolvedParams.id);

  if (!node) {
    notFound();
  }

  const nodeRepairs = mockRepairs.filter(
    (r) => r.sourceNodeId === node.id || r.destinationNodeId === node.id
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/nodes"
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Nodes Fleet</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0">
            <Server className="w-6 h-6 text-[#4F7CFF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[#F5F7FA]">
                {node.name}
              </h1>
              <NodeStatusBadge status={node.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[#9AA3AF]">
              <span>IP: {node.ip}</span>
              <span>•</span>
              <span>Rack: {node.rack}</span>
              <span>•</span>
              <span>Region: {node.region}</span>
              <span>•</span>
              <span>Heartbeat: {formatRelativeTime(node.lastHeartbeat)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Utilization Telemetry (CPU, Memory, Disk, Network) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              CPU UTILIZATION
            </span>
            <Cpu className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <div className="text-2xl font-semibold font-mono text-[#F5F7FA]">
            {node.cpu}%
          </div>
          <Progress value={node.cpu} />
          <span className="font-mono text-[10px] text-[#9AA3AF] block">
            16-Core AMD EPYC™ processor
          </span>
        </div>

        {/* Memory */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              RAM USAGE
            </span>
            <Activity className="w-4 h-4 text-[#35C98B]" />
          </div>
          <div className="text-2xl font-semibold font-mono text-[#F5F7FA]">
            {node.memory}%
          </div>
          <Progress value={node.memory} indicatorClassName="bg-[#35C98B]" />
          <span className="font-mono text-[10px] text-[#9AA3AF] block">
            28.1 GB / 64 GB ECC DDR5
          </span>
        </div>

        {/* Disk */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              DRIVE CONSUMPTION
            </span>
            <HardDrive className="w-4 h-4 text-[#E6B65C]" />
          </div>
          <div className="text-2xl font-semibold font-mono text-[#F5F7FA]">
            {node.disk}%
          </div>
          <Progress value={node.disk} indicatorClassName="bg-[#E6B65C]" />
          <span className="font-mono text-[10px] text-[#9AA3AF] block">
            {formatBytes(node.used)} / {formatBytes(node.capacity)}
          </span>
        </div>

        {/* Network */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              NETWORK I/O
            </span>
            <Network className="w-4 h-4 text-[#5CA9FF]" />
          </div>
          <div className="text-xl font-semibold font-mono text-[#F5F7FA]">
            ↓{node.network.ingressMbps} / ↑{node.network.egressMbps}
          </div>
          <div className="text-xs font-mono text-[#9AA3AF]">MB/s throughput</div>
          <span className="font-mono text-[10px] text-[#9AA3AF] block">
            Dual 25 GbE SFP28 bonded
          </span>
        </div>
      </div>

      {/* Shard Allocation & Capacity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2229]">
            <span className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4F7CFF]" />
              Shard Allocation Metrics
            </span>
            <span className="font-mono text-[#4F7CFF]">RS(4+2)</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#1E2229]/60">
            <span className="text-[#9AA3AF]">Total Striped Shards:</span>
            <span className="font-mono text-[#F5F7FA] font-medium">{node.shardsCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#1E2229]/60">
            <span className="text-[#9AA3AF]">Parity Blocks Stored:</span>
            <span className="font-mono text-[#E6B65C] font-medium">{node.parityShardsCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#1E2229]/60">
            <span className="text-[#9AA3AF]">Participating Objects:</span>
            <span className="font-mono text-[#F5F7FA] font-medium">{node.objects.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#9AA3AF]">Integrity Bit-Rot Errors:</span>
            <span className="font-mono text-[#35C98B] font-medium">{node.integrityErrors} (Clean)</span>
          </div>
        </div>

        {/* Associated Repair Tasks */}
        <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2229]">
            <span className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#E6B65C]" />
              Active Node Repair Pipelines
            </span>
            <span className="font-mono text-[#9AA3AF]">{nodeRepairs.length} Tasks</span>
          </div>

          {nodeRepairs.length === 0 ? (
            <div className="py-8 text-center text-[#69717D]">
              <CheckCircle2 className="w-6 h-6 text-[#35C98B] mx-auto mb-2" />
              <span>No active shard reconstruction tasks for this node.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {nodeRepairs.map((task) => (
                <div key={task.id} className="p-3 rounded bg-[#0C0E11] border border-[#252A31] space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[#F5F7FA] font-semibold">
                    <span>{task.objectName}</span>
                    <span className="text-[#4F7CFF]">{task.shardLabel}</span>
                  </div>
                  <div className="flex justify-between text-[#69717D]">
                    <span>Reason: {task.reason}</span>
                    <span className="text-[#E6B65C]">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
