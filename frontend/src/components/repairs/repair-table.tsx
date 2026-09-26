"use client";

import React, { useState } from "react";
import { RepairTask } from "@/types";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, ArrowRight, ChevronRight } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";

interface RepairTableProps {
  repairs: RepairTask[];
}

export function RepairTable({ repairs }: RepairTableProps) {
  const [selectedRepair, setSelectedRepair] = useState<RepairTask | null>(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[#252A31] bg-[#111418]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="h-9 border-b border-[#252A31] bg-[#0C0E11] text-[#69717D] uppercase font-semibold text-[10px] tracking-wider select-none">
              <th className="px-4 py-2">Repair Task</th>
              <th className="px-4 py-2">Shard</th>
              <th className="px-4 py-2 hidden md:table-cell">Source → Target</th>
              <th className="px-4 py-2">Progress</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right hidden sm:table-cell">Transferred</th>
              <th className="px-4 py-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2229]">
            {repairs.map((task) => {
              const isDone = task.status === "completed";
              const isInProgress = task.status === "in-progress";

              return (
                <tr
                  key={task.id}
                  onClick={() => setSelectedRepair(task)}
                  className="h-12 hover:bg-[#14171D] transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0">
                        <Wrench className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      </div>
                      <div>
                        <span className="font-medium text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors">
                          {task.objectName}
                        </span>
                        <span className="block font-mono text-[10px] text-[#69717D]">
                          {task.id} • {formatRelativeTime(task.detectedAt)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        task.shardType === "parity"
                          ? "text-[#E6B65C]"
                          : "text-[#4F7CFF]"
                      }`}
                    >
                      {task.shardLabel}
                    </span>
                  </td>

                  <td className="px-4 py-2 font-mono text-[11px] text-[#9AA3AF] hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span>{task.sourceNodeName}</span>
                      <ArrowRight className="w-3 h-3 text-[#69717D]" />
                      <span className="text-[#F5F7FA]">{task.destinationNodeName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-2 w-36">
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-[#9AA3AF]">
                        <span>{task.progress}%</span>
                      </div>
                      <Progress
                        value={task.progress}
                        indicatorClassName={
                          isDone
                            ? "bg-[#35C98B]"
                            : isInProgress
                            ? "bg-[#4F7CFF]"
                            : "bg-[#E6B65C]"
                        }
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    {isDone && (
                      <Badge variant="success" dot>
                        Completed
                      </Badge>
                    )}
                    {isInProgress && (
                      <Badge variant="default" dot>
                        Reconstructing
                      </Badge>
                    )}
                    {task.status === "queued" && (
                      <Badge variant="warning" dot>
                        Queued
                      </Badge>
                    )}
                    {task.status === "failed" && (
                      <Badge variant="error" dot>
                        Failed
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-2 text-right font-mono text-[11px] text-[#9AA3AF] hidden sm:table-cell">
                    {formatBytes(task.bytesTransferred)} / {formatBytes(task.bytesTotal)}
                  </td>

                  <td className="px-4 py-2 text-center text-[#69717D]">
                    <ChevronRight className="w-4 h-4 group-hover:text-[#F5F7FA] transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Repair Details Drawer */}
      <Drawer
        open={!!selectedRepair}
        onClose={() => setSelectedRepair(null)}
        title="Repair Task Telemetry"
        subtitle={selectedRepair?.id}
        side="right"
      >
        {selectedRepair && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded bg-[#111418] border border-[#252A31] space-y-2">
              <div className="text-[10px] font-semibold uppercase text-[#69717D] tracking-wider">
                Target Object
              </div>
              <div className="text-sm font-semibold text-[#F5F7FA]">
                {selectedRepair.objectName}
              </div>
              <div className="font-mono text-[#9AA3AF]">
                Shard: {selectedRepair.shardLabel} ({selectedRepair.shardType.toUpperCase()})
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#111418] border border-[#252A31] space-y-2 font-mono">
              <div className="text-[10px] font-semibold uppercase text-[#69717D] tracking-wider">
                Transfer Diagnostics
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Source Node:</span>
                <span className="text-[#F5F7FA]">{selectedRepair.sourceNodeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Destination:</span>
                <span className="text-[#35C98B]">{selectedRepair.destinationNodeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Detected Reason:</span>
                <span className="text-[#E6B65C]">{selectedRepair.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69717D]">Payload Size:</span>
                <span className="text-[#F5F7FA]">{formatBytes(selectedRepair.bytesTotal)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#111418] border border-[#252A31] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#F5F7FA]">Reconstruction Progress</span>
                <span className="text-[#4F7CFF]">{selectedRepair.progress}%</span>
              </div>
              <Progress value={selectedRepair.progress} />
              <p className="text-[11px] text-[#69717D]">
                Synthesizing missing shard from 4 surviving data blocks using Reed-Solomon polynomial matrix.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
