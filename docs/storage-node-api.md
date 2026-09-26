# Vault Storage Node Daemon API Protocol Specification

This document defines the strict HTTP protocol contract between the **Vault FastAPI Control Plane (Backend)** and the **Vault Storage Node Daemons (Data Plane)**.

Any distributed storage node implementation in `storage-nodes/` must adhere to this specification to interface seamlessly with the control plane.

---

## 1. Architectural Separation

```
         ┌───────────────────────────────┐
         │     VAULT CONTROL PLANE       │
         │  FastAPI (Metadata & Logic)   │
         └───────────────┬───────────────┘
                         │
        HTTP Protocol (Internal Network)
        X-Vault-Node-Secret Authentication
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Storage Node │   │ Storage Node │   │ Storage Node │
│    Node A    │   │    Node B    │   │  Node C...F  │
│  Port: 9101  │   │  Port: 9102  │   │ Ports: 9103+ │
└──────────────┘   └──────────────┘   └──────────────┘
```

The control plane is **stateless** with respect to physical binary chunks. It coordinates placement, authentication, erasure coding RS(4+2), integrity verification, and self-healing. The storage nodes are strictly responsible for storing, reading, deleting, and verifying raw shard chunks on disk.

---

## 2. Authentication & Headers

Every request from the control plane includes the shared cluster secret header:

| Header Name | Type | Description |
| :--- | :--- | :--- |
| `X-Vault-Node-Secret` | String | Shared cluster token (`STORAGE_NODE_SHARED_SECRET`). Storage nodes must reject requests without this header with `HTTP 401 Unauthorized`. |
| `X-Vault-Object-ID` | String | (PUT / DELETE) Logical object UUID owning the shard. |
| `X-Vault-Shard-Index` | Integer | (PUT) 1-based index (e.g. 1 to 6). |
| `X-Vault-Shard-Type` | String | (PUT) `"data"` or `"parity"`. |
| `X-Vault-Shard-Checksum` | String | (PUT) Hex-encoded SHA-256 digest of the shard payload. |

---

## 3. Endpoints

### 3.1. Health Check
Checks if the storage node daemon is reachable and healthy.

- **Method**: `GET /health`
- **Response**: `HTTP 200 OK`
```json
{
  "status": "healthy",
  "node_id": "node-a",
  "uptime_seconds": 86420.5,
  "version": "1.0.0"
}
```

---

### 3.2. Node Stats & Telemetry
Returns physical disk metrics, load average, and active shard count.

- **Method**: `GET /stats`
- **Response**: `HTTP 200 OK`
```json
{
  "node_id": "node-a",
  "status": "online",
  "disk": {
    "total_bytes": 1000000000000,
    "used_bytes": 48200000000,
    "free_bytes": 951800000000
  },
  "shard_count": 142,
  "load_average": 0.12,
  "cpu_percent": 14.5,
  "memory_percent": 28.1,
  "uptime_seconds": 86420.5
}
```

---

### 3.3. Store Shard
Writes a raw binary shard to the node's disk.

- **Method**: `PUT /v1/shards/{shard_id}`
- **Headers**:
  - `Content-Type: application/octet-stream`
  - `X-Vault-Node-Secret: <SECRET>`
  - `X-Vault-Shard-Checksum: <SHA-256>`
  - `X-Vault-Object-ID: <OBJECT_ID>`
  - `X-Vault-Shard-Index: <INDEX>`
  - `X-Vault-Shard-Type: data|parity`
- **Body**: Raw shard byte stream
- **Response**: `HTTP 200 OK` or `HTTP 201 Created`
```json
{
  "shard_id": "sh-1790381064018-9c7b74ca",
  "size_bytes": 16777216,
  "checksum": "d5a8b79f829c...64hex",
  "stored_at": "2026-09-26T00:00:00Z"
}
```

---

### 3.4. Read Shard
Retrieves a raw binary shard from disk.

- **Method**: `GET /v1/shards/{shard_id}`
- **Response**: `HTTP 200 OK`
  - `Content-Type: application/octet-stream`
  - `Content-Length: <SIZE>`
  - `Body`: Binary payload.
- **Error Responses**:
  - `HTTP 404 Not Found`: If shard ID does not exist on disk.

---

### 3.5. Delete Shard
Permanently removes a shard from physical disk.

- **Method**: `DELETE /v1/shards/{shard_id}`
- **Response**: `HTTP 200 OK` or `HTTP 204 No Content`
```json
{
  "deleted": true
}
```

---

### 3.6. Verify Shard Integrity
Directs the node to calculate its local disk copy's SHA-256 and compare against expected.

- **Method**: `POST /v1/shards/{shard_id}/verify`
- **Request Body**:
```json
{
  "expected_checksum": "d5a8b79f829c...64hex"
}
```
- **Response**: `HTTP 200 OK`
```json
{
  "shard_id": "sh-1790381064018-9c7b74ca",
  "valid": true,
  "expected_checksum": "d5a8b79f829c...64hex",
  "actual_checksum": "d5a8b79f829c...64hex",
  "checked_at": "2026-09-26T00:00:00Z"
}
```

---

### 3.7. List Shards
Lists all shard IDs physically present on this storage node. Used for reconciliation against metadata.

- **Method**: `GET /v1/shards`
- **Response**: `HTTP 200 OK`
```json
{
  "node_id": "node-a",
  "shards": [
    "sh-1790381064018-9c7b74ca",
    "sh-1790381064019-9c7b74cb"
  ],
  "total_count": 2
}
```

---

### 3.8. Delete Object Shards
Purges all shards belonging to a specific object.

- **Method**: `DELETE /v1/shards?object_id={object_id}`
- **Response**: `HTTP 200 OK`
```json
{
  "deleted_count": 1
}
```
