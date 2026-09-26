import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export const metadata = {
  title: "System Status",
  description: "Live operational status of Vault services and cluster subsystems.",
};

export default function StatusPage() {
  const services = [
    { name: "API Gateway (S3 / gRPC)", status: "operational", uptime: "99.99%" },
    { name: "Object Storage Engine", status: "operational", uptime: "100.0%" },
    { name: "Metadata Directory Ring", status: "operational", uptime: "99.99%" },
    { name: "Storage Nodes Fleet", status: "operational", uptime: "100.0%" },
    { name: "Upload Ingress Pipeline", status: "operational", uptime: "99.98%" },
    { name: "Download Shard Assembly", status: "operational", uptime: "100.0%" },
    { name: "Autonomous Repair Service", status: "operational", uptime: "99.95%" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      {/* Overall Status Banner */}
      <div className="p-6 rounded-xl bg-[#111418] border border-[#35C98B]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#35C98B]/10 border border-[#35C98B]/30 flex items-center justify-center text-[#35C98B]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#F5F7FA]">
              All Core Infrastructure Services Operational
            </h1>
            <p className="text-xs text-[#9AA3AF]">
              All 6 storage nodes reporting healthy heartbeat leases across US-East cluster.
            </p>
          </div>
        </div>

        <Badge variant="success" dot>
          Normal Operation
        </Badge>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#69717D]">
          Subsystem Status Matrix
        </h2>

        <div className="divide-y divide-[#1E2229] rounded-lg border border-[#252A31] bg-[#111418] overflow-hidden">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="p-4 flex items-center justify-between text-xs hover:bg-[#14171D] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#35C98B]" />
                <span className="font-medium text-[#F5F7FA]">{svc.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-[#69717D] hidden sm:inline">
                  {svc.uptime} 90d uptime
                </span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident History */}
      <div className="p-6 rounded-lg bg-[#111418] border border-[#252A31] space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8D90A0]" />
          Past Incident History
        </h3>
        <p className="text-[#9AA3AF]">
          No major service disruptions or quorum degradation events recorded in the past 90 days.
        </p>
      </div>
    </div>
  );
}
