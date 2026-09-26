"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import { objectsApi } from "@/lib/api/objects";
import {
  UploadCloud,
  AlertCircle,
  FileArchive,
  X,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

type UploadState = "idle" | "selected" | "uploading" | "success" | "error";

interface ShardItem {
  id: string;
  type: "data" | "parity";
  node: string;
  status: "pending" | "chunked" | "encoded" | "transferred" | "verified";
}

const INITIAL_SHARDS: ShardItem[] = [
  { id: "D1", type: "data", node: "Node A", status: "pending" },
  { id: "D2", type: "data", node: "Node B", status: "pending" },
  { id: "D3", type: "data", node: "Node C", status: "pending" },
  { id: "D4", type: "data", node: "Node D", status: "pending" },
  { id: "P1", type: "parity", node: "Node E", status: "pending" },
  { id: "P2", type: "parity", node: "Node F", status: "pending" },
];

export function UploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [subStage, setSubStage] = useState<
    "uploading" | "chunking" | "encoding" | "distributing" | "verifying" | "protected"
  >("uploading");
  const [statusMessage, setStatusMessage] = useState("");
  const [shards, setShards] = useState<ShardItem[]>(INITIAL_SHARDS);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setState("selected");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setState("selected");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startUpload = async () => {
    if (!file) return;

    setState("uploading");
    setShards(INITIAL_SHARDS);

    // 1. UPLOADING
    setSubStage("uploading");
    setStatusMessage(`Streaming ${file.name} to Vault Ingress Gateway...`);
    setProgress(18);
    await new Promise((r) => setTimeout(r, 600));

    // 2. CHUNKING (D1, D2, D3, D4)
    setSubStage("chunking");
    setStatusMessage("Chunking payload into 4 discrete data blocks (D1, D2, D3, D4)...");
    setProgress(38);
    setShards((prev) =>
      prev.map((s) => (s.type === "data" ? { ...s, status: "chunked" } : s))
    );
    await new Promise((r) => setTimeout(r, 650));

    // 3. ENCODING (P1, P2)
    setSubStage("encoding");
    setStatusMessage("Evaluating Reed-Solomon Galois Field GF(2^8) for parity (P1, P2)...");
    setProgress(58);
    setShards((prev) =>
      prev.map((s) => ({ ...s, status: "encoded" }))
    );
    await new Promise((r) => setTimeout(r, 700));

    // 4. DISTRIBUTING (Node A - F)
    setSubStage("distributing");
    setStatusMessage("Parallel streaming shards across 6 independent storage nodes...");
    setProgress(80);
    setShards((prev) =>
      prev.map((s) => ({ ...s, status: "transferred" }))
    );
    await new Promise((r) => setTimeout(r, 750));

    // 5. VERIFYING (SHA-256)
    setSubStage("verifying");
    setStatusMessage("Computing cryptographic SHA-256 checksums across storage fleet...");
    setProgress(95);
    setShards((prev) =>
      prev.map((s) => ({ ...s, status: "verified" }))
    );
    await new Promise((r) => setTimeout(r, 600));

    // 6. PROTECTED
    try {
      await objectsApi.simulateUpload({
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      });

      setProgress(100);
      setSubStage("protected");
      setState("success");
      setStatusMessage("Object sealed. 6/6 shards verified. 99.999999999% durability active.");
      toast.success(`${file.name} successfully protected across cluster`);
      onUploadComplete?.();
    } catch {
      setState("error");
      setStatusMessage("Failed to allocate shards across cluster nodes.");
      toast.error("Upload failed: Cluster quorum unreachable");
    }
  };

  const resetDialog = () => {
    setFile(null);
    setState("idle");
    setProgress(0);
    setSubStage("uploading");
    setStatusMessage("");
    setShards(INITIAL_SHARDS);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogClose onClose={handleClose} />
      <DialogHeader>
        <DialogTitle className="text-base sm:text-lg">Upload Object to Cluster</DialogTitle>
        <DialogDescription>
          Files are partitioned into 4 data shards and 2 parity shards using Reed-Solomon RS(4+2).
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {state === "idle" && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-[#252A31] hover:border-[#4F7CFF]/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#111418]/60 group"
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-[#171A1F] border border-[#252A31] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6 text-[#4F7CFF]" />
            </div>
            <p className="text-xs font-medium text-[#F5F7FA] mb-1">
              Click to select or drag and drop object here
            </p>
            <p className="text-[11px] text-[#69717D]">
              Supports all binary formats, AI models, archives, and dataset blobs
            </p>
            <input
              id="file-upload-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {state === "selected" && file && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-[#252A31] bg-[#111418] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileArchive className="w-6 h-6 text-[#4F7CFF] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F5F7FA] truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#9AA3AF]">
                    {formatBytes(file.size)} • Logical Payload
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetDialog}
                className="p-1 rounded text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Erasure Coding Pipeline Preview */}
            <div className="p-3.5 rounded-xl bg-[#0C0E11] border border-[#252A31] space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#9AA3AF]">Erasure Target:</span>
                <Badge variant="default" className="text-[10px]">Reed-Solomon RS(4+2)</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9AA3AF]">Physical Allocation:</span>
                <span className="text-[#F5F7FA]">
                  {formatBytes(file.size * 1.5)} (1.50x overhead)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9AA3AF]">Target Nodes:</span>
                <span className="text-[#35C98B]">
                  6 Isolated Racks (Nodes A–F)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SIGNATURE VAULT INTERACTION: UPLOAD -> CHUNK -> ENCODE -> DISTRIBUTE -> VERIFY -> PROTECT */}
        {state === "uploading" && (
          <div className="space-y-5 py-2">
            {/* Step indicator pills */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono overflow-x-auto pb-1">
              <span className={`px-2 py-0.5 rounded ${subStage === "uploading" ? "bg-[#4F7CFF] text-white" : "text-[#69717D]"}`}>
                UPLOAD
              </span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded ${subStage === "chunking" ? "bg-[#4F7CFF] text-white" : "text-[#69717D]"}`}>
                CHUNK
              </span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded ${subStage === "encoding" ? "bg-[#E6B65C] text-black" : "text-[#69717D]"}`}>
                ENCODE
              </span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded ${subStage === "distributing" ? "bg-[#4F7CFF] text-white" : "text-[#69717D]"}`}>
                DISTRIBUTE
              </span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded ${subStage === "verifying" ? "bg-[#35C98B] text-black" : "text-[#69717D]"}`}>
                VERIFY
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#F5F7FA] font-medium">{statusMessage}</span>
                <span className="text-[#4F7CFF] font-bold">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* 6 Shard Status Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
              {shards.map((s) => {
                const isParity = s.type === "parity";
                const isDone = s.status === "verified";
                const isTransferred = s.status === "transferred" || isDone;

                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isDone
                        ? "border-[#35C98B] bg-[#11241C] text-[#35C98B]"
                        : isTransferred
                        ? isParity
                          ? "border-[#E6B65C] bg-[#241E15] text-[#E6B65C]"
                          : "border-[#4F7CFF] bg-[#111A2B] text-[#5CA9FF]"
                        : "border-[#252A31] bg-[#14171D] text-[#69717D]"
                    }`}
                  >
                    <div className="font-bold">{s.id}</div>
                    <div className="text-[10px] text-[#9AA3AF] mt-0.5">{s.node}</div>
                    <div className="text-[9px] uppercase mt-1">
                      {s.status === "pending" ? "Queued" : s.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="p-6 rounded-xl border border-[#35C98B]/40 bg-[#11241C]/50 text-center space-y-3 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-[#183627] border border-[#35C98B] flex items-center justify-center mx-auto text-[#35C98B]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#F5F7FA]">
              ✓ OBJECT PROTECTED
            </h4>
            <p className="text-xs text-[#9AA3AF] max-w-sm mx-auto leading-relaxed">
              {file?.name} has been partitioned, encoded with Reed-Solomon RS(4+2), distributed to 6 storage nodes, and cryptographically verified.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0C0E11] border border-[#252A31] font-mono text-xs text-[#35C98B]">
              <span>DURABILITY GUARANTEED: 99.999999999%</span>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="p-6 rounded-xl border border-[#E05D6F]/40 bg-[#291418]/50 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-[#E05D6F] mx-auto" />
            <h4 className="text-sm font-semibold text-[#F5F7FA]">
              Upload Transmission Failed
            </h4>
            <p className="text-xs text-[#9AA3AF]">{statusMessage}</p>
          </div>
        )}
      </div>

      <DialogFooter>
        {state === "idle" && (
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        )}

        {state === "selected" && (
          <>
            <Button variant="ghost" onClick={resetDialog}>
              Select Different File
            </Button>
            <Button onClick={startUpload} className="gap-2">
              <Share2 className="w-4 h-4" />
              <span>Begin RS(4+2) Distribution</span>
            </Button>
          </>
        )}

        {state === "uploading" && (
          <Button disabled className="cursor-not-allowed opacity-60">
            Synthesizing Shards...
          </Button>
        )}

        {(state === "success" || state === "error") && (
          <Button onClick={handleClose}>
            Close Console
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
