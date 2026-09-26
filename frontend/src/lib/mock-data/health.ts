import { HealthMetrics } from "@/types";

export const mockHealthMetrics: HealthMetrics = {
  clusterHealth: "healthy",
  storageHealth: "healthy",
  dataIntegrity: "healthy",
  repairHealth: "optimal",
  networkHealth: "healthy",
  totalNodes: 6,
  onlineNodes: 6,
  totalCapacity: 12000000000000,
  usedCapacity: 4260000000000,
  lastScrubTime: "12m ago",
  avgLatencyMs: 18,
  p95LatencyMs: 34,
  ingressMbps: 42,
  egressMbps: 68,
};
