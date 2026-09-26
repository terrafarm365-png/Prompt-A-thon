# Vault Architecture & Technical Specification

## Core Principles

- **Erasure Coding**: Reed-Solomon RS(4+2) - 4 data shards, 2 parity shards. Tolerates loss of any 2 nodes simultaneously with 66.7% storage efficiency.
- **Cryptographic Integrity**: Continuous end-to-end SHA-256 verification and automatic background scrub across distributed storage disks.
- **Zero-Single-Point-of-Failure**: Stateless ingress gateway cluster with distributed consensus and autonomous peer-to-peer node repair.
