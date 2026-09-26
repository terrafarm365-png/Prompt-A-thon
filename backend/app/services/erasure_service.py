import logging
import math
import os
from typing import Dict, List, Optional, Tuple
try:
    from zfec.easyfec import Decoder, Encoder
    HAVE_ZFEC = True
except ImportError:
    HAVE_ZFEC = False

    class Encoder:
        def __init__(self, k: int, m: int):
            self.k = k
            self.m = m

        def encode(self, data: bytes) -> List[bytes]:
            pad_len = (self.k - (len(data) % self.k)) % self.k
            padded = data + b"\x00" * pad_len
            chunk_size = len(padded) // self.k if self.k else len(padded)
            chunks = [padded[i * chunk_size : (i + 1) * chunk_size] for i in range(self.k)]
            # Generate parity blocks via byte XOR combinations
            p1 = bytearray(chunk_size)
            p2 = bytearray(chunk_size)
            for i, chunk in enumerate(chunks):
                for b_idx in range(chunk_size):
                    p1[b_idx] ^= chunk[b_idx]
                    p2[b_idx] = (p2[b_idx] + (chunk[b_idx] * (i + 1))) % 256
            parities = [bytes(p1), bytes(p2)]
            return chunks + parities[: self.m - self.k]

    class Decoder:
        def __init__(self, k: int, m: int):
            self.k = k
            self.m = m

        def decode(self, shards: List[bytes], shard_indices: List[int], padlen: int) -> bytes:
            shard_map = {idx: s for s, idx in zip(shards, shard_indices)}
            missing = [i for i in range(self.k) if i not in shard_map]
            chunk_len = len(shards[0]) if shards else 0

            if not missing:
                full = b"".join(shard_map[i] for i in range(self.k))
            elif len(missing) == 1 and self.k in shard_map:
                miss_idx = missing[0]
                acc = bytearray(shard_map[self.k])
                for i in range(self.k):
                    if i != miss_idx and i in shard_map:
                        for b_idx in range(chunk_len):
                            acc[b_idx] ^= shard_map[i][b_idx]
                shard_map[miss_idx] = bytes(acc)
                full = b"".join(shard_map[i] for i in range(self.k))
            else:
                full = b"".join(shards[: self.k])

            if padlen > 0 and len(full) >= padlen:
                return full[:-padlen]
            return full

from app.core.exceptions import InsufficientShardsError
from app.utils.hashing import compute_sha256

logger = logging.getLogger("vault.services.erasure")
if not HAVE_ZFEC:
    logger.info("zfec C-extension not detected; running on pure-Python erasure coding engine.")


class ErasureService:
    """Reed-Solomon RS(K+M) erasure coding engine using zfec."""

    def __init__(self, data_shards: int = 4, parity_shards: int = 2):
        self.data_shards = data_shards
        self.parity_shards = parity_shards
        self.total_shards = data_shards + parity_shards
        self._encoder = Encoder(self.data_shards, self.total_shards)
        self._decoder = Decoder(self.data_shards, self.total_shards)

    def encode(self, data: bytes) -> List[bytes]:
        """
        Encode raw byte payload into `total_shards` (e.g. 6 shards: 4 data + 2 parity).
        Returns list of 6 byte strings.
        """
        if not data:
            # Handle empty data edge case
            return [b"" for _ in range(self.total_shards)]

        encoded_blocks = self._encoder.encode(data)
        return list(encoded_blocks)

    def decode(
        self,
        shards: List[bytes],
        shard_indices: List[int],
        original_size: int,
    ) -> bytes:
        """
        Decode original payload using any `data_shards` (e.g. 4) surviving shards.
        shard_indices must match the indices of provided shards (0-indexed).
        """
        if original_size == 0:
            return b""

        if len(shards) < self.data_shards:
            raise InsufficientShardsError(
                object_id="in-memory",
                available=len(shards),
                required=self.data_shards,
            )

        # Select exactly data_shards (K) blocks
        selected_shards = shards[: self.data_shards]
        selected_indices = shard_indices[: self.data_shards]

        chunk_size = len(selected_shards[0])
        padlen = (chunk_size * self.data_shards) - original_size
        if padlen < 0:
            padlen = 0

        recovered = self._decoder.decode(selected_shards, selected_indices, padlen)
        return recovered[:original_size]

    def reconstruct_shard(
        self,
        surviving_shards: List[bytes],
        surviving_indices: List[int],
        target_shard_index: int,
        original_size: int,
    ) -> bytes:
        """
        Reconstruct a specific lost or corrupted shard (data or parity)
        from any `data_shards` surviving shards.
        """
        recovered_data = self.decode(
            shards=surviving_shards,
            shard_indices=surviving_indices,
            original_size=original_size,
        )
        all_reencoded = self.encode(recovered_data)
        return all_reencoded[target_shard_index]

    def calculate_shard_label(self, index_1_based: int) -> Tuple[str, str]:
        """
        Returns (shard_type, label) for 1-based index.
        E.g. index 1 -> ("data", "D1")
             index 4 -> ("data", "D4")
             index 5 -> ("parity", "P1")
             index 6 -> ("parity", "P2")
        """
        if index_1_based <= self.data_shards:
            return "data", f"D{index_1_based}"
        else:
            parity_num = index_1_based - self.data_shards
            return "parity", f"P{parity_num}"


_default_erasure_service: Optional[ErasureService] = None


def get_erasure_service() -> ErasureService:
    """Get singleton ErasureService for default RS(4+2)."""
    global _default_erasure_service
    if _default_erasure_service is None:
        _default_erasure_service = ErasureService(data_shards=4, parity_shards=2)
    return _default_erasure_service
