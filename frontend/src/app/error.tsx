"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cluster Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-4 p-8 rounded-xl bg-[#111418] border border-[#E05D6F]/30">
        <div className="w-12 h-12 rounded-full bg-[#E05D6F]/10 border border-[#E05D6F]/25 flex items-center justify-center text-[#E05D6F] mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-base font-semibold text-[#F5F7FA]">
          Cluster Gateway Exception
        </h1>
        <p className="text-xs text-[#9AA3AF] leading-relaxed">
          An unexpected error occurred during frontend telemetry rendering or shard synchronization.
        </p>

        {error.digest && (
          <div className="font-mono text-[10px] text-[#69717D] p-2 bg-[#0C0E11] rounded border border-[#252A31]">
            Digest: {error.digest}
          </div>
        )}

        <div className="pt-2">
          <Button onClick={() => reset()} className="gap-2 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Cluster Connection</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
