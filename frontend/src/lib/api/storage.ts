import { StorageMetrics } from "@/types";
import { mockStorageMetrics } from "@/lib/mock-data/storage";

export const storageApi = {
  async getStorageMetrics(): Promise<StorageMetrics> {
    return { ...mockStorageMetrics };
  },
};
