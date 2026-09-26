"use client";

import React, { use } from "react";
import Link from "next/link";
import { mockRepairs } from "@/lib/mock-data/repairs";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wrench } from "lucide-react";
import { notFound } from "next/navigation";

export default function RepairDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const repair = mockRepairs.find((r) => r.id === resolvedParams.id);

  if (!repair) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/repairs"
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repair Center</span>
        </Link>
      </div>

      <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-[#4F7CFF]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-[#F5F7FA]">
                Repair Task {repair.id}
              </h1>
              <span className="font-mono text-xs text-[#9AA3AF]">
                Object: {repair.objectName}
              </span>
            </div>
          </div>
          <Badge
            variant={repair.status === "completed" ? "success" : "default"}
            dot
          >
            {repair.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#9AA3AF]">Reconstruction Progress</span>
            <span className="text-[#4F7CFF]">{repair.progress}%</span>
          </div>
          <Progress value={repair.progress} />
        </div>
      </div>

      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 font-mono text-xs">
        <div className="text-[10px] font-semibold uppercase text-[#69717D] tracking-wider pb-2 border-b border-[#1E2229]">
          Reconstruction Diagnostics
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Target Shard:</span>
          <span className="text-[#4F7CFF] font-semibold">{repair.shardLabel} ({repair.shardType})</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Source Hardware Node:</span>
          <span className="text-[#F5F7FA]">{repair.sourceNodeName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Destination Node:</span>
          <span className="text-[#35C98B]">{repair.destinationNodeName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Detection Cause:</span>
          <span className="text-[#E6B65C]">{repair.reason}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Detected At:</span>
          <span className="text-[#9AA3AF]">{formatRelativeTime(repair.detectedAt)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#69717D]">Payload Transferred:</span>
          <span className="text-[#F5F7FA]">{formatBytes(repair.bytesTransferred)} / {formatBytes(repair.bytesTotal)}</span>
        </div>
      </div>
    </div>
  );
}
