import React from "react";
import { StorageNode } from "@/types";
import { formatBytes } from "@/lib/utils";
import { NodeStatusBadge } from "@/components/ui/status-indicator";
import { Server } from "lucide-react";
import Link from "next/link";

interface NodeHealthCardProps {
  node: StorageNode;
}

export function NodeHealthCard({ node }: NodeHealthCardProps) {
  return (
    <Link
      href={`/nodes/${node.id}`}
      className="block p-4 rounded-lg bg-[#111418] border border-[#252A31] hover:border-[#4F7CFF]/50 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center text-[#9AA3AF] group-hover:text-[#4F7CFF] transition-colors">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#F5F7FA]">
              {node.name}
            </span>
            <span className="block text-[10px] text-[#69717D]">
              {node.region} • {node.rack}
            </span>
          </div>
        </div>
        <NodeStatusBadge status={node.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1E2229] font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#69717D] block">LOAD</span>
          <span className="text-[#F5F7FA] font-medium">{node.load}%</span>
        </div>
        <div>
          <span className="text-[10px] text-[#69717D] block">USED</span>
          <span className="text-[#F5F7FA] font-medium">{formatBytes(node.used)}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#69717D] block">SHARDS</span>
          <span className="text-[#4F7CFF] font-medium">{node.shardsCount}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] font-mono">
        <div className="flex justify-between text-[#69717D]">
          <span>Disk Allocation</span>
          <span>{node.disk}%</span>
        </div>
        <div className="w-full bg-[#1E2023] h-1 rounded-full overflow-hidden">
          <div
            className="bg-[#35C98B] h-full rounded-full"
            style={{ width: `${node.disk}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
