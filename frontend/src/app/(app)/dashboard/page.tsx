"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockObjects } from "@/lib/mock-data/objects";
import { mockNodes } from "@/lib/mock-data/nodes";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { FileTypeIcon } from "@/components/files/file-type-icon";
import { ObjectStatusBadge } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/files/upload-dialog";
import { FileDetailsDrawer } from "@/components/files/file-details-drawer";
import { VaultObject } from "@/types";
import {
  PieChart,
  HardDrive,
  Wrench,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  FolderPlus,
  Upload,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<VaultObject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const recentObjects = mockObjects.slice(0, 5);

  const handleCreateFolder = () => {
    toast.info("Folder creation: Metadata virtual prefixes initialized");
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
              Cluster Overview
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#4F7CFF] font-mono text-xs border border-[#252A31]">
              prod-cluster-01
            </span>
          </div>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            Distributed storage mesh health, object telemetry, and capacity allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateFolder}
            className="gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#9AA3AF]" />
            <span>Create Folder</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Compact Metric Cards matching Stitch screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Storage Used */}
        <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] vault-tech-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              STORAGE USED
            </span>
            <PieChart className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#F5F7FA]">2.84 TB</span>
              <span className="font-mono text-xs text-[#69717D]">/ 10 TB allocated</span>
            </div>
            <div className="mt-2 w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4F7CFF] h-full rounded-full" style={{ width: "28.4%" }} />
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF] flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#35C98B]" />
            <span className="text-[#35C98B]">+142 GB</span> this cycle
          </span>
        </div>

        {/* Metric 2: Objects */}
        <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] vault-tech-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              OBJECTS
            </span>
            <HardDrive className="w-4 h-4 text-[#8D90A0]" />
          </div>
          <div>
            <span className="text-xl font-semibold text-[#F5F7FA]">12,482</span>
            <div className="font-mono text-[11px] text-[#69717D] mt-1">
              across 4 buckets • 0 corrupted
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35C98B]" />
            <span>Verification scrub 12m ago</span>
          </span>
        </div>

        {/* Metric 3: Cluster Health */}
        <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] vault-tech-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              CLUSTER HEALTH
            </span>
            <ShieldCheck className="w-4 h-4 text-[#35C98B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
              <span className="text-xl font-semibold text-[#35C98B]">Healthy</span>
            </div>
            <div className="font-mono text-[11px] text-[#69717D] mt-1">
              6 / 6 nodes active and leased
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF] flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-[#69717D]" />
            <span>Heartbeat 4s ago</span>
          </span>
        </div>

        {/* Metric 4: Repairs */}
        <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] vault-tech-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#69717D]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              REPAIRS
            </span>
            <Wrench className="w-4 h-4 text-[#E6B65C]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#F5F7FA]">2</span>
              <span className="text-xs font-mono text-[#E6B65C]">active</span>
            </div>
            <div className="font-mono text-[11px] text-[#69717D] mt-1">
              1 in progress • 1 queued
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#9AA3AF]">
            14 completed today
          </span>
        </div>
      </div>

      {/* Cluster Node Mesh Quick Status Strip */}
      <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#69717D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
            LIVE NODE TOPOLOGY (6/6 ONLINE)
          </span>
          <Link href="/nodes" className="text-[#4F7CFF] hover:underline flex items-center gap-1">
            <span>View Fleet</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
          {mockNodes.slice(0, 6).map((node) => (
            <Link
              key={node.id}
              href={`/nodes/${node.id}`}
              className="p-2.5 rounded-lg bg-[#0C0E11] border border-[#252A31] hover:border-[#4F7CFF]/50 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#F5F7FA] block text-[11px]">
                  {node.name.replace("Storage ", "")}
                </span>
                <span className="text-[10px] text-[#69717D]">{node.load}% Load</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#35C98B]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Storage Capacity Bar & Key Telemetry */}
      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
              CAPACITY ALLOCATION
            </span>
            <h3 className="text-sm font-semibold text-[#F5F7FA] mt-0.5">
              Storage capacity distribution
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31]">
              <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
              <span>Used: 2.84 TB</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31]">
              <span className="w-2 h-2 rounded-full bg-[#8D90A0]" />
              <span>Parity Reserved: 1.00 TB</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171A1F] border border-[#252A31] text-[#9AA3AF]">
              <span className="w-2 h-2 rounded-full bg-[#252A31]" />
              <span>Available: 6.16 TB</span>
            </div>
          </div>
        </div>

        {/* Multi-segmented bar */}
        <div className="w-full h-3 rounded-full bg-[#1E2023] overflow-hidden flex p-0.5 gap-0.5">
          <div className="bg-[#4F7CFF] rounded-l-full h-full" style={{ width: "28.4%" }} />
          <div className="bg-[#8D90A0] h-full" style={{ width: "10.0%" }} />
          <div className="bg-[#171A1F] rounded-r-full h-full flex-1" />
        </div>

        {/* 3 Telemetry cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#69717D] uppercase tracking-wider block">
                Erasure Coding Scheme
              </span>
              <span className="font-mono text-xs font-semibold text-[#F5F7FA]">
                66.7% Efficiency (4+2)
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#8D90A0]" />
          </div>

          <div className="p-3 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#69717D] uppercase tracking-wider block">
                Average Object Latency
              </span>
              <span className="font-mono text-xs font-semibold text-[#35C98B]">
                18 ms <span className="text-[#69717D] font-normal">(p95: 34ms)</span>
              </span>
            </div>
            <Zap className="w-4 h-4 text-[#35C98B]" />
          </div>

          <div className="p-3 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#69717D] uppercase tracking-wider block">
                Ingress Throughput
              </span>
              <span className="font-mono text-xs font-semibold text-[#4F7CFF]">
                42 MB/s <span className="text-[#69717D] font-normal">/ 1.2 Gbps peak</span>
              </span>
            </div>
            <HardDrive className="w-4 h-4 text-[#4F7CFF]" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Objects (8 cols) & Node Infrastructure (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Objects Table (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                ACTIVITY TELEMETRY
              </span>
              <h3 className="text-sm font-semibold text-[#F5F7FA] mt-0.5">
                Recent Objects
              </h3>
            </div>
            <Link
              href="/files"
              className="text-xs text-[#4F7CFF] hover:underline flex items-center gap-1"
            >
              <span>View all files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="h-8 border-b border-[#252A31] text-[#69717D] uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2 px-3">Object Name</th>
                  <th className="py-2 px-3 hidden sm:table-cell">Type</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3 hidden md:table-cell">Accessed</th>
                  <th className="py-2 px-3 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2229]">
                {recentObjects.map((obj) => (
                  <tr
                    key={obj.id}
                    onClick={() => {
                      setSelectedObject(obj);
                      setDrawerOpen(true);
                    }}
                    className="h-10 hover:bg-[#14171D] transition-colors cursor-pointer group"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon type={obj.type} name={obj.name} className="w-4 h-4 shrink-0" />
                        <span className="font-mono text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors truncate max-w-[180px] sm:max-w-xs">
                          {obj.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[#9AA3AF] hidden sm:table-cell">
                      {obj.type}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#F5F7FA]">
                      {formatBytes(obj.size)}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#69717D] hidden md:table-cell">
                      {formatRelativeTime(obj.updatedAt)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <ObjectStatusBadge status={obj.status} scheme="4+2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[#1E2229] flex items-center justify-between text-[11px] font-mono text-[#69717D]">
            <span>Continuous scrub active across 6 node disks</span>
            <span className="text-[#35C98B]">SHA-256 Validated</span>
          </div>
        </div>

        {/* Right Column: Node Infrastructure (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                INFRASTRUCTURE
              </span>
              <h3 className="text-sm font-semibold text-[#F5F7FA] mt-0.5">
                Node Topology
              </h3>
            </div>
            <Link
              href="/nodes"
              className="text-[11px] font-mono text-[#35C98B] hover:underline"
            >
              6/6 ONLINE
            </Link>
          </div>

          <div className="space-y-2">
            {mockNodes.map((node) => (
              <Link
                key={node.id}
                href={`/nodes/${node.id}`}
                className="p-2.5 rounded bg-[#171A1F] border border-[#252A31] hover:border-[#4F7CFF]/50 transition-colors flex items-center justify-between block group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35C98B]" />
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors">
                      {node.name}
                    </span>
                    <span className="block text-[10px] font-mono text-[#69717D]">
                      {node.rack} • {node.ip}
                    </span>
                  </div>
                </div>

                <div className="w-20 text-right space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-[#69717D]">
                    <span>Load</span>
                    <span className="text-[#F5F7FA]">{node.load}%</span>
                  </div>
                  <div className="w-full bg-[#1E2023] h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-[#35C98B] h-full rounded-full"
                      style={{ width: `${node.load}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      {/* File Details Drawer */}
      <FileDetailsDrawer
        object={selectedObject}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
