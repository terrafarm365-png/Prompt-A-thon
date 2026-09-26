"use client";

import React from "react";
import { mockStorageMetrics } from "@/lib/mock-data/storage";
import { StorageOverview } from "@/components/storage/storage-overview";
import { Database } from "lucide-react";

export default function StoragePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
            Storage & Durability Analytics
          </h1>
          <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#4F7CFF] font-mono text-xs border border-[#252A31] flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            12.0 TB Total Mesh
          </span>
        </div>
        <p className="text-xs text-[#9AA3AF] mt-0.5">
          Logical object ingestion, physical Reed-Solomon parity consumption, and historical storage growth.
        </p>
      </div>

      <StorageOverview metrics={mockStorageMetrics} />
    </div>
  );
}
