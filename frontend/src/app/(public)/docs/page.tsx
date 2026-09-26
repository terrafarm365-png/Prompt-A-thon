"use client";

import React, { useState } from "react";
import { Terminal, BookOpen, Layers, Server, Code, ShieldCheck, Wrench, Settings } from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sidebarNav = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "architecture", title: "Architecture", icon: Layers },
    { id: "storage-model", title: "Storage Model", icon: Server },
    { id: "erasure-coding", title: "Erasure Coding", icon: ShieldCheck },
    { id: "nodes", title: "Nodes & Fleet", icon: Server },
    { id: "api-reference", title: "API Reference", icon: Code },
    { id: "failure-recovery", title: "Failure Recovery", icon: Wrench },
    { id: "integrity", title: "Integrity & Scrub", icon: ShieldCheck },
    { id: "deployment", title: "Deployment", icon: Terminal },
    { id: "configuration", title: "Configuration", icon: Settings },
    { id: "faq", title: "FAQ", icon: BookOpen },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Docs Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-1 select-none">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#69717D] px-3 mb-2">
            DOCUMENTATION
          </div>
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors text-left ${
                  isActive
                    ? "bg-[#171A1F] text-[#4F7CFF] font-semibold border-l-2 border-[#4F7CFF]"
                    : "text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#111418]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Content Area */}
        <article className="md:col-span-9 space-y-6 text-sm text-[#9AA3AF] leading-relaxed">
          {activeSection === "getting-started" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-[#F5F7FA]">
                Getting Started with Vault
              </h1>
              <p>
                Vault is an infrastructure-grade distributed object storage platform designed for zero data loss. It replaces traditional 3x replication with Reed-Solomon RS(4+2) erasure coding, delivering identical resilience at 50% lower raw hardware footprint.
              </p>

              <h2 className="text-lg font-semibold text-[#F5F7FA] pt-4">
                Quickstart Installation
              </h2>
              <p>Install the Vault CLI agent on your workstation or cluster control plane:</p>
              <div className="p-3 rounded bg-[#111418] border border-[#252A31] font-mono text-xs text-[#F5F7FA]">
                curl -sSL https://get.vault.systems | sh
              </div>

              <h2 className="text-lg font-semibold text-[#F5F7FA] pt-4">
                Starting a Local Test Mesh
              </h2>
              <p>
                Launch a 6-node virtual cluster on localhost with an S3-compatible ingress port bound to <code>:9000</code>:
              </p>
              <div className="p-3 rounded bg-[#111418] border border-[#252A31] font-mono text-xs text-[#F5F7FA]">
                vault cluster init --nodes=6 --scheme=4+2
              </div>
            </div>
          )}

          {activeSection === "erasure-coding" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-[#F5F7FA]">
                Erasure Coding: Reed-Solomon RS(4+2)
              </h1>
              <p>
                Vault splits objects into <code>k = 4</code> data blocks and calculates <code>m = 2</code> parity blocks using Vandermonde matrix multiplication over Galois Field <code>GF(2^8)</code>.
              </p>
              <div className="p-4 rounded bg-[#111418] border border-[#252A31] font-mono text-xs text-[#35C98B]">
                Overhead = (4 + 2) / 4 = 1.50x
                <br />
                Usable Efficiency = 4 / 6 = 66.7%
                <br />
                Tolerable Failure Limit = 2 concurrent nodes
              </div>
            </div>
          )}

          {activeSection !== "getting-started" && activeSection !== "erasure-coding" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-[#F5F7FA] capitalize">
                {activeSection.replace("-", " ")}
              </h1>
              <p>
                This section covers {activeSection.replace("-", " ")} configuration specifications, telemetry flags, and runtime constraints. Sample production-ready configuration stubs are provided below.
              </p>
              <div className="p-4 rounded bg-[#111418] border border-[#252A31] font-mono text-xs text-[#9AA3AF]">
                # vault.yaml manifest
                <br />
                cluster_id: &quot;prod-cluster-01&quot;
                <br />
                erasure_coding:
                <br />
                {"  "}data_shards: 4
                <br />
                {"  "}parity_shards: 2
                <br />
                scrub_interval: 168h
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
