import { HealthMetrics, ActivityEvent } from "@/types";
import { mockHealthMetrics } from "@/lib/mock-data/health";
import { mockActivity } from "@/lib/mock-data/activity";

export const healthApi = {
  async getHealthMetrics(): Promise<HealthMetrics> {
    return { ...mockHealthMetrics };
  },

  async getActivity(): Promise<ActivityEvent[]> {
    return [...mockActivity];
  },
};
