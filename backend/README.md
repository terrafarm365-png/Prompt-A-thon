# Vault Control Plane Backend Service

Production-oriented distributed object storage control plane built with **FastAPI**, **SQLAlchemy 2.0**, **PostgreSQL**, **Redis**, and **Reed-Solomon RS(4+2)** erasure coding with `zfec`.

---

## 1. Architectural Overview

```
                    NEXT.JS FRONTEND
                           │
                           │ REST API (/api/v1)
                           ▼
                    FASTAPI BACKEND (Control Plane)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   PostgreSQL           Redis          Storage Nodes
   (Metadata)          (Jobs)         (A B C D E F)
```

The backend is the **CONTROL PLANE**. It manages:
- Object and shard metadata, transactions, and durability state machines.
- Reed-Solomon RS(4+2) encoding, shard chunking, and on-the-fly reconstruction.
- Placement across distinct storage nodes with rack awareness and capacity balancing.
- SHA-256 cryptographic verification and continuous scrub audits.
- Node telemetry, failure detection, and autonomous background repairs.

Storage nodes (`storage-nodes/`) form the **DATA PLANE** and handle raw shard I/O.

---

## 2. Environment Configuration & Storage Node URLs

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 📍 Where to Paste Storage Node URLs (Important)
Open `backend/.env` and locate the **Storage Node Endpoints** section:

```dotenv
# ==============================================================================
# STORAGE NODE ENDPOINTS (DATA PLANE)
# Paste your actual storage-node addresses here.
# For local development, nodes run on ports 9101-9106.
# For remote or containerized deployments, replace with private IPs or hostnames.
# ==============================================================================
STORAGE_NODE_A_URL=http://localhost:9101
STORAGE_NODE_B_URL=http://localhost:9102
STORAGE_NODE_C_URL=http://localhost:9103
STORAGE_NODE_D_URL=http://localhost:9104
STORAGE_NODE_E_URL=http://localhost:9105
STORAGE_NODE_F_URL=http://localhost:9106

# Internal shared secret for control-plane <-> storage-node authentication
STORAGE_NODE_SHARED_SECRET=vault-storage-node-internal-secret-token
```

The backend dynamically registers all configured nodes and verifies at startup that at least 6 nodes are available for default RS(4+2).

---

## 3. Local Development Setup

### 3.1. Prerequisites
- Python 3.12+
- PostgreSQL (or use built-in SQLite fallback for zero-dependency local testing)
- Redis (or in-memory task queue fallback)

### 3.2. Virtual Environment & Dependencies
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate environment (Linux / macOS)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3.3. Database Migrations (Alembic)
Apply the initial database schema:
```bash
alembic upgrade head
```

### 3.4. Running the Backend Control Plane
Start the server with auto-reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- System Health: [http://localhost:8000/api/v1/health/system](http://localhost:8000/api/v1/health/system)

---

## 4. Running Tests

Run the complete test suite:
```bash
pytest -v
```

Run test suite with code coverage:
```bash
pytest --cov=app -v
```

### Test Suite Coverage:
- `test_erasure.py`: Deterministic RS(4+2) encoding, decoding, 1-shard loss recovery, 2-shard loss recovery, and 3-shard quorum failure verification.
- `test_placement.py`: Intelligent multi-node placement balancing capacity, load, and rack topology.
- `test_auth.py`: Password hashing, JWT access/refresh tokens, and user registration.
- `test_node_client.py`: Mock HTTP transport tests for storage node communication.
- `test_upload_download.py`: End-to-end distributed upload and download with node failure tolerance.
- `test_failure_recovery.py`: Self-healing shard reconstruction and placement to healthy destination.
- `test_api.py`: Comprehensive HTTP endpoint validation across health, nodes, storage, repairs, activity, and settings.

---

## 5. Docker Deployment

To launch PostgreSQL, Redis, and the Vault Control Plane via Docker Compose:
```bash
docker compose up -d
```
