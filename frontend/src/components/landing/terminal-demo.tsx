"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const LOG_LINES = [
  { text: "initializing vault cluster [us-east-distributed-mesh]...", delay: 350 },
  { text: "probing node health over mTLS with SPIFFE verification...", delay: 450 },
  { text: "node-a [10.0.1.12:9000] ........ ONLINE (rack-1, us-east-1a)", delay: 300, color: "text-[#35C98B]" },
  { text: "node-b [10.0.1.13:9000] ........ ONLINE (rack-1, us-east-1b)", delay: 300, color: "text-[#35C98B]" },
  { text: "node-c [10.0.1.14:9000] ........ ONLINE (rack-2, us-east-1c)", delay: 300, color: "text-[#35C98B]" },
  { text: "node-d [10.0.2.21:9000] ........ ONLINE (rack-2, us-east-2a)", delay: 300, color: "text-[#35C98B]" },
  { text: "node-e [10.0.2.22:9000] ........ ONLINE (rack-3, us-east-2b)", delay: 300, color: "text-[#E6B65C]" },
  { text: "node-f [10.0.2.23:9000] ........ ONLINE (rack-3, us-east-2c)", delay: 300, color: "text-[#E6B65C]" },
  { text: "", delay: 200 },
  { text: "ingesting object: weights_v4.safetensors [240 MB]...", delay: 450, color: "text-[#4F7CFF]" },
  { text: "allocating Reed-Solomon polynomial: RS(4+2) over GF(2^8)...", delay: 400 },
  { text: "partitioned: 4 data chunks [D1, D2, D3, D4 @ 60.0 MB each]", delay: 350, color: "text-[#5CA9FF]" },
  { text: "synthesized: 2 parity chunks [P1, P2 @ 60.0 MB each]", delay: 350, color: "text-[#E6B65C]" },
  { text: "distributing shards across 3 availability zones in parallel...", delay: 400 },
  { text: "computing hardware-accelerated SHA-256 checksums...", delay: 400 },
  { text: "", delay: 200 },
  { text: "✓ OBJECT PROTECTED — DURABILITY: 99.999999999% (11 9s)", delay: 500, color: "text-[#35C98B] font-bold" },
  { text: "cluster ready for concurrent read/write streams.", delay: 300, color: "text-[#9AA3AF]" },
];

export function TerminalDemo() {
  const [displayedLines, setDisplayedLines] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (displayedLines < LOG_LINES.length) {
      const current = LOG_LINES[displayedLines];
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => prev + 1);
      }, current.delay);
      return () => clearTimeout(timer);
    }
  }, [displayedLines]);

  const handleRestart = () => {
    setDisplayedLines(0);
  };

  const handleCopy = () => {
    const fullText = LOG_LINES.map((l) => (l.text ? `> ${l.text}` : "")).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Terminal output copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#252A31] bg-[#0C0E11] shadow-2xl overflow-hidden font-mono text-xs max-w-3xl mx-auto">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111418] border-b border-[#252A31]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E05D6F]/80" />
            <div className="w-3 h-3 rounded-full bg-[#E6B65C]/80" />
            <div className="w-3 h-3 rounded-full bg-[#35C98B]/80" />
          </div>
          <span className="text-[11px] text-[#69717D] ml-2 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-[#4F7CFF]" /> vault-daemon-cli — us-east-mesh
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-1 rounded text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#1E2023] transition-colors"
            title="Replay terminal output"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#1E2023] transition-colors"
            title="Copy terminal logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#35C98B]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="p-4 sm:p-6 space-y-1.5 min-h-[340px] text-left leading-relaxed overflow-x-auto">
        {LOG_LINES.slice(0, displayedLines).map((line, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {line.text ? (
              <>
                <span className="text-[#4F7CFF] select-none">&gt;</span>
                <span className={line.color || "text-[#9AA3AF]"}>{line.text}</span>
              </>
            ) : (
              <div className="h-2" />
            )}
          </div>
        ))}

        {displayedLines < LOG_LINES.length ? (
          <div className="flex items-center gap-2 text-[#4F7CFF]">
            <span className="select-none">&gt;</span>
            <span className="w-2 h-4 bg-[#4F7CFF] inline-block animate-terminal-blink" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#35C98B] pt-2">
            <span className="select-none">&gt;</span>
            <span className="text-[11px] text-[#69717D]">cluster stream listening on :9000 (gRPC / S3)</span>
            <span className="w-2 h-4 bg-[#35C98B] inline-block animate-terminal-blink ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
