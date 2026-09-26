"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";

export function HeroHeadline() {
  const statements = [
    "Your data doesn't live on one machine.",
    "It lives across a system designed to survive failure.",
  ];

  const statusItems = [
    "6 storage nodes online",
    "4 data shards + 2 parity shards",
    "SHA-256 cryptographic verification active",
    "Autonomous shard healing enabled",
    "Cluster healthy (100% quorum)",
  ];

  const [statementIndex, setStatementIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Transition secondary statement every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setStatementIndex((prev) => (prev + 1) % statements.length);
        setFade(true);
      }, 350);
    }, 4500);

    return () => clearInterval(timer);
  }, [statements.length]);

  // Rotate technical status line every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [statusItems.length]);

  return (
    <div className="space-y-6 text-left max-w-xl">
      {/* 1. Technical Status Typewriter Bar */}
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#111418] border border-[#252A31] text-xs font-mono text-[#9AA3AF] shadow-inner">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35C98B] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35C98B]"></span>
        </span>
        <span className="text-[#69717D]">STATUS:</span>
        <span className="text-[#F5F7FA] font-medium transition-all duration-300">
          {statusItems[statusIndex]}
        </span>
      </div>

      {/* 2. Eyebrow */}
      <div>
        <span className="text-xs font-mono font-semibold tracking-wider text-[#4F7CFF] uppercase flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          DISTRIBUTED OBJECT STORAGE
        </span>
      </div>

      {/* 3. Main Stable Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.08]">
        Storage built for <span className="text-[#4F7CFF] underline decoration-[#4F7CFF]/40 underline-offset-8">resilience.</span>
      </h1>

      {/* 4. Dynamic Secondary Text with Smooth Transition */}
      <div className="h-16 flex items-center">
        <p
          className={`text-base sm:text-lg text-[#9AA3AF] font-medium transition-opacity duration-300 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          {statements[statementIndex]}
        </p>
      </div>

      {/* 5. Subtitle description */}
      <p className="text-xs sm:text-sm text-[#69717D] leading-relaxed">
        Vault partitions every incoming object using Reed-Solomon RS(4+2) erasure coding. Any two physical hardware nodes can fail simultaneously without loss of data or availability.
      </p>

      {/* 6. CTAs */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link href="/register">
          <Button size="lg" className="px-6 gap-2 shadow-[0_0_20px_rgba(79,124,255,0.25)] hover:shadow-[0_0_25px_rgba(79,124,255,0.4)] transition-all">
            <span>Deploy Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/how-it-works">
          <Button variant="secondary" size="lg" className="px-5 border-[#252A31] hover:border-[#4F7CFF]/40 gap-2">
            <span>Explore Architecture</span>
          </Button>
        </Link>
      </div>

      {/* 7. Key Infrastructure Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1E2229] font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#69717D] block">FAULT TOLERANCE</span>
          <span className="text-[#35C98B] font-semibold">2 Node Losses</span>
        </div>
        <div>
          <span className="text-[10px] text-[#69717D] block">STORAGE OVERHEAD</span>
          <span className="text-[#5CA9FF] font-semibold">1.50x (vs 3.00x)</span>
        </div>
        <div>
          <span className="text-[10px] text-[#69717D] block">DURABILITY</span>
          <span className="text-[#F5F7FA] font-semibold">11 Nines (99.999999999%)</span>
        </div>
      </div>
    </div>
  );
}
