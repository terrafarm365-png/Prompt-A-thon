export type ObjectStatus = "healthy" | "degraded" | "repairing" | "corrupted";

export type NodeStatus = "online" | "degraded" | "offline";

export type ShardType = "data" | "parity";

export interface Shard {
  id: string;
  objectId: string;
  type: ShardType;
  index: number;
  label: string; // e.g. "D1", "D2", "P1", "P2"
  nodeId: string;
  nodeName: string;
  checksum: string;
  status: "healthy" | "rebuilding" | "corrupted";
  size: number;
}

export interface VaultObject {
  id: string;
  name: string;
  size: number;
  physicalSize: number;
  type: string;
  mimeType: string;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  bucket: string;
  checksum: string;
  erasureCoding: {
    scheme: string; // "RS(4+2)"
    dataShards: number;
    parityShards: number;
    shards: Shard[];
  };
}

export interface StorageNode {
  id: string;
  name: string;
  status: NodeStatus;
  rack: string;
  ip: string;
  region: string;
  capacity: number;
  used: number;
  free: number;
  load: number;
  objects: number;
  lastHeartbeat: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    ingressMbps: number;
    egressMbps: number;
  };
  shardsCount: number;
  parityShardsCount: number;
  integrityErrors: number;
  activeRepairs: number;
}

export interface RepairTask {
  id: string;
  objectId: string;
  objectName: string;
  shardIndex: number;
  shardLabel: string;
  shardType: ShardType;
  sourceNodeId: string;
  sourceNodeName: string;
  destinationNodeId: string;
  destinationNodeName: string;
  progress: number;
  status: "in-progress" | "queued" | "completed" | "failed";
  reason: string;
  detectedAt: string;
  startedAt?: string;
  completedAt?: string;
  bytesTotal: number;
  bytesTransferred: number;
}

export interface ActivityEvent {
  id: string;
  type: "upload" | "delete" | "repair" | "integrity_check" | "node_offline" | "node_joined" | "rebalance";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "success" | "warning" | "error";
  targetId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface HealthMetrics {
  clusterHealth: "healthy" | "degraded" | "critical";
  storageHealth: "healthy" | "degraded" | "critical";
  dataIntegrity: "healthy" | "verifying" | "error";
  repairHealth: "optimal" | "active" | "congested";
  networkHealth: "healthy" | "degraded" | "critical";
  totalNodes: number;
  onlineNodes: number;
  totalCapacity: number;
  usedCapacity: number;
  lastScrubTime: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  ingressMbps: number;
  egressMbps: number;
}

export interface StorageMetrics {
  logicalUsed: number;
  physicalUsed: number;
  totalCapacity: number;
  availableCapacity: number;
  parityReserved: number;
  overheadRatio: number;
  efficiencyPercent: number;
  history: {
    date: string;
    logical: number;
    physical: number;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  workspaceName: string;
  clusterName: string;
}

export interface DurabilitySettings {
  dataShards: number;
  parityShards: number;
  autoRepair: boolean;
  scrubFrequencyDays: number;
  compressionEnabled: boolean;
  encryptionAlgorithm: string;
  replicationQuorum: number;
}
