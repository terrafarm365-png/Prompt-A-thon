import { RepairTask } from "@/types";
import { mockRepairs } from "@/lib/mock-data/repairs";

export const repairsApi = {
  async getRepairs(): Promise<RepairTask[]> {
    return [...mockRepairs];
  },

  async getRepairById(id: string): Promise<RepairTask | null> {
    const repair = mockRepairs.find((r) => r.id === id);
    return repair || null;
  },
};
