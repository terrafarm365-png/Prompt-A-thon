import React from "react";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#252A31]">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-[#171A1F] animate-pulse" />
          <div className="h-3 w-72 rounded bg-[#171A1F] animate-pulse" />
        </div>
      </div>
      <LoadingSkeleton type="cards" />
      <LoadingSkeleton type="table" count={6} />
    </div>
  );
}
