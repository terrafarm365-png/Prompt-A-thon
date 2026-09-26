"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Layers,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export function ShardReconstructionVisual() {
  const [phase, setPhase] = useState<"corrupted" | "reconstructing" | "repaired">("corrupted");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "reconstructing") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("repaired");
            return 100;
          }
          return prev + 15;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleStartReconstruction = () => {
    setPhase("reconstructing");
    setProgress(0);
  };

  const handleReset = () => {
    setPhase("corrupted");
    setProgress(0);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111418] border border-[#252A31] space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252A31] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#E6B65C] uppercase tracking-wider font-semibold">
            LIVE RECONSTRUCTION ENGINE
          </span>
          <h3 className="text-base font-bold text-[#F5F7FA]">
            Autonomous Shard Synthesis Pipeline
          </h3>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            Reed-Solomon RS(4+2) Galois Field math reconstructing missing data shards from parity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {phase === "corrupted" && (
            <Button
              onClick={handleStartReconstruction}
              size="sm"
              className="gap-1.5 bg-[#4F7CFF] hover:bg-[#3E6AE1] text-xs font-mono"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Synthesize Missing Shard D2</span>
            </Button>
          )}

          {phase !== "corrupted" && (
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="gap-1.5 border-[#252A31] text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simulate Another Loss</span>
            </Button>
          )}
        </div>
      </div>

      {/* Target Object Context */}
      <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#252A31] flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
        <div>
          <span className="text-[#69717D] text-[10px] block">ACTIVE TARGET OBJECT</span>
          <span className="text-[#F5F7FA] font-bold">models/vision-v3/weights.safetensors</span>
        </div>
        <div>
          <span className="text-[#69717D] text-[10px] block">PAYLOAD SIZE</span>
          <span className="text-[#5CA9FF]">240 MB (60 MB per shard)</span>
        </div>
        <div>
          <span className="text-[#69717D] text-[10px] block">FAULT STATUS</span>
          <Badge
            variant={phase === "repaired" ? "success" : "warning"}
            className="text-[10px]"
          >
            {phase === "corrupted" && "DEGRADED (5/6 AVAILABLE)"}
            {phase === "reconstructing" && "SYNTHESIZING..."}
            {phase === "repaired" && "RESTORED (6/6 HEALTHY)"}
          </Badge>
        </div>
      </div>

      {/* 6 Shard Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* D1 */}
        <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#35C98B]/50 font-mono text-xs text-center space-y-1">
          <div className="flex items-center justify-between text-[#35C98B]">
            <span className="font-bold">D1</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">Node A</span>
          <Badge variant="success" className="text-[9px]">ONLINE</Badge>
        </div>

        {/* D2 (Missing / Rebuilding / Restored) */}
        <div
          className={`p-3.5 rounded-xl font-mono text-xs text-center space-y-1 transition-all ${
            phase === "corrupted"
              ? "bg-[#241518] border border-[#E05D6F] shadow-[0_0_15px_rgba(224,93,111,0.25)]"
              : phase === "reconstructing"
              ? "bg-[#241E15] border border-[#E6B65C] animate-pulse"
              : "bg-[#11241C] border border-[#35C98B]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-bold ${
                phase === "corrupted"
                  ? "text-[#E05D6F]"
                  : phase === "reconstructing"
                  ? "text-[#E6B65C]"
                  : "text-[#35C98B]"
              }`}
            >
              D2
            </span>
            {phase === "corrupted" ? (
              <XCircle className="w-3.5 h-3.5 text-[#E05D6F]" />
            ) : phase === "reconstructing" ? (
              <Wrench className="w-3.5 h-3.5 text-[#E6B65C] animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#35C98B]" />
            )}
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">
            {phase === "repaired" ? "Node G (Spare)" : "Node B"}
          </span>
          <Badge
            variant={
              phase === "corrupted"
                ? "error"
                : phase === "reconstructing"
                ? "warning"
                : "success"
            }
            className="text-[9px]"
          >
            {phase === "corrupted" && "LOST"}
            {phase === "reconstructing" && "REBUILDING"}
            {phase === "repaired" && "RESTORED"}
          </Badge>
        </div>

        {/* D3 */}
        <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#35C98B]/50 font-mono text-xs text-center space-y-1">
          <div className="flex items-center justify-between text-[#35C98B]">
            <span className="font-bold">D3</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">Node C</span>
          <Badge variant="success" className="text-[9px]">ONLINE</Badge>
        </div>

        {/* D4 */}
        <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#35C98B]/50 font-mono text-xs text-center space-y-1">
          <div className="flex items-center justify-between text-[#35C98B]">
            <span className="font-bold">D4</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">Node D</span>
          <Badge variant="success" className="text-[9px]">ONLINE</Badge>
        </div>

        {/* P1 */}
        <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#E6B65C]/50 font-mono text-xs text-center space-y-1">
          <div className="flex items-center justify-between text-[#E6B65C]">
            <span className="font-bold">P1</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">Node E</span>
          <Badge variant="warning" className="text-[9px]">PARITY 1</Badge>
        </div>

        {/* P2 */}
        <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#E6B65C]/50 font-mono text-xs text-center space-y-1">
          <div className="flex items-center justify-between text-[#E6B65C]">
            <span className="font-bold">P2</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#9AA3AF] block">Node F</span>
          <Badge variant="warning" className="text-[9px]">PARITY 2</Badge>
        </div>
      </div>

      {/* Reconstruction Progress Banner */}
      {phase === "reconstructing" && (
        <div className="p-4 rounded-xl bg-[#171A1F] border border-[#4F7CFF] space-y-3 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex justify-between text-[#F5F7FA]">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4F7CFF]" />
              <span>Solving Galois Field GF(2^8) Matrix for missing Shard D2...</span>
            </span>
            <span className="text-[#4F7CFF] font-bold">{progress}%</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between text-[11px] text-[#9AA3AF]">
            <span>Surviving shards gathered: [D1, D3, D4, P1]</span>
            <span>Target: NODE G (Hot Spare)</span>
          </div>
        </div>
      )}

      {/* Final Restored Banner */}
      {phase === "repaired" && (
        <div className="p-4 rounded-xl bg-[#11241C] border border-[#35C98B] flex items-center justify-between flex-wrap gap-3 font-mono text-xs text-[#F5F7FA] animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#35C98B]" />
            <div>
              <span className="text-[#35C98B] font-bold block">
                RECONSTRUCTION VERIFIED • ZERO BYTES LOST
              </span>
              <span className="text-[11px] text-[#9AA3AF]">
                Synthesized 60.0 MB chunk committed to Node G • Checksum valid
              </span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">
            RS(4+2) 100% HEALTHY
          </Badge>
        </div>
      )}
    </div>
  );
}
