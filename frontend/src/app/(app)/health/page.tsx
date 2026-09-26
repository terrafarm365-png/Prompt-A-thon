"use client";

import React from "react";
import { mockHealthMetrics } from "@/lib/mock-data/health";
import { mockActivity } from "@/lib/mock-data/activity";
import { HealthOverview } from "@/components/health/health-overview";
import { RefreshCw, Terminal, CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HealthPage() {
  const handleTriggerScrub = () => {
    toast.success("Manual cryptographic SHA-256 cluster scrub scheduled across 6 drives");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
              System Health & Diagnostics
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#35C98B] font-mono text-xs border border-[#252A31] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Systems Operational
            </span>
          </div>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            Distributed quorum verification, bit-rot scrub logs, and hardware telemetry monitors.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleTriggerScrub}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#4F7CFF]" />
          <span>Run Immediate Scrub</span>
        </Button>
      </div>

      {/* Subsystem Health Grid */}
      <HealthOverview metrics={mockHealthMetrics} />

      {/* Diagnostics Event Log */}
      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2229]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#8D90A0]" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Cluster Event Log & Telemetry Audit
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#69717D]">Live Ring Buffer</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {mockActivity.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded bg-[#0C0E11] border border-[#252A31] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    evt.severity === "success"
                      ? "bg-[#35C98B]"
                      : evt.severity === "warning"
                      ? "bg-[#E6B65C]"
                      : "bg-[#4F7CFF]"
                  }`}
                />
                <div>
                  <span className="text-[#F5F7FA] font-medium">{evt.title}</span>
                  <span className="text-[#9AA3AF] block sm:inline sm:ml-2 text-[11px]">
                    {evt.description}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-[#69717D] shrink-0">
                {formatRelativeTime(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
