import { VaultObject } from "@/types";
import { mockObjects } from "@/lib/mock-data/objects";

export interface GetObjectsParams {
  search?: string;
  bucket?: string;
  status?: string;
  sortBy?: "name" | "size" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export const objectsApi = {
  async getObjects(params?: GetObjectsParams): Promise<VaultObject[]> {
    // In production, this will invoke: await fetch(`/api/v1/objects?...`)
    let results = [...mockObjects];

    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((o) =>
        o.name.toLowerCase().includes(q) || o.type.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== "all") {
      results = results.filter((o) => o.status === params.status);
    }

    if (params?.sortBy) {
      results.sort((a, b) => {
        if (params.sortBy === "name") {
          return params.sortOrder === "desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        if (params.sortBy === "size") {
          return params.sortOrder === "desc" ? b.size - a.size : a.size - b.size;
        }
        if (params.sortBy === "updatedAt") {
          return params.sortOrder === "desc"
            ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        return 0;
      });
    }

    return results;
  },

  async getObjectById(id: string): Promise<VaultObject | null> {
    const obj = mockObjects.find((o) => o.id === id);
    return obj || null;
  },

  async simulateUpload(file: { name: string; size: number; type: string }): Promise<VaultObject> {
    const newObj: VaultObject = {
      id: `obj-${Date.now()}`,
      name: file.name,
      size: file.size,
      physicalSize: Math.round(file.size * 1.5),
      type: file.type || "Binary Data",
      mimeType: file.type || "application/octet-stream",
      status: "healthy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      bucket: "vault-prod-east1",
      checksum: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      erasureCoding: {
        scheme: "RS(4+2)",
        dataShards: 4,
        parityShards: 2,
        shards: [
          { id: `sh-d1-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
          { id: `sh-d2-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
          { id: `sh-d3-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
          { id: `sh-d4-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
          { id: `sh-p1-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
          { id: `sh-p2-${Date.now()}`, objectId: `obj-${Date.now()}`, type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "verified", status: "healthy", size: Math.round(file.size / 4) },
        ],
      },
    };
    return newObj;
  },

  async deleteObject(_id: string): Promise<boolean> {
    return !!_id;
  },
};
