import React from "react";
import Link from "next/link";
import { VaultLogo } from "@/components/layout/vault-logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HardDrive } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col justify-between p-6">
      <div className="w-full max-w-6xl mx-auto">
        <VaultLogo showText={true} />
      </div>

      <div className="w-full max-w-md mx-auto text-center space-y-4 my-auto p-8 rounded-xl bg-[#111418] border border-[#252A31]">
        <div className="w-12 h-12 rounded-full bg-[#171A1F] border border-[#252A31] flex items-center justify-center text-[#4F7CFF] mx-auto">
          <HardDrive className="w-6 h-6" />
        </div>
        <div className="font-mono text-3xl font-bold text-[#F5F7FA]">404</div>
        <h1 className="text-base font-semibold text-[#F5F7FA]">
          Object or Partition Not Found
        </h1>
        <p className="text-xs text-[#9AA3AF] leading-relaxed">
          The requested route, object locator, or cluster node telemetry could not be resolved by the sharding gateway.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5">
              <span>Go to Console</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto text-center text-[11px] font-mono text-[#69717D]">
        Vault Distributed Mesh Error Handler • 0x404_SHARD_NONEXISTENT
      </div>
    </div>
  );
}
