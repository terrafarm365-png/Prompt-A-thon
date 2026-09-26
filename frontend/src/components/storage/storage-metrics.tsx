import React from "react";
import { StorageMetrics as StorageMetricsType } from "@/types";
import { formatBytes } from "@/lib/utils";
import { HardDrive, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

interface StorageMetricsProps {
  metrics: StorageMetricsType;
}

export function StorageMetrics({ metrics }: StorageMetricsProps) {
  const usedPercent = ((metrics.physicalUsed / metrics.totalCapacity) * 100).toFixed(1);
  const logicalPercent = ((metrics.logicalUsed / metrics.totalCapacity) * 100).toFixed(1);
  const parityPercent = (((metrics.physicalUsed - metrics.logicalUsed) / metrics.totalCapacity) * 100).toFixed(1);
  const availablePercent = (100 - parseFloat(usedPercent)).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Storage Used */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              LOGICAL STORED
            </span>
            <HardDrive className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#F5F7FA]">
                {formatBytes(metrics.logicalUsed)}
              </span>
              <span className="font-mono text-xs text-[#69717D]">
                / {formatBytes(metrics.totalCapacity)}
              </span>
            </div>
            <div className="mt-2 w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4F7CFF] h-full rounded-full"
                style={{ width: `${logicalPercent}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF] flex items-center gap-1">
            <span className="text-[#35C98B] flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +142 GB
            </span>
            <span>this 24h cycle</span>
          </span>
        </div>

        {/* Card 2: Physical Footprint */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              PHYSICAL FOOTPRINT
            </span>
            <ShieldCheck className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#F5F7FA]">
                {formatBytes(metrics.physicalUsed)}
              </span>
              <span className="font-mono text-xs text-[#35C98B]">
                {metrics.overheadRatio}x EC (4+2)
              </span>
            </div>
            <div className="mt-2 w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#8D90A0] h-full rounded-full"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            {formatBytes(metrics.physicalUsed - metrics.logicalUsed)} Parity data shards
          </span>
        </div>

        {/* Card 3: Storage Efficiency */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              STORAGE EFFICIENCY
            </span>
            <Zap className="w-4 h-4 text-[#E6B65C]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#E6B65C]">
                {metrics.efficiencyPercent}%
              </span>
              <span className="font-mono text-xs text-[#69717D]">
                (RS 4+2 Matrix)
              </span>
            </div>
            <div className="mt-2 w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E6B65C] h-full rounded-full"
                style={{ width: `${metrics.efficiencyPercent}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            Zero single point of failure
          </span>
        </div>

        {/* Card 4: Available Headroom */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              AVAILABLE HEADROOM
            </span>
            <div className="w-2 h-2 rounded-full bg-[#35C98B]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#F5F7FA]">
                {formatBytes(metrics.availableCapacity)}
              </span>
              <span className="font-mono text-xs text-[#35C98B]">
                {availablePercent}% Free
              </span>
            </div>
            <div className="mt-2 w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#35C98B] h-full rounded-full"
                style={{ width: `${availablePercent}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            6 of 6 storage nodes active
          </span>
        </div>
      </div>

      {/* Capacity Allocation Segmented Progress Section */}
      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
              CAPACITY ALLOCATION
            </span>
            <h3 className="text-sm font-semibold text-[#F5F7FA] mt-0.5">
              Storage capacity distribution across cluster
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31]">
              <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
              <span>Logical: {formatBytes(metrics.logicalUsed)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31]">
              <span className="w-2 h-2 rounded-full bg-[#8D90A0]" />
              <span>Parity: {formatBytes(metrics.physicalUsed - metrics.logicalUsed)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31] text-[#9AA3AF]">
              <span className="w-2 h-2 rounded-full bg-[#252A31]" />
              <span>Available: {formatBytes(metrics.availableCapacity)}</span>
            </div>
          </div>
        </div>

        {/* Multi-segmented bar */}
        <div className="w-full h-3 rounded-full bg-[#1E2023] overflow-hidden flex p-0.5 gap-0.5">
          <div
            className="bg-[#4F7CFF] rounded-l-full h-full"
            style={{ width: `${logicalPercent}%` }}
            title={`Logical Used: ${formatBytes(metrics.logicalUsed)}`}
          />
          <div
            className="bg-[#8D90A0] h-full"
            style={{ width: `${parityPercent}%` }}
            title={`Parity Reserved: ${formatBytes(metrics.physicalUsed - metrics.logicalUsed)}`}
          />
          <div
            className="bg-[#171A1F] rounded-r-full h-full flex-1"
            title={`Available: ${formatBytes(metrics.availableCapacity)}`}
          />
        </div>
      </div>
    </div>
  );
}
