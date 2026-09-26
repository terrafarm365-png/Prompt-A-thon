"use client";

import React, { useState } from "react";
import { StorageNode } from "@/types";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { NodeStatusBadge } from "@/components/ui/status-indicator";
import { Server, ArrowUpDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface NodeTableProps {
  nodes: StorageNode[];
}

export function NodeTable({ nodes }: NodeTableProps) {
  const [sortField, setSortField] = useState<"name" | "load" | "used">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedNodes = [...nodes].sort((a, b) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === "load") {
      return sortOrder === "asc" ? a.load - b.load : b.load - a.load;
    }
    if (sortField === "used") {
      return sortOrder === "asc" ? a.used - b.used : b.used - a.used;
    }
    return 0;
  });

  const handleSort = (field: "name" | "load" | "used") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[#252A31] bg-[#111418]">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="h-9 border-b border-[#252A31] bg-[#0C0E11] text-[#69717D] uppercase font-semibold text-[10px] tracking-wider select-none">
            <th
              onClick={() => handleSort("name")}
              className="px-4 py-2 cursor-pointer hover:text-[#F5F7FA]"
            >
              <div className="flex items-center gap-1.5">
                <span>Storage Node</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 hidden sm:table-cell">Region & Rack</th>
            <th className="px-4 py-2 text-right">Capacity</th>
            <th
              onClick={() => handleSort("used")}
              className="px-4 py-2 text-right cursor-pointer hover:text-[#F5F7FA]"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Used</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-4 py-2 text-right hidden md:table-cell">Free</th>
            <th
              onClick={() => handleSort("load")}
              className="px-4 py-2 text-right cursor-pointer hover:text-[#F5F7FA]"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Load</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-4 py-2 text-right hidden lg:table-cell">Objects</th>
            <th className="px-4 py-2 hidden xl:table-cell">Heartbeat</th>
            <th className="px-4 py-2 text-center w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E2229]">
          {sortedNodes.map((node) => (
            <tr
              key={node.id}
              className="h-11 hover:bg-[#14171D] transition-colors group cursor-pointer"
            >
              <td className="px-4 py-2">
                <Link
                  href={`/nodes/${node.id}`}
                  className="flex items-center gap-2.5"
                >
                  <Server className="w-4 h-4 text-[#8D90A0] group-hover:text-[#4F7CFF] transition-colors shrink-0" />
                  <div>
                    <span className="font-mono font-medium text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors">
                      {node.name}
                    </span>
                    <span className="block font-mono text-[10px] text-[#69717D]">
                      {node.ip}
                    </span>
                  </div>
                </Link>
              </td>

              <td className="px-4 py-2">
                <NodeStatusBadge status={node.status} />
              </td>

              <td className="px-4 py-2 font-mono text-[#9AA3AF] hidden sm:table-cell">
                {node.region} • {node.rack}
              </td>

              <td className="px-4 py-2 text-right font-mono text-[#69717D]">
                {formatBytes(node.capacity)}
              </td>

              <td className="px-4 py-2 text-right font-mono text-[#F5F7FA]">
                {formatBytes(node.used)}
              </td>

              <td className="px-4 py-2 text-right font-mono text-[#35C98B] hidden md:table-cell">
                {formatBytes(node.free)}
              </td>

              <td className="px-4 py-2 text-right font-mono">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={
                      node.load > 60
                        ? "text-[#E6B65C]"
                        : "text-[#F5F7FA]"
                    }
                  >
                    {node.load}%
                  </span>
                  <div className="w-12 bg-[#1E2023] h-1 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        node.load > 60 ? "bg-[#E6B65C]" : "bg-[#35C98B]"
                      }`}
                      style={{ width: `${node.load}%` }}
                    />
                  </div>
                </div>
              </td>

              <td className="px-4 py-2 text-right font-mono text-[#9AA3AF] hidden lg:table-cell">
                {node.objects.toLocaleString()}
              </td>

              <td className="px-4 py-2 font-mono text-[11px] text-[#69717D] hidden xl:table-cell">
                {formatRelativeTime(node.lastHeartbeat)}
              </td>

              <td className="px-4 py-2 text-center">
                <Link
                  href={`/nodes/${node.id}`}
                  className="p-1 rounded text-[#69717D] hover:text-[#F5F7FA] inline-flex items-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary footer */}
      <div className="h-10 px-4 bg-[#0C0E11] border-t border-[#252A31] flex items-center justify-between font-mono text-[11px] text-[#69717D]">
        <div className="flex items-center gap-3">
          <span>6 storage daemons active</span>
          <span>•</span>
          <span>Aggregated Capacity: 12.0 TB</span>
          <span>•</span>
          <span className="text-[#35C98B]">Zero partition splits</span>
        </div>
      </div>
    </div>
  );
}
