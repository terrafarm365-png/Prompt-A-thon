"use client";

import React, { useState } from "react";
import { StorageNode } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";

interface NodeTopologyMapProps {
  nodes: StorageNode[];
}

export function NodeTopologyMap({ nodes }: NodeTopologyMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || "node-1");
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Coordinates for a 6-node circular SVG constellation
  // Center is at (300, 220), radius = 150
  const centerX = 300;
  const centerY = 220;
  const radius = 145;

  const nodePositions = nodes.slice(0, 6).map((node, i) => {
    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
    return {
      node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  });

  return (
    <div className="p-6 rounded-2xl bg-[#111418] border border-[#252A31] space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252A31] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
            CLUSTER MESH VISUALIZER
          </span>
          <h3 className="text-base font-bold text-[#F5F7FA]">
            Distributed Node Interconnect Topology
          </h3>
        </div>
        <Badge variant="success" dot className="font-mono text-xs self-start sm:self-auto">
          6/6 CLUSTER QUORUM
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: SVG Constellation Map (7 cols) */}
        <div className="lg:col-span-7 flex justify-center items-center bg-[#0C0E11] rounded-xl border border-[#252A31] p-4 relative overflow-hidden min-h-[380px]">
          <svg
            viewBox="0 0 600 440"
            className="w-full h-auto max-w-[520px] select-none"
          >
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4F7CFF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4F7CFF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F7CFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#35C98B" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Background Ambient Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#1E2229"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Central Glow */}
            <circle cx={centerX} cy={centerY} r="80" fill="url(#hubGlow)" />

            {/* Connection Lines from Center Hub to Nodes */}
            {nodePositions.map(({ node, x, y }) => {
              const isSelected = node.id === selectedNodeId;
              const isHealthy = node.status === "online";

              return (
                <g key={`line-${node.id}`}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={
                      !isHealthy
                        ? "#E05D6F"
                        : isSelected
                        ? "#4F7CFF"
                        : "#252A31"
                    }
                    strokeWidth={isSelected ? "2" : "1.5"}
                    strokeDasharray={isHealthy ? undefined : "4 4"}
                    className="transition-colors duration-300"
                  />
                  {/* Subtle pulsing packet along line */}
                  {isHealthy && (
                    <circle
                      r="2.5"
                      fill={isSelected ? "#5CA9FF" : "#4F7CFF"}
                    >
                      <animateMotion
                        path={`M ${centerX} ${centerY} L ${x} ${y}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Central Vault Cluster Core */}
            <g className="cursor-pointer">
              <circle
                cx={centerX}
                cy={centerY}
                r="38"
                fill="#171A1F"
                stroke="#4F7CFF"
                strokeWidth="2"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="28"
                fill="#111418"
                stroke="#252A31"
                strokeWidth="1"
              />
              <text
                x={centerX}
                y={centerY - 4}
                textAnchor="middle"
                fill="#F5F7FA"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                VAULT
              </text>
              <text
                x={centerX}
                y={centerY + 8}
                textAnchor="middle"
                fill="#4F7CFF"
                fontSize="8"
                fontFamily="monospace"
              >
                MESH CORE
              </text>
            </g>

            {/* 6 Peripheral Storage Node Cards in Ring */}
            {nodePositions.map(({ node, x, y }) => {
              const isSelected = node.id === selectedNodeId;
              const isOnline = node.status === "online";

              return (
                <g
                  key={node.id}
                  transform={`translate(${x - 42}, ${y - 24})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  <rect
                    width="84"
                    height="48"
                    rx="8"
                    fill={isSelected ? "#1C2028" : "#14171D"}
                    stroke={
                      isSelected
                        ? "#4F7CFF"
                        : !isOnline
                        ? "#E05D6F"
                        : "#252A31"
                    }
                    strokeWidth={isSelected ? "1.5" : "1"}
                    className="transition-all duration-200"
                  />
                  {/* Status LED */}
                  <circle
                    cx="14"
                    cy="16"
                    r="3"
                    fill={isOnline ? "#35C98B" : "#E05D6F"}
                  />
                  <text
                    x="24"
                    y="19"
                    fill="#F5F7FA"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.name.replace("Storage ", "")}
                  </text>
                  <text
                    x="12"
                    y="36"
                    fill="#69717D"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {node.shardsCount} Shards
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Selected Node Telemetry Diagnostic Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#0C0E11] border border-[#252A31] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2229]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#4F7CFF]" />
              <span className="font-mono text-xs text-[#F5F7FA] font-bold">
                {selectedNode.name}
              </span>
            </div>
            <Badge
              variant={selectedNode.status === "online" ? "success" : "error"}
              dot
              className="text-[10px]"
            >
              {selectedNode.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-[#14171D] border border-[#252A31]">
              <span className="text-[10px] text-[#69717D] block">REGION & ZONE</span>
              <span className="text-[#F5F7FA] font-medium">{selectedNode.region}</span>
            </div>
            <div className="p-2.5 rounded bg-[#14171D] border border-[#252A31]">
              <span className="text-[10px] text-[#69717D] block">HARDWARE RACK</span>
              <span className="text-[#F5F7FA] font-medium">{selectedNode.rack}</span>
            </div>
            <div className="p-2.5 rounded bg-[#14171D] border border-[#252A31]">
              <span className="text-[10px] text-[#69717D] block">ASSIGNED SHARDS</span>
              <span className="text-[#4F7CFF] font-medium">{selectedNode.shardsCount} blocks</span>
            </div>
            <div className="p-2.5 rounded bg-[#14171D] border border-[#252A31]">
              <span className="text-[10px] text-[#69717D] block">MEDIA USAGE</span>
              <span className="text-[#35C98B] font-medium">
                {formatBytes(selectedNode.used)} / {formatBytes(selectedNode.capacity)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[#69717D] text-[11px]">
              <span>CPU Load & IOPS</span>
              <span>{selectedNode.load}%</span>
            </div>
            <div className="w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4F7CFF] h-full rounded-full"
                style={{ width: `${selectedNode.load}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[#69717D] text-[11px]">
              <span>Disk Volume Allocation</span>
              <span>{selectedNode.disk}%</span>
            </div>
            <div className="w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#35C98B] h-full rounded-full"
                style={{ width: `${selectedNode.disk}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#14171D] border border-[#252A31] font-mono text-[11px] text-[#9AA3AF] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69717D]">Daemon Endpoint:</span>
              <span className="text-[#F5F7FA]">{selectedNode.ip}:9000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69717D]">Interconnect Security:</span>
              <span className="text-[#35C98B]">mTLS SPIFFE v1.2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
