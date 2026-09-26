from typing import Tuple


def calculate_storage_efficiency(logical_bytes: int, physical_bytes: int) -> float:
    """
    Calculate dynamic storage efficiency percentage: (logical / physical) * 100.
    Handles zero division gracefully.
    """
    if physical_bytes <= 0:
        return 0.0
    efficiency = (logical_bytes / physical_bytes) * 100.0
    return round(efficiency, 2)


def calculate_overhead_ratio(data_shards: int, parity_shards: int) -> float:
    """
    Calculate overhead multiplier (total_shards / data_shards).
    E.g. RS(4+2) -> 6 / 4 = 1.5x.
    """
    if data_shards <= 0:
        return 1.0
    return round((data_shards + parity_shards) / data_shards, 2)


def format_bytes(num_bytes: int) -> str:
    """Format bytes to human-readable string (e.g. 52.4 MB, 1.2 GB)."""
    if num_bytes < 0:
        return "0 B"
    for unit in ["B", "KB", "MB", "GB", "TB", "PB"]:
        if abs(num_bytes) < 1024.0:
            return f"{num_bytes:3.1f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.1f} EB"
