"use client";

import React, { useState } from "react";
import { mockActivity } from "@/lib/mock-data/activity";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Wrench,
  ShieldCheck,
  RefreshCw,
  Filter,
} from "lucide-react";

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = mockActivity.filter((evt) => {
    if (filter === "all") return true;
    return evt.severity === filter;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="w-4 h-4 text-[#4F7CFF]" />;
      case "repair":
        return <Wrench className="w-4 h-4 text-[#E6B65C]" />;
      case "integrity_check":
        return <ShieldCheck className="w-4 h-4 text-[#35C98B]" />;
      default:
        return <RefreshCw className="w-4 h-4 text-[#8D90A0]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
              Audit & Activity Stream
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#4F7CFF] font-mono text-xs border border-[#252A31] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Cluster Telemetry
            </span>
          </div>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            Immutable chronological timeline of object transfers, autonomous shard repairs, and disk scrubs.
          </p>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#69717D]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter events by severity"
            className="h-8 rounded border border-[#252A31] bg-[#111418] px-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4F7CFF]"
          >
            <option value="all">All Severities</option>
            <option value="success">Success Only</option>
            <option value="info">Info</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-[#111418] border border-[#252A31] hover:border-[#353B45] transition-colors flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0 mt-0.5">
              {getEventIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#F5F7FA] truncate">
                  {item.title}
                </h3>
                <span className="font-mono text-[10px] text-[#69717D] shrink-0">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-[#9AA3AF] mt-1 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    item.severity === "success"
                      ? "success"
                      : item.severity === "warning"
                      ? "warning"
                      : "secondary"
                  }
                  dot
                >
                  {item.severity.toUpperCase()}
                </Badge>
                {item.targetId && (
                  <span className="font-mono text-[10px] text-[#69717D]">
                    Ref: {item.targetId}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
