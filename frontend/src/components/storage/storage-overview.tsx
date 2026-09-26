import React from "react";
import { StorageMetrics as StorageMetricsType } from "@/types";
import { StorageMetrics } from "./storage-metrics";
import { StorageChart } from "./storage-chart";
import { CapacityBreakdownVisual } from "./capacity-breakdown-visual";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, Activity } from "lucide-react";

interface StorageOverviewProps {
  metrics: StorageMetricsType;
}

export function StorageOverview({ metrics }: StorageOverviewProps) {
  return (
    <div className="space-y-6">
      {/* High-level metrics */}
      <StorageMetrics metrics={metrics} />

      {/* Visual Capacity Breakdown & Shard Striping */}
      <CapacityBreakdownVisual
        totalCapacity={metrics.totalCapacity}
        usedCapacity={metrics.physicalUsed}
      />

      {/* Historical storage trends & Erasure telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts Capacity Timeline (8 cols) */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                  TREND ANALYSIS
                </span>
                <CardTitle className="text-base mt-1">Cluster Growth & Parity Consumption</CardTitle>
                <CardDescription>
                  Daily ingress of logical object payloads versus physical RS(4+2) storage commitment.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#9AA3AF]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#4F7CFF]" />
                  <span>Logical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8D90A0]" />
                  <span>Physical</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StorageChart data={metrics.history} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Erasure coding details (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                REDUNDANCY MODEL
              </span>
              <ShieldCheck className="w-4 h-4 text-[#35C98B]" />
            </div>
            <h4 className="text-sm font-semibold text-[#F5F7FA]">Reed-Solomon RS(4+2)</h4>
            <p className="text-xs text-[#9AA3AF] leading-relaxed">
              Every stored object is striped across 4 data chunks and 2 parity chunks. The cluster can tolerate losing any 2 of its 6 nodes simultaneously without data loss.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#1E2229] font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#69717D]">Storage Overhead:</span>
                <span className="text-[#F5F7FA]">1.50x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Raw Efficiency:</span>
                <span className="text-[#35C98B]">66.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Tolerable Failures:</span>
                <span className="text-[#E6B65C]">2 Concurrent Nodes</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                CONTINUOUS INTEGRITY
              </span>
              <Activity className="w-4 h-4 text-[#5CA9FF]" />
            </div>
            <h4 className="text-sm font-semibold text-[#F5F7FA]">Cryptographic Scrub</h4>
            <p className="text-xs text-[#9AA3AF] leading-relaxed">
              Continuous SHA-256 background daemon scans object blocks at 42 MB/s to detect bit rot and queue automatic repairs.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#1E2229] font-mono text-xs">
              <span className="text-[#69717D]">Active Quorum:</span>
              <span className="text-[#35C98B]">6/6 Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
