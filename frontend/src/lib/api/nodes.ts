import { StorageNode } from "@/types";
import { mockNodes } from "@/lib/mock-data/nodes";

export const nodesApi = {
  async getNodes(): Promise<StorageNode[]> {
    return [...mockNodes];
  },

  async getNodeById(id: string): Promise<StorageNode | null> {
    const node = mockNodes.find((n) => n.id === id);
    return node || null;
  },
};
