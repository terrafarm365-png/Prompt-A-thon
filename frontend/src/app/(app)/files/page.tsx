"use client";

import React, { useState } from "react";
import { mockObjects } from "@/lib/mock-data/objects";
import { FileTable } from "@/components/files/file-table";
import { UploadDialog } from "@/components/files/upload-dialog";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { VaultObject } from "@/types";

export default function FilesPage() {
  const [objects, setObjects] = useState<VaultObject[]>(mockObjects);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleDelete = (id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUploadSuccess = () => {
    // When a mock upload completes, we can add a new object to state
    const newFile: VaultObject = {
      id: `obj-${Date.now()}`,
      name: "runtime-deployment.tar.gz",
      size: 157286400,
      physicalSize: 235929600,
      type: "Archive",
      mimeType: "application/gzip",
      status: "healthy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      bucket: "vault-prod-east1",
      checksum: "0a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef",
      erasureCoding: {
        scheme: "RS(4+2)",
        dataShards: 4,
        parityShards: 2,
        shards: [
          { id: `s1-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "verified", status: "healthy", size: 39321600 },
          { id: `s2-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "verified", status: "healthy", size: 39321600 },
          { id: `s3-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "verified", status: "healthy", size: 39321600 },
          { id: `s4-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "verified", status: "healthy", size: 39321600 },
          { id: `s5-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "verified", status: "healthy", size: 39321600 },
          { id: `s6-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "verified", status: "healthy", size: 39321600 },
        ],
      },
    };
    setObjects((prev) => [newFile, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
              Object Storage Explorer
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#171A1F] text-[#35C98B] font-mono text-xs border border-[#252A31] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              RS(4+2) Protected
            </span>
          </div>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            Distributed files, models, and datasets across the US-East cluster mesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info("New bucket prefix virtual namespace created")}
            className="gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#9AA3AF]" />
            <span>New Folder</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Object</span>
          </Button>
        </div>
      </div>

      {/* Main File Table */}
      <FileTable objects={objects} onDelete={handleDelete} />

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadSuccess}
      />
    </div>
  );
}
