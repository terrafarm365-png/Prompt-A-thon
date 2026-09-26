import React from "react";
import { HealthMetrics } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Server,
  Activity,
  Zap,
  Radio,
  Timer,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

interface HealthOverviewProps {
  metrics: HealthMetrics;
}

export function HealthOverview({ metrics }: HealthOverviewProps) {
  const subsystems = [
    {
      title: "Cluster Quorum",
      status: metrics.clusterHealth,
      description: `${metrics.onlineNodes}/${metrics.totalNodes} Nodes active and heartbeating`,
      icon: Server,
    },
    {
      title: "Storage Durability",
      status: metrics.storageHealth,
      description: "Reed-Solomon RS(4+2) fault tolerance satisfied",
      icon: ShieldCheck,
    },
    {
      title: "Cryptographic Scrub",
      status: metrics.dataIntegrity,
      description: `Bit-rot scrub completed ${metrics.lastScrubTime} (0 corrupted)`,
      icon: Activity,
    },
    {
      title: "Autonomous Repairs",
      status: metrics.repairHealth === "optimal" ? "healthy" : "warning",
      description: "Peer-to-peer parity reconstruction pipeline idle",
      icon: Zap,
    },
    {
      title: "Network & Mesh Telemetry",
      status: metrics.networkHealth,
      description: "Low-jitter gRPC cluster mesh interconnects",
      icon: Radio,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5 Subsystem Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {subsystems.map((sub) => {
          const Icon = sub.icon;
          return (
            <div
              key={sub.title}
              className="p-3.5 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-[#8D90A0]" />
                <Badge
                  variant={sub.status === "healthy" ? "success" : "warning"}
                  dot
                >
                  {sub.status === "healthy" ? "Normal" : "Degraded"}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#F5F7FA]">
                  {sub.title}
                </h4>
                <p className="text-[11px] text-[#9AA3AF] mt-1 line-clamp-2">
                  {sub.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Latency & Throughput Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
              CLUSTER P95 LATENCY
            </span>
            <div className="font-mono text-xl font-semibold text-[#35C98B] mt-0.5">
              {metrics.p95LatencyMs} ms
            </div>
            <span className="text-[11px] font-mono text-[#69717D]">
              Average: {metrics.avgLatencyMs} ms
            </span>
          </div>
          <Timer className="w-6 h-6 text-[#35C98B]" />
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
              CLUSTER INGRESS
            </span>
            <div className="font-mono text-xl font-semibold text-[#4F7CFF] mt-0.5">
              {metrics.ingressMbps} MB/s
            </div>
            <span className="text-[11px] font-mono text-[#69717D] flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-[#4F7CFF]" /> Peak: 1.2 Gbps
            </span>
          </div>
          <Activity className="w-6 h-6 text-[#4F7CFF]" />
        </div>

        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
              CLUSTER EGRESS
            </span>
            <div className="font-mono text-xl font-semibold text-[#F5F7FA] mt-0.5">
              {metrics.egressMbps} MB/s
            </div>
            <span className="text-[11px] font-mono text-[#69717D] flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#35C98B]" /> Peak: 2.4 Gbps
            </span>
          </div>
          <Radio className="w-6 h-6 text-[#8D90A0]" />
        </div>
      </div>
    </div>
  );
}
