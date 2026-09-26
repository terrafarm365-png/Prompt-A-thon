# Vault Frontend ↔ Backend API Contract

This document provides the complete API specification for the Vault Control Plane (`/api/v1`).
All endpoints return a unified response envelope.

---

## 1. Unified Response Envelope

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NODE_UNAVAILABLE",
    "message": "Storage node is unavailable or timed out",
    "details": { ... }
  }
}
```

---

## 2. Authentication (`/api/v1/auth`)

### Register
`POST /api/v1/auth/register`
- **Body**: `{ "email": "user@vault.io", "password": "...", "name": "Alice", "workspace_name": "Prod" }`
- **Returns**: `ApiResponse[UserProfileResponse]`

### Login
`POST /api/v1/auth/login`
- **Body**: `{ "email": "user@vault.io", "password": "..." }`
- **Returns**: `ApiResponse[TokenResponse]`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "error": null
}
```

### Refresh Token
`POST /api/v1/auth/refresh`
- **Body**: `{ "refresh_token": "..." }`

### Current User Profile
`GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `ApiResponse[UserProfileResponse]`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Alice Engineer",
    "email": "alice@vault.io",
    "avatarUrl": "https://...",
    "role": "admin",
    "workspaceName": "Vault Production",
    "clusterName": "vault-cluster-primary"
  },
  "error": null
}
```

---

## 3. Objects & File Management (`/api/v1/objects`)

### List Objects
`GET /api/v1/objects?search=&bucket=&status=&sortBy=updatedAt&sortOrder=desc`
- **Returns**: `ApiResponse[List[VaultObject]]`
```json
{
  "success": true,
  "data": [
    {
      "id": "obj-1790381064018-9c7b74ca",
      "name": "financial_records.parquet",
      "size": 52428800,
      "physicalSize": 78643200,
      "type": "application/octet-stream",
      "mimeType": "application/octet-stream",
      "status": "healthy",
      "createdAt": "2026-09-26T00:00:00Z",
      "updatedAt": "2026-09-26T00:00:00Z",
      "version": 1,
      "bucket": "vault-prod-east1",
      "checksum": "a7c8b9d0...",
      "erasureCoding": {
        "scheme": "RS(4+2)",
        "dataShards": 4,
        "parityShards": 2,
        "shards": [
          {
            "id": "sh-01",
            "objectId": "obj-1790381064018-9c7b74ca",
            "type": "data",
            "index": 1,
            "label": "D1",
            "nodeId": "node-a",
            "nodeName": "Node-A",
            "checksum": "f1a2b3...",
            "status": "healthy",
            "size": 13107200
          }
        ]
      }
    }
  ],
  "error": null
}
```

### Direct Upload
`POST /api/v1/objects`
- **Form Data**: `file: <binary>`, `bucket: vault-prod-east1`
- **Returns**: `ApiResponse[VaultObject]`

### Get Object Details
`GET /api/v1/objects/{id}`
- **Returns**: `ApiResponse[VaultObject]`

### Delete Object Safely
`DELETE /api/v1/objects/{id}`
- **Returns**: `ApiResponse[{ "message": "Object successfully deleted", "id": "..." }]`

### Download Object
`GET /api/v1/objects/{id}/download`
- **Response**: Binary stream with headers:
  - `Content-Disposition: attachment; filename="..."`
  - `Content-Length: <size>`
  - `X-Vault-Object-Checksum: <sha256>`
  - `X-Vault-Durability-Scheme: RS(4+2)`

---

## 4. Chunked Upload Pipeline (`/api/v1/upload`)

### Initiate Upload
`POST /api/v1/upload/initiate`
- **Body**: `{ "name": "large_archive.tar", "size": 1073741824, "content_type": "application/x-tar" }`
- **Returns**: `ApiResponse[InitiateUploadResponse]`
```json
{
  "success": true,
  "data": {
    "upload_id": "upl-1790381064018-9c7b74ca",
    "chunk_size": 67108864,
    "data_shards": 4,
    "parity_shards": 2,
    "total_shards": 6,
    "expires_at": "2026-09-27T00:00:00Z"
  }
}
```

### Upload Part
`PUT /api/v1/upload/{id}/part`
- **Header**: `X-Vault-Part-Number: 1`
- **Body**: Part binary stream

### Complete Upload
`POST /api/v1/upload/{id}/complete`
- **Returns**: `ApiResponse[VaultObject]`

---

## 5. Storage Nodes & Topology (`/api/v1/nodes`)

### List Nodes
`GET /api/v1/nodes`
- **Returns**: `ApiResponse[List[StorageNode]]`

### Node Topology & Shard Connections
`GET /api/v1/nodes/topology`
- **Returns**: `ApiResponse[NodeTopologyResponse]`
```json
{
  "success": true,
  "data": {
    "nodes": [ ... ],
    "connections": [
      {
        "objectId": "obj-123",
        "objectName": "file.zip",
        "shardId": "sh-01",
        "shardLabel": "D1",
        "shardType": "data",
        "nodeId": "node-a",
        "status": "healthy"
      }
    ],
    "totalNodes": 6,
    "onlineNodes": 6,
    "degradedNodes": 0,
    "offlineNodes": 0
  }
}
```

### On-Demand Node Health Check
`POST /api/v1/nodes/{id}/health-check`
- **Returns**: `ApiResponse[StorageNode]`

---

## 6. Storage Analytics (`/api/v1/storage`)

### Storage Overview
`GET /api/v1/storage/overview`
- **Returns**: `ApiResponse[StorageOverviewResponse]`
```json
{
  "success": true,
  "data": {
    "logical_storage": 104857600,
    "physical_storage": 157286400,
    "parity_storage": 52428800,
    "available_storage": 5999842713600,
    "storage_efficiency": 66.67,
    "data_shards": 4,
    "parity_shards": 2,
    "node_count": 6
  }
}
```

### Storage Metrics
`GET /api/v1/storage/metrics`
- **Returns**: `ApiResponse[StorageMetrics]`

---

## 7. Cluster Health (`/api/v1/health`)

### System Health
`GET /api/v1/health/system`
```json
{
  "success": true,
  "data": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "storage_nodes": {
      "total": 6,
      "online": 6,
      "degraded": 0,
      "offline": 0
    }
  }
}
```

### Health Metrics
`GET /api/v1/health/metrics`
- **Returns**: `ApiResponse[HealthMetrics]`

---

## 8. Dashboard Overview (`/api/v1/dashboard`)

### Dashboard Overview
`GET /api/v1/dashboard/overview`
```json
{
  "success": true,
  "data": {
    "storage_used": 157286400,
    "storage_capacity": 6000000000000,
    "object_count": 12,
    "cluster_health": "healthy",
    "active_repairs": 0,
    "completed_repairs": 3,
    "node_count": 6,
    "healthy_nodes": 6,
    "logical_storage": 104857600,
    "physical_storage": 157286400,
    "parity_storage": 52428800,
    "storage_efficiency": 66.67
  }
}
```

---

## 9. Self-Healing & Repairs (`/api/v1/repairs`)

### List Repairs
`GET /api/v1/repairs`
- **Returns**: `ApiResponse[RepairsListResponse]` (`active`, `queued`, `completed`, `failed`)

### Retry Repair
`POST /api/v1/repairs/{id}/retry`
- **Returns**: `ApiResponse[RepairTask]`

---

## 10. Audit Activity Log (`/api/v1/activity`)

### List Activities
`GET /api/v1/activity?limit=50&type=`
- **Returns**: `ApiResponse[List[ActivityEvent]]`

---

## 11. Cluster Settings (`/api/v1/settings`)

### Get Settings
`GET /api/v1/settings`
- **Returns**: `ApiResponse[DurabilitySettings]`

### Update Settings
`PATCH /api/v1/settings`
- **Body**: `{ "dataShards": 4, "parityShards": 2, "autoRepair": true }`
- **Returns**: `ApiResponse[DurabilitySettings]`
