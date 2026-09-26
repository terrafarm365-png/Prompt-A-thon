"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowRight,
  Server,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";

interface CinematicStoryProps {
  onScrollToNext: (sceneIndex: number) => void;
  activeScene?: number;
}

export function CinematicStory({ onScrollToNext, activeScene }: CinematicStoryProps) {
  return (
    <div className="relative z-10 w-full text-left">
      {/* ========================================================
          SCENE 01: HERO OPENING (Full Viewport 100vh)
          ======================================================== */}
      <section
        id="scene-0"
        className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        {/* Top Technical HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-[#252A31]/60 pb-3 font-mono text-[11px] text-[#9AA3AF]">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35C98B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35C98B]"></span>
            </span>
            <span className="text-[#F5F7FA] font-bold">CLUSTER: VAULT-01</span>
            <span className="text-[#252A31]">|</span>
            <span className="text-[#35C98B]">06 NODES ONLINE</span>
          </div>

          <div className="flex items-center gap-4">
            <span>PROTECTION: <span className="text-[#4F7CFF] font-semibold">RS(4+2)</span></span>
            <span className="text-[#252A31]">|</span>
            <span>INTEGRITY: <span className="text-[#35C98B] font-semibold">VERIFIED</span></span>
          </div>
        </div>

        {/* Large Editorial Headline */}
        <div className="my-auto space-y-6 max-w-4xl py-12">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold tracking-widest text-[#4F7CFF] uppercase block">
              VAULT DISTRIBUTED OBJECT STORAGE
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-[#F5F7FA] uppercase leading-[0.92]">
              DISTRIBUTED<br />
              STORAGE.<br />
              <span className="text-[#4F7CFF]">BUILT TO</span><br />
              SURVIVE FAILURE.
            </h1>
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-[#9AA3AF] max-w-xl font-normal leading-relaxed">
            Vault distributes, verifies, and recovers your data across independent physical storage nodes using Reed-Solomon RS(4+2) erasure coding.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onScrollToNext(1)}
              className="px-5 py-2.5 rounded-lg bg-[#4F7CFF] hover:bg-[#3E6AE1] text-white text-xs font-mono font-semibold transition-all shadow-[0_0_20px_rgba(79,124,255,0.3)] cursor-pointer flex items-center gap-2"
            >
              <span>Explore Vault</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <Link href="/dashboard">
              <Button
                variant="secondary"
                size="sm"
                className="border-[#252A31] hover:border-[#4F7CFF]/50 text-xs font-mono gap-2"
              >
                <span>Open Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="flex items-center justify-between border-t border-[#252A31]/60 pt-4 font-mono text-[10px] text-[#69717D]">
          <span>SCENE 01 / 11 • CLUSTER ARCHITECTURE</span>
          <span className="animate-pulse">SCROLL TO BEGIN OBJECT PIPELINE ↓</span>
        </div>
      </section>

      {/* ========================================================
          SCENE 02: DATA ENTERS VAULT (100vh)
          ======================================================== */}
      <section
        id="scene-1"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <Badge variant="default" className="font-mono text-[10px]">
              SCENE 02 • INGESTION
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              YOUR DATA<br />
              ENTERS HERE.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] max-w-md leading-relaxed">
              Objects arrive over high-throughput gRPC or S3-compatible APIs. Payloads are buffered directly into zero-copy memory registers without disk bottlenecking.
            </p>
          </div>

          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111418]/90 backdrop-blur-xl border border-[#252A31] shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#252A31] text-[10px] text-[#69717D]">
              <span>INGRESS TELEMETRY</span>
              <span className="text-[#35C98B]">● STREAMING</span>
            </div>

            <div className="space-y-1.5 text-[#9AA3AF]">
              <div>&gt; RECEIVING OBJECT: <span className="text-[#F5F7FA] font-bold">project.zip</span></div>
              <div>&gt; PAYLOAD SIZE: <span className="text-[#4F7CFF] font-semibold">200 MB</span></div>
              <div>&gt; TRANSPORT: <span className="text-[#35C98B]">TLS 1.3 / mTLS SPIFFE</span></div>
              <div>&gt; TARGET BUFFER: <span className="text-[#F5F7FA]">VAULT_CORE_DMA_0</span></div>
            </div>

            <div className="p-2.5 rounded bg-[#0C0E11] border border-[#252A31] text-[#35C98B] flex items-center justify-between text-[11px]">
              <span>✓ OBJECT RECEIVED BY CORE</span>
              <span>100% BUFFERED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 03: DATA IS SPLIT & ENCODED (100vh)
          ======================================================== */}
      <section
        id="scene-2"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-8 max-w-3xl">
          <div className="space-y-3">
            <Badge variant="default" className="font-mono text-[10px]">
              SCENE 03 • MATHEMATICAL STRIPING
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              ONE OBJECT.<br />
              SIX PROTECTED SHARDS.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
              Vault slices the 200 MB payload into 4 data shards (50 MB each) and evaluates Cauchy distribution matrices over Galois Field GF(2^8) to generate 2 mathematical parity shards.
            </p>
          </div>

          {/* 6 Shard Cards Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
            {["D1", "D2", "D3", "D4"].map((s) => (
              <div key={s} className="p-3 rounded-xl bg-[#111A2B] border border-[#4F7CFF] text-center space-y-1 shadow-lg">
                <span className="font-bold text-[#5CA9FF] block text-sm">{s}</span>
                <span className="text-[10px] text-[#9AA3AF] block uppercase">Data</span>
                <span className="text-[10px] text-[#F5F7FA] block font-semibold">50 MB</span>
              </div>
            ))}
            {["P1", "P2"].map((p) => (
              <div key={p} className="p-3 rounded-xl bg-[#241E15] border border-[#E6B65C] text-center space-y-1 shadow-lg">
                <span className="font-bold text-[#E6B65C] block text-sm">{p}</span>
                <span className="text-[10px] text-[#9AA3AF] block uppercase">Parity</span>
                <span className="text-[10px] text-[#F5F7FA] block font-semibold">50 MB</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#111418] border border-[#252A31] font-mono text-xs text-[#9AA3AF] flex items-center justify-between">
            <span>STORAGE OVERHEAD: <strong className="text-[#35C98B]">1.50x</strong> (vs 3.00x in traditional 3-way replication)</span>
            <span className="text-[#4F7CFF] font-semibold">66.7% USABLE EFFICIENCY</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 04: DISTRIBUTION ACROSS MESH (100vh)
          ======================================================== */}
      <section
        id="scene-3"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <Badge variant="default" className="font-mono text-[10px]">
              SCENE 04 • CONCURRENT ROUTING
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              NO SINGLE<br />
              POINT OF FAILURE.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed max-w-xl">
              All six shards stream concurrently across isolated power circuits, physical top-of-rack switches, and distinct geographic availability zones.
            </p>
          </div>

          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111418]/90 backdrop-blur-xl border border-[#252A31] shadow-2xl font-mono text-xs space-y-2">
            <span className="text-[10px] text-[#69717D] uppercase tracking-wider block pb-1 border-b border-[#252A31]">
              ISOLATED TOPOLOGY DISPATCH
            </span>
            <div className="flex justify-between py-1 text-[#9AA3AF]">
              <span>D1 → NODE A</span>
              <span className="text-[#35C98B]">STORED (us-east-1a)</span>
            </div>
            <div className="flex justify-between py-1 text-[#9AA3AF]">
              <span>D2 → NODE B</span>
              <span className="text-[#35C98B]">STORED (us-east-1b)</span>
            </div>
            <div className="flex justify-between py-1 text-[#9AA3AF]">
              <span>D3 → NODE C</span>
              <span className="text-[#35C98B]">STORED (us-east-1c)</span>
            </div>
            <div className="flex justify-between py-1 text-[#9AA3AF]">
              <span>D4 → NODE D</span>
              <span className="text-[#35C98B]">STORED (us-east-2a)</span>
            </div>
            <div className="flex justify-between py-1 text-[#E6B65C]">
              <span>P1 → NODE E</span>
              <span className="text-[#35C98B]">STORED (us-east-2b)</span>
            </div>
            <div className="flex justify-between py-1 text-[#E6B65C]">
              <span>P2 → NODE F</span>
              <span className="text-[#35C98B]">STORED (us-east-2c)</span>
            </div>

            <div className="pt-2 text-center text-[#35C98B] font-bold border-t border-[#252A31] text-[11px]">
              ✓ ALL 6 SHARDS SECURELY COMMITTED
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 05: NODE FAILURE (100vh)
          ======================================================== */}
      <section
        id="scene-4"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-6 max-w-3xl">
          <Badge variant="error" dot className="font-mono text-[10px]">
            SCENE 05 • DISRUPTIVE SIMULATION
          </Badge>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
            WHAT HAPPENS<br />
            WHEN A NODE FAILS?<br />
            <span className="text-[#35C98B]">NOTHING STOPS.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
            In physical data centers, SSDs burn out, power supplies trip, and backplanes disconnect. In Vault, when Node C abruptly powers off, surviving nodes reconstruct data transparently.
          </p>

          <div className="p-4 rounded-xl bg-[#201316] border border-[#E05D6F] flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#E05D6F] shrink-0 animate-pulse" />
              <div>
                <span className="text-[#E05D6F] font-bold block">
                  NODE C: OFFLINE — POWER CONNECTION LOST
                </span>
                <span className="text-[11px] text-[#9AA3AF]">
                  Shard D3 unavailable • Remaining 5 shards online • Client reads uninterrupted
                </span>
              </div>
            </div>
            <Badge variant="error" className="font-mono text-xs">
              0 BYTES LOST
            </Badge>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 06: GALOIS FIELD RECONSTRUCTION (100vh)
          ======================================================== */}
      <section
        id="scene-5"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <Badge variant="warning" dot className="font-mono text-[10px]">
              SCENE 06 • AUTONOMOUS SYNTHESIS
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              GALOIS FIELD<br />
              RECONSTRUCTION.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed max-w-xl">
              Surviving shards emit linear equations into the background reconstruction engine. Matrix inversion solves for the missing variable D3 without touching client bandwidth.
            </p>
          </div>

          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111418]/90 backdrop-blur-xl border border-[#252A31] shadow-2xl font-mono text-xs space-y-3">
            <span className="text-[10px] text-[#69717D] uppercase tracking-wider block pb-1 border-b border-[#252A31]">
              SHARD SYNTHESIS MATRIX
            </span>

            <div className="grid grid-cols-6 gap-1 text-center font-bold">
              <span className="p-2 rounded bg-[#111A2B] text-[#5CA9FF]">D1 ✓</span>
              <span className="p-2 rounded bg-[#111A2B] text-[#5CA9FF]">D2 ✓</span>
              <span className="p-2 rounded bg-[#291418] text-[#E05D6F] line-through">D3 ✕</span>
              <span className="p-2 rounded bg-[#111A2B] text-[#5CA9FF]">D4 ✓</span>
              <span className="p-2 rounded bg-[#241E15] text-[#E6B65C]">P1 ✓</span>
              <span className="p-2 rounded bg-[#241E15] text-[#E6B65C]">P2 ✓</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C0E11] border border-[#252A31] space-y-1">
              <div className="text-[#E6B65C] font-semibold">&gt; SOLVING POLYNOMIAL OVER GF(2^8)...</div>
              <div className="text-[#35C98B]">&gt; D3 RESTORED: 52,428,800 BYTES SYNTHESIZED</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 07: AUTOMATIC REPAIR TO NODE G (100vh)
          ======================================================== */}
      <section
        id="scene-6"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-6 max-w-3xl">
          <Badge variant="success" dot className="font-mono text-[10px]">
            SCENE 07 • SELF-HEALING
          </Badge>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
            AUTOMATIC<br />
            REPAIR.
          </h2>

          <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
            The cluster assigns hot-spare <strong className="text-[#F5F7FA]">Node G</strong>. The reconstructed D3 shard is committed to its NVMe partition over encrypted internal mTLS. Full 6/6 quorum is restored automatically.
          </p>

          <div className="p-4 rounded-xl bg-[#11241C] border border-[#35C98B] flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-[#35C98B]" />
              <div>
                <span className="text-[#35C98B] font-bold block">
                  FAILOVER COMPLETE → NODE G ONLINE
                </span>
                <span className="text-[11px] text-[#9AA3AF]">
                  06 Nodes Active • Zero manual intervention required
                </span>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              100% HEALTHY
            </Badge>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 08: INTEGRITY VERIFICATION (100vh)
          ======================================================== */}
      <section
        id="scene-7"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-6 max-w-3xl">
          <Badge variant="default" className="font-mono text-[10px]">
            SCENE 08 • CONTINUOUS SCRUB
          </Badge>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
            SILENT BIT ROT<br />
            ELIMINATED.
          </h2>

          <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
            Cosmic rays, hardware aging, and disk firmware glitches cause silent corruption in legacy systems. Vault runs continuous background cryptographic scrubs against SHA-256 digests.
          </p>

          <div className="p-4 rounded-xl bg-[#0C0E11] border border-[#252A31] font-mono text-xs space-y-2 max-w-xl">
            <div className="flex justify-between text-[#69717D]">
              <span>CHECKSUM VERIFICATION</span>
              <span className="text-[#35C98B]">VALIDATED</span>
            </div>
            <div className="text-[#4F7CFF] truncate">
              HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
            <div className="text-[11px] text-[#35C98B]">
              ✓ ALL PHYSICAL SECTORS CONFIRMED FAULTLESS
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 09: SYSTEM SCALE (100vh)
          ======================================================== */}
      <section
        id="scene-8"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-8 max-w-4xl">
          <div className="space-y-3">
            <Badge variant="default" className="font-mono text-[10px]">
              SCENE 09 • CLUSTER HORIZON
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              ONE OBJECT IS SIMPLE.<br />
              <span className="text-[#4F7CFF]">A DISTRIBUTED SYSTEM</span> IS NOT.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
              When scaling to billions of objects, deterministic sharding rings eliminate the bottleneck of monolithic metadata servers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] space-y-1">
              <span className="text-[10px] text-[#69717D] uppercase block">RAW CAPACITY</span>
              <span className="text-2xl font-bold text-[#F5F7FA]">12 TB</span>
              <span className="text-[11px] text-[#35C98B] block">8 TB Usable</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] space-y-1">
              <span className="text-[10px] text-[#69717D] uppercase block">ACTIVE NODES</span>
              <span className="text-2xl font-bold text-[#4F7CFF]">06</span>
              <span className="text-[11px] text-[#9AA3AF] block">3 Regions</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] space-y-1">
              <span className="text-[10px] text-[#69717D] uppercase block">STORED OBJECTS</span>
              <span className="text-2xl font-bold text-[#F5F7FA]">12,482</span>
              <span className="text-[11px] text-[#9AA3AF] block">0 Corrupted</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111418] border border-[#252A31] space-y-1">
              <span className="text-[10px] text-[#69717D] uppercase block">FLEET HEALTH</span>
              <span className="text-2xl font-bold text-[#35C98B]">100%</span>
              <span className="text-[11px] text-[#35C98B] block">Quorum Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 10: 3D ARCHITECTURE STACK (110vh)
          ======================================================== */}
      <section
        id="scene-9"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="space-y-8 max-w-4xl">
          <div className="space-y-3">
            <Badge variant="default" className="font-mono text-[10px]">
              SCENE 10 • VERTICAL TIERS
            </Badge>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] uppercase leading-tight">
              THE VAULT ENGINE.
            </h2>

            <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
              Six modular tiers designed for isolation, zero-copy performance, and horizontal scalability.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#111418] border border-[#4F7CFF] flex items-center justify-between">
              <div>
                <span className="text-[#4F7CFF] font-bold block">01. CLIENT SDK TIER</span>
                <span className="text-[#9AA3AF] text-[11px]">AWS S3 API • MinIO • Python boto3 • Rust • Go</span>
              </div>
              <Badge variant="default" className="text-[10px]">L4/L7 INGRESS</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111418] border border-[#252A31] flex items-center justify-between">
              <div>
                <span className="text-[#F5F7FA] font-bold block">02. STATELESS API GATEWAYS</span>
                <span className="text-[#9AA3AF] text-[11px]">TLS 1.3 termination • IAM token validation • mTLS proxy</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">&lt; 0.8ms LATENCY</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111418] border border-[#252A31] flex items-center justify-between">
              <div>
                <span className="text-[#F5F7FA] font-bold block">03. RAFT METADATA RING</span>
                <span className="text-[#9AA3AF] text-[11px]">Zero single point of failure • Deterministic shard location hashes</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">3-NODE RAFT</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111418] border border-[#252A31] flex items-center justify-between">
              <div>
                <span className="text-[#35C98B] font-bold block">04. REED-SOLOMON ENGINE</span>
                <span className="text-[#9AA3AF] text-[11px]">Cauchy distribution matrix • AVX-512 SIMD Galois Field GF(2^8)</span>
              </div>
              <Badge variant="success" className="text-[10px]">8.4 GB/S PER CORE</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111418] border border-[#252A31] flex items-center justify-between">
              <div>
                <span className="text-[#F5F7FA] font-bold block">05. STORAGE NODE FLEET</span>
                <span className="text-[#9AA3AF] text-[11px]">Linux io_uring kernel bypass • Direct NVMe/SATA block partitions</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">mTLS SPIFFE</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 11: DASHBOARD REVEAL & FINAL CALL TO ACTION (100vh)
          ======================================================== */}
      <section
        id="scene-10"
        className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto pointer-events-auto"
      >
        <div className="my-auto space-y-8 max-w-4xl py-12">
          <Badge variant="success" dot className="font-mono text-[10px]">
            SCENE 11 • CONSOLE TELEMETRY
          </Badge>

          <h2 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-[#F5F7FA] uppercase leading-[0.92]">
            BUILD FOR FAILURE.<br />
            <span className="text-[#4F7CFF]">BUILD WITH VAULT.</span>
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#9AA3AF] max-w-xl font-normal leading-relaxed">
            Everything underneath Vault—from raw disk sector health to active Reed-Solomon reconstruction pipelines—visible in one high-density operator console.
          </p>

          <div className="p-6 rounded-2xl bg-[#111418] border border-[#252A31] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#F5F7FA] flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-[#4F7CFF]" />
                VAULT OPERATOR CONSOLE READY
              </span>
              <span className="text-[11px] font-mono text-[#69717D]">
                Cluster namespace: prod-cluster-01 • 6 Storage Nodes Online
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="px-6 gap-2 shadow-[0_0_20px_rgba(79,124,255,0.3)]">
                  <span>Open Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg" className="px-6 border-[#252A31]">
                  Deploy Cluster
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="border-t border-[#252A31]/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#69717D]">
          <span>© 2026 VAULT DISTRIBUTED SYSTEMS INC.</span>
          <div className="flex items-center gap-4">
            <Link href="/architecture" className="hover:text-[#F5F7FA] transition-colors">Architecture</Link>
            <Link href="/how-it-works" className="hover:text-[#F5F7FA] transition-colors">How It Works</Link>
            <Link href="/docs" className="hover:text-[#F5F7FA] transition-colors">Documentation</Link>
            <Link href="/privacy" className="hover:text-[#F5F7FA] transition-colors">Privacy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
