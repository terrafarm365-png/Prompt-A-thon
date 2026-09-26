import { StorageMetrics } from "@/types";

export const mockStorageMetrics: StorageMetrics = {
  logicalUsed: 2840000000000,    // 2.84 TB
  physicalUsed: 4260000000000,   // 4.26 TB (logical + parity)
  totalCapacity: 12000000000000, // 12.00 TB (6 nodes x 2 TB)
  availableCapacity: 7740000000000, // 7.74 TB
  parityReserved: 1420000000000, // 1.42 TB
  overheadRatio: 1.50,
  efficiencyPercent: 66.7,
  history: [
    { date: "Sep 20", logical: 2.1, physical: 3.15 },
    { date: "Sep 21", logical: 2.24, physical: 3.36 },
    { date: "Sep 22", logical: 2.45, physical: 3.68 },
    { date: "Sep 23", logical: 2.58, physical: 3.87 },
    { date: "Sep 24", logical: 2.70, physical: 4.05 },
    { date: "Sep 25", logical: 2.78, physical: 4.17 },
    { date: "Sep 26", logical: 2.84, physical: 4.26 },
  ],
};
