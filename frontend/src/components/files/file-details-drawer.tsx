"use client";

import React, { useState } from "react";
import { VaultObject } from "@/types";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileTypeIcon } from "./file-type-icon";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  HardDrive,
  Info,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface FileDetailsDrawerProps {
  object: VaultObject | null;
  open: boolean;
  onClose: () => void;
}

export function FileDetailsDrawer({
  object,
  open,
  onClose,
}: FileDetailsDrawerProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!object) return null;

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(object.checksum);
    setCopiedHash(true);
    toast.success("SHA-256 checksum copied to clipboard");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = () => {
    toast.info(`Retrieving and reassembling shards for ${object.name}...`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `https://vault.systems/v1/objects/${object.id}`
    );
    toast.success("Presigned object link copied");
  };

  return (
    <Drawer open={open} onClose={onClose} side="right" className="w-full xl:w-[420px]">
      <div className="space-y-5">
        {/* Top File Identity */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0C0E11] border border-[#252A31]">
          <div className="w-10 h-10 rounded bg-[#171A1F] border border-[#252A31] flex items-center justify-center shrink-0">
            <FileTypeIcon type={object.type} name={object.name} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F5F7FA] truncate">
                {object.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-[#9AA3AF]">
                {formatBytes(object.size)}
              </span>
              <span className="text-[#69717D]">•</span>
              <Badge variant="success" dot>
                Healthy (RS 4+2)
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleDownload} className="gap-1.5 h-8">
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
          <Button onClick={handleShare} variant="secondary" className="gap-1.5 h-8">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </Button>
        </div>

        {/* General Properties */}
        <div className="p-3.5 rounded-lg bg-[#111418] border border-[#252A31] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-1 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              General Properties
            </span>
            <span className="font-mono">v{object.version}.0</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Type</span>
            <span className="text-[#F5F7FA] font-medium">{object.type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Bucket</span>
            <span className="font-mono text-[#4F7CFF]">{object.bucket}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Created</span>
            <span className="font-mono text-[#F5F7FA]">{formatDate(object.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Modified</span>
            <span className="font-mono text-[#F5F7FA]">{formatDate(object.updatedAt)}</span>
          </div>
        </div>

        {/* Storage Overhead & Efficiency */}
        <div className="p-3.5 rounded-lg bg-[#111418] border border-[#252A31] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-1 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              Storage Telemetry
            </span>
            <span className="font-mono text-[#35C98B]">1.50x Overhead</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Logical Payload</span>
            <span className="font-mono text-[#F5F7FA] font-medium">
              {formatBytes(object.size)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Physical Footprint</span>
            <span className="font-mono text-[#F5F7FA]">
              {formatBytes(object.physicalSize)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9AA3AF]">Storage Efficiency</span>
            <span className="font-mono text-[#E6B65C] font-semibold">66.7%</span>
          </div>

          {/* Capacity ratio visualizer */}
          <div className="pt-1 space-y-1">
            <div className="w-full bg-[#1E2023] h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-[#4F7CFF] h-full" style={{ width: "66.7%" }} />
              <div className="bg-[#8D90A0] h-full" style={{ width: "33.3%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#69717D]">
              <span>Data: {formatBytes(object.size)}</span>
              <span>Parity: {formatBytes(object.physicalSize - object.size)}</span>
            </div>
          </div>
        </div>

        {/* Protection & Shard Distribution Matrix */}
        <div className="p-3.5 rounded-lg bg-[#111418] border border-[#252A31] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-1 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Protection & Shard Topology
            </span>
            <Badge variant="default">EC 4+2</Badge>
          </div>

          <p className="text-[11px] text-[#9AA3AF]">
            Reed-Solomon RS(4+2) distributed across 6 independent storage hardware nodes.
          </p>

          <div className="grid grid-cols-3 gap-1.5 pt-1 font-mono text-[11px]">
            {object.erasureCoding.shards.map((shard) => {
              const isParity = shard.type === "parity";
              return (
                <div
                  key={shard.id}
                  className="p-2 rounded bg-[#0C0E11] border border-[#252A31] flex flex-col items-center justify-center text-center"
                >
                  <span
                    className={
                      isParity
                        ? "text-[#E6B65C] font-semibold"
                        : "text-[#4F7CFF] font-semibold"
                    }
                  >
                    {shard.label}
                  </span>
                  <span className="text-[10px] text-[#9AA3AF] mt-0.5">
                    {shard.nodeName}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-[#35C98B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35C98B]" />
                    <span>Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cryptographic Integrity */}
        <div className="p-3.5 rounded-lg bg-[#111418] border border-[#252A31] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[#69717D] uppercase font-semibold text-[10px] tracking-wider pb-1 border-b border-[#1E2229]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#35C98B]" />
              Cryptographic Integrity
            </span>
            <span className="font-mono text-[#35C98B]">SHA-256</span>
          </div>

          <div className="space-y-1">
            <span className="text-[#9AA3AF] text-[11px]">Digest Checksum:</span>
            <div className="flex items-center justify-between p-2 rounded bg-[#0C0E11] border border-[#252A31] font-mono text-[11px] text-[#F5F7FA]">
              <span className="truncate pr-2">{object.checksum}</span>
              <button
                type="button"
                onClick={handleCopyChecksum}
                className="text-[#9AA3AF] hover:text-[#4F7CFF] p-1 rounded hover:bg-[#171A1F] transition-colors"
                title="Copy SHA-256 Checksum"
              >
                {copiedHash ? (
                  <Check className="w-3.5 h-3.5 text-[#35C98B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#69717D]">Last Scrub Cycle:</span>
            <span className="text-[#35C98B] font-mono">Verified 12m ago (0 errors)</span>
          </div>
        </div>

        {/* Advanced metadata */}
        <div className="p-3 rounded bg-[#0C0E11] border border-[#1E2229] space-y-1 text-[11px] font-mono text-[#69717D]">
          <div className="flex justify-between">
            <span>Object UUID:</span>
            <span className="text-[#9AA3AF]">{object.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Mime Type:</span>
            <span className="text-[#9AA3AF]">{object.mimeType}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
