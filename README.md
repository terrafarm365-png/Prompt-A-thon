# Vault — Distributed Storage Built for Resilience

Vault is a distributed object storage platform designed for fault tolerance, cryptographic integrity verification, and automatic failure recovery using Reed-Solomon Erasure Coding (4+2).

## Repository Architecture

```text
Vault/
│
├── frontend/             # Production-grade Next.js App Router UI
├── backend/              # API and metadata services (to be connected)
├── storage-nodes/        # Distributed block/shard storage services (to be connected)
├── docs/                 # Technical specifications & architecture guides
└── README.md
```

## Frontend Application

The frontend is a dedicated Next.js application built with TypeScript, Tailwind CSS, shadcn/ui primitives, and Lucide icons, accurately implementing the approved Google Stitch design system.

### Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Vault console.
