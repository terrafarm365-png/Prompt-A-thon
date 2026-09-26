import { VaultObject } from "@/types";

export const mockObjects: VaultObject[] = [
  {
    id: "obj-001",
    name: "project.zip",
    size: 209715200, // 200 MB
    physicalSize: 314572800, // 300 MB (1.5x RS 4+2)
    type: "ZIP Archive",
    mimeType: "application/zip",
    status: "healthy",
    createdAt: "2026-09-26T14:22:00Z",
    updatedAt: "2026-09-26T14:22:00Z",
    version: 1,
    bucket: "vault-prod-east1",
    checksum: "7f82a9d6e4b881c20491d91c2847a9ef38b812a450e18fc091c78479e19a2b0a",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-001-d1", objectId: "obj-001", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "e1a9...4821", status: "healthy", size: 52428800 },
        { id: "sh-001-d2", objectId: "obj-001", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "83bc...1109", status: "healthy", size: 52428800 },
        { id: "sh-001-d3", objectId: "obj-001", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "99fa...cb72", status: "healthy", size: 52428800 },
        { id: "sh-001-d4", objectId: "obj-001", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "12fe...5044", status: "healthy", size: 52428800 },
        { id: "sh-001-p1", objectId: "obj-001", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "710a...df39", status: "healthy", size: 52428800 },
        { id: "sh-001-p2", objectId: "obj-001", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "54cd...9182", status: "healthy", size: 52428800 },
      ],
    },
  },
  {
    id: "obj-002",
    name: "model-weights.safetensors",
    size: 9019431321, // ~8.4 GB
    physicalSize: 13529146981, // ~12.6 GB
    type: "Model Checkpoint",
    mimeType: "application/octet-stream",
    status: "healthy",
    createdAt: "2026-09-25T18:10:00Z",
    updatedAt: "2026-09-25T18:10:00Z",
    version: 3,
    bucket: "ai-models-production",
    checksum: "a43818de92bc691faec819001db1092efca823901b8e1f57ac1892cfa7104bce",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-002-d1", objectId: "obj-002", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "bc29...8120", status: "healthy", size: 2254857830 },
        { id: "sh-002-d2", objectId: "obj-002", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "31ba...9418", status: "healthy", size: 2254857830 },
        { id: "sh-002-d3", objectId: "obj-002", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "44da...7190", status: "healthy", size: 2254857830 },
        { id: "sh-002-d4", objectId: "obj-002", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "71eb...8021", status: "healthy", size: 2254857830 },
        { id: "sh-002-p1", objectId: "obj-002", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "fa11...2930", status: "healthy", size: 2254857830 },
        { id: "sh-002-p2", objectId: "obj-002", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "09bc...6152", status: "healthy", size: 2254857830 },
      ],
    },
  },
  {
    id: "obj-003",
    name: "analytics_2026_q3.parquet",
    size: 1503238553, // 1.4 GB
    physicalSize: 2254857829, // 2.1 GB
    type: "Dataset",
    mimeType: "application/vnd.apache.parquet",
    status: "healthy",
    createdAt: "2026-09-26T13:00:00Z",
    updatedAt: "2026-09-26T13:00:00Z",
    version: 1,
    bucket: "warehouse-lakehouse",
    checksum: "48fae10982bc19ca73b889021eac7190fbca28019abce81048bc0192aef38190",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-003-d1", objectId: "obj-003", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "1190...8472", status: "healthy", size: 375809638 },
        { id: "sh-003-d2", objectId: "obj-003", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "58ac...3102", status: "healthy", size: 375809638 },
        { id: "sh-003-d3", objectId: "obj-003", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "93fe...4810", status: "healthy", size: 375809638 },
        { id: "sh-003-d4", objectId: "obj-003", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "01ba...9143", status: "healthy", size: 375809638 },
        { id: "sh-003-p1", objectId: "obj-003", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "87ea...1092", status: "healthy", size: 375809638 },
        { id: "sh-003-p2", objectId: "obj-003", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "29ab...7710", status: "healthy", size: 375809638 },
      ],
    },
  },
  {
    id: "obj-004",
    name: "infra-backup-nodes.tar.gz",
    size: 566231040, // 540 MB
    physicalSize: 849346560, // 810 MB
    type: "Archive",
    mimeType: "application/gzip",
    status: "repairing",
    createdAt: "2026-09-26T11:15:00Z",
    updatedAt: "2026-09-26T14:10:00Z",
    version: 2,
    bucket: "vault-system-backups",
    checksum: "d91823bc0192aef381907f82a9d6e4b881c20491d91c2847a9ef38b812a450e1",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-004-d1", objectId: "obj-004", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "4190...8821", status: "healthy", size: 141557760 },
        { id: "sh-004-d2", objectId: "obj-004", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "77ac...1904", status: "healthy", size: 141557760 },
        { id: "sh-004-d3", objectId: "obj-004", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "83fe...3190", status: "healthy", size: 141557760 },
        { id: "sh-004-d4", objectId: "obj-004", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "00ba...7123", status: "healthy", size: 141557760 },
        { id: "sh-004-p1", objectId: "obj-004", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "99ea...0012", status: "rebuilding", size: 141557760 },
        { id: "sh-004-p2", objectId: "obj-004", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "31ab...9821", status: "healthy", size: 141557760 },
      ],
    },
  },
  {
    id: "obj-005",
    name: "backup-database-dump.sql.gz",
    size: 671088640, // 640 MB
    physicalSize: 1006632960, // 960 MB
    type: "SQL Dump",
    mimeType: "application/gzip",
    status: "healthy",
    createdAt: "2026-09-19T08:00:00Z",
    updatedAt: "2026-09-19T08:00:00Z",
    version: 1,
    bucket: "databases-cold-storage",
    checksum: "82bc19ca73b889021eac7190fbca28019abce81048bc0192aef381907f82a9d6",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-005-d1", objectId: "obj-005", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "01ab...9912", status: "healthy", size: 167772160 },
        { id: "sh-005-d2", objectId: "obj-005", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "29fe...8410", status: "healthy", size: 167772160 },
        { id: "sh-005-d3", objectId: "obj-005", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "83da...1192", status: "healthy", size: 167772160 },
        { id: "sh-005-d4", objectId: "obj-005", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "51eb...4018", status: "healthy", size: 167772160 },
        { id: "sh-005-p1", objectId: "obj-005", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "77ac...9102", status: "healthy", size: 167772160 },
        { id: "sh-005-p2", objectId: "obj-005", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "64fa...2201", status: "healthy", size: 167772160 },
      ],
    },
  },
  {
    id: "obj-006",
    name: "production-env-manifest.yaml",
    size: 14336, // 14 KB
    physicalSize: 21504, // 21 KB
    type: "Config",
    mimeType: "text/yaml",
    status: "healthy",
    createdAt: "2026-09-15T12:00:00Z",
    updatedAt: "2026-09-15T12:00:00Z",
    version: 5,
    bucket: "vault-prod-east1",
    checksum: "3b889021eac7190fbca28019abce81048bc0192aef381907f82a9d6e4b881c20",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-006-d1", objectId: "obj-006", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "9182...3319", status: "healthy", size: 3584 },
        { id: "sh-006-d2", objectId: "obj-006", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "8271...0012", status: "healthy", size: 3584 },
        { id: "sh-006-d3", objectId: "obj-006", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "4419...7710", status: "healthy", size: 3584 },
        { id: "sh-006-d4", objectId: "obj-006", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "3190...8821", status: "healthy", size: 3584 },
        { id: "sh-006-p1", objectId: "obj-006", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "5821...6619", status: "healthy", size: 3584 },
        { id: "sh-006-p2", objectId: "obj-006", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "1190...4481", status: "healthy", size: 3584 },
      ],
    },
  },
  {
    id: "obj-007",
    name: "dataset-features.csv",
    size: 440401920, // 420 MB
    physicalSize: 660602880, // 630 MB
    type: "CSV Data",
    mimeType: "text/csv",
    status: "healthy",
    createdAt: "2026-09-25T09:30:00Z",
    updatedAt: "2026-09-25T09:30:00Z",
    version: 1,
    bucket: "warehouse-lakehouse",
    checksum: "190fbca28019abce81048bc0192aef381907f82a9d6e4b881c20491d91c2847a",
    erasureCoding: {
      scheme: "RS(4+2)",
      dataShards: 4,
      parityShards: 2,
      shards: [
        { id: "sh-007-d1", objectId: "obj-007", type: "data", index: 1, label: "D1", nodeId: "node-01", nodeName: "Node-01", checksum: "6172...9901", status: "healthy", size: 110100480 },
        { id: "sh-007-d2", objectId: "obj-007", type: "data", index: 2, label: "D2", nodeId: "node-02", nodeName: "Node-02", checksum: "7189...2291", status: "healthy", size: 110100480 },
        { id: "sh-007-d3", objectId: "obj-007", type: "data", index: 3, label: "D3", nodeId: "node-03", nodeName: "Node-03", checksum: "8891...3302", status: "healthy", size: 110100480 },
        { id: "sh-007-d4", objectId: "obj-007", type: "data", index: 4, label: "D4", nodeId: "node-04", nodeName: "Node-04", checksum: "4490...1190", status: "healthy", size: 110100480 },
        { id: "sh-007-p1", objectId: "obj-007", type: "parity", index: 5, label: "P1", nodeId: "node-05", nodeName: "Node-05", checksum: "9910...7741", status: "healthy", size: 110100480 },
        { id: "sh-007-p2", objectId: "obj-007", type: "parity", index: 6, label: "P2", nodeId: "node-06", nodeName: "Node-06", checksum: "0019...8821", status: "healthy", size: 110100480 },
      ],
    },
  },
];
