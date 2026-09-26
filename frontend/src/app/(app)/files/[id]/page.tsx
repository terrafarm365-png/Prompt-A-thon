"use client";

import React, { use } from "react";
import Link from "next/link";
import { mockObjects } from "@/lib/mock-data/objects";
import { FileTypeIcon } from "@/components/files/file-type-icon";
import { ObjectStatusBadge } from "@/components/ui/status-indicator";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  ShieldCheck,
  HardDrive,
  Info,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { notFound } from "next/navigation";

export default function FileDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const object = mockObjects.find((o) => o.id === resolvedParams.id);
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!object) {
    notFound();
  }

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(object.checksum);
    setCopiedHash(true);
    toast.success("SHA-256 checksum copied to clipboard");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/files"
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Files Explorer</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0">
            <FileTypeIcon type={object.type} name={object.name} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#F5F7FA]">
              {object.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[#9AA3AF]">
              <span>{formatBytes(object.size)}</span>
              <span>•</span>
              <span>Bucket: {object.bucket}</span>
              <span>•</span>
              <ObjectStatusBadge status={object.status} scheme="4+2" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => toast.info(`Reassembling shards for ${object.name}...`)}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Object permalink copied");
            }}
            className="gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Grid: Properties & Storage Overhead */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Properties */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-2 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              General Metadata
            </span>
            <span className="font-mono">v{object.version}.0</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">MIME Type</span>
            <span className="text-[#F5F7FA] font-mono">{object.mimeType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Created Timestamp</span>
            <span className="text-[#F5F7FA] font-mono">{formatDate(object.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Last Modified</span>
            <span className="text-[#F5F7FA] font-mono">{formatDate(object.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Object UUID</span>
            <span className="text-[#4F7CFF] font-mono">{object.id}</span>
          </div>
        </div>

        {/* Storage Telemetry */}
        <div className="p-4 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-2 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              Storage Footprint
            </span>
            <span className="font-mono text-[#35C98B]">1.50x Overhead</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Logical Payload</span>
            <span className="text-[#F5F7FA] font-mono font-medium">{formatBytes(object.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Physical Allocation</span>
            <span className="text-[#F5F7FA] font-mono font-medium">{formatBytes(object.physicalSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9AA3AF]">Storage Efficiency</span>
            <span className="text-[#E6B65C] font-mono font-semibold">66.7%</span>
          </div>
          <div className="w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden flex mt-2">
            <div className="bg-[#4F7CFF] h-full" style={{ width: "66.7%" }} />
            <div className="bg-[#8D90A0] h-full" style={{ width: "33.3%" }} />
          </div>
        </div>
      </div>

      {/* Shard Topology Visualization */}
      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2229]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4F7CFF]" />
            <h2 className="text-sm font-semibold text-[#F5F7FA]">
              Protection & Shard Topology
            </h2>
          </div>
          <Badge variant="default">Reed-Solomon RS(4+2)</Badge>
        </div>

        <p className="text-xs text-[#9AA3AF]">
          Object is split into 4 data shards and 2 parity shards distributed over 6 distinct hardware storage nodes.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {object.erasureCoding.shards.map((shard) => {
            const isParity = shard.type === "parity";
            return (
              <div
                key={shard.id}
                className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] flex flex-col items-center justify-center text-center space-y-1"
              >
                <span
                  className={`text-sm font-semibold ${
                    isParity ? "text-[#E6B65C]" : "text-[#4F7CFF]"
                  }`}
                >
                  {shard.label}
                </span>
                <span className="text-[11px] text-[#F5F7FA] font-medium">
                  {shard.nodeName}
                </span>
                <span className="text-[10px] text-[#69717D]">
                  {formatBytes(shard.size)}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#35C98B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35C98B]" />
                  <span>Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cryptographic Hash Verification */}
      <div className="p-5 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2229]">
          <span className="flex items-center gap-1.5 text-[#35C98B] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Cryptographic Integrity Guarantee
          </span>
          <span className="font-mono text-[#69717D]">SHA-256</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded bg-[#0C0E11] border border-[#252A31] font-mono text-xs text-[#F5F7FA]">
          <span className="truncate pr-3">{object.checksum}</span>
          <button
            type="button"
            onClick={handleCopyChecksum}
            className="text-[#9AA3AF] hover:text-[#4F7CFF] p-1 rounded hover:bg-[#171A1F] transition-colors"
          >
            {copiedHash ? (
              <Check className="w-4 h-4 text-[#35C98B]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
