import os
import pytest
from app.core.exceptions import InsufficientShardsError
from app.services.erasure_service import ErasureService
from app.utils.hashing import compute_sha256


def test_erasure_coding_rs_4_2_deterministic():
    """
    Requirement 45: Deterministic Erasure Coding Test.
    Scheme: RS(4+2) - 4 data shards, 2 parity shards.
    Tolerates failure of up to any 2 shards simultaneously.
    """
    erasure = ErasureService(data_shards=4, parity_shards=2)

    # 1. Test payload (1 MB deterministic test data)
    original_data = os.urandom(1024 * 1024)
    original_checksum = compute_sha256(original_data)

    # 2. Encode into 6 shards
    shards = erasure.encode(original_data)
    assert len(shards) == 6, f"Expected 6 shards, got {len(shards)}"

    # Generate checksums for all 6 shards
    shard_checksums = [compute_sha256(s) for s in shards]
    assert all(len(c) == 64 for c in shard_checksums)

    # 3. Test scenario A: All 6 shards healthy
    decoded_all = erasure.decode(
        shards=shards[:4],
        shard_indices=[0, 1, 2, 3],
        original_size=len(original_data),
    )
    assert decoded_all == original_data
    assert compute_sha256(decoded_all) == original_checksum

    # 4. Test scenario B: Remove 1 data shard (e.g. shard 1 / D2 missing)
    # Surviving: shards 0, 2, 3, 4 (D1, D3, D4, P1)
    surviving_shards_1 = [shards[0], shards[2], shards[3], shards[4]]
    surviving_indices_1 = [0, 2, 3, 4]
    decoded_1 = erasure.decode(
        shards=surviving_shards_1,
        shard_indices=surviving_indices_1,
        original_size=len(original_data),
    )
    assert decoded_1 == original_data

    # Reconstruct the exact missing shard (shard 1)
    reconstructed_shard_1 = erasure.reconstruct_shard(
        surviving_shards=surviving_shards_1,
        surviving_indices=surviving_indices_1,
        target_shard_index=1,
        original_size=len(original_data),
    )
    assert reconstructed_shard_1 == shards[1]
    assert compute_sha256(reconstructed_shard_1) == shard_checksums[1]

    # 5. Test scenario C: Remove 2 data shards (e.g. shards 0 and 2 missing)
    # Surviving: shards 1, 3, 4, 5 (D2, D4, P1, P2)
    surviving_shards_2 = [shards[1], shards[3], shards[4], shards[5]]
    surviving_indices_2 = [1, 3, 4, 5]
    decoded_2 = erasure.decode(
        shards=surviving_shards_2,
        shard_indices=surviving_indices_2,
        original_size=len(original_data),
    )
    assert decoded_2 == original_data

    # Reconstruct shard 0 and shard 2
    recon_0 = erasure.reconstruct_shard(surviving_shards_2, surviving_indices_2, 0, len(original_data))
    recon_2 = erasure.reconstruct_shard(surviving_shards_2, surviving_indices_2, 2, len(original_data))
    assert recon_0 == shards[0]
    assert recon_2 == shards[2]
    assert compute_sha256(recon_0) == shard_checksums[0]
    assert compute_sha256(recon_2) == shard_checksums[2]

    # 6. Test scenario D: Remove 1 data and 1 parity shard (e.g. shard 3 and shard 5 missing)
    # Surviving: shards 0, 1, 2, 4 (D1, D2, D3, P1)
    surviving_shards_3 = [shards[0], shards[1], shards[2], shards[4]]
    surviving_indices_3 = [0, 1, 2, 4]
    recon_parity_5 = erasure.reconstruct_shard(surviving_shards_3, surviving_indices_3, 5, len(original_data))
    assert recon_parity_5 == shards[5]
    assert compute_sha256(recon_parity_5) == shard_checksums[5]

    # 7. Test scenario E: Quorum failure (3 shards missing - only 3 surviving)
    # Durability RS(4+2) tolerates at most 2 failures. 3 failures must raise InsufficientShardsError!
    with pytest.raises(InsufficientShardsError):
        erasure.decode(
            shards=[shards[0], shards[1], shards[2]],
            shard_indices=[0, 1, 2],
            original_size=len(original_data),
        )


def test_erasure_shard_labels():
    """Verify shard labeling logic."""
    erasure = ErasureService(data_shards=4, parity_shards=2)
    assert erasure.calculate_shard_label(1) == ("data", "D1")
    assert erasure.calculate_shard_label(2) == ("data", "D2")
    assert erasure.calculate_shard_label(3) == ("data", "D3")
    assert erasure.calculate_shard_label(4) == ("data", "D4")
    assert erasure.calculate_shard_label(5) == ("parity", "P1")
    assert erasure.calculate_shard_label(6) == ("parity", "P2")
