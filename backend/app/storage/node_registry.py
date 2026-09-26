import logging
from typing import Dict, List, Optional
from app.core.config import StorageNodeConfig, get_settings
from app.core.exceptions import StorageNodeError
from app.storage.node_client import StorageNodeClient

logger = logging.getLogger("vault.storage.registry")


class NodeRegistry:
    """Central registry and connection manager for distributed storage nodes."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._clients: Dict[str, StorageNodeClient] = {}
        self._node_configs: Dict[str, StorageNodeConfig] = {}
        self._initialize_from_config()

    def _initialize_from_config(self) -> None:
        """Load storage node definitions from environment configuration."""
        configured = self.settings.get_configured_nodes()
        for node in configured:
            self._node_configs[node.id] = node
            self._clients[node.id] = StorageNodeClient(
                node_id=node.id,
                base_url=node.url,
                shared_secret=self.settings.STORAGE_NODE_SHARED_SECRET,
                timeout=self.settings.STORAGE_NODE_TIMEOUT_SECONDS,
            )
        logger.info(f"Initialized Storage Node Registry with {len(self._clients)} configured nodes.")

    def get_client(self, node_id: str) -> StorageNodeClient:
        """Get or create client for a specific node ID."""
        if node_id in self._clients:
            return self._clients[node_id]

        if node_id in self._node_configs:
            cfg = self._node_configs[node_id]
            client = StorageNodeClient(
                node_id=cfg.id,
                base_url=cfg.url,
                shared_secret=self.settings.STORAGE_NODE_SHARED_SECRET,
                timeout=self.settings.STORAGE_NODE_TIMEOUT_SECONDS,
            )
            self._clients[node_id] = client
            return client

        raise StorageNodeError(
            node_id=node_id,
            message=f"Storage node '{node_id}' is not registered in the cluster registry",
            status_code=404,
        )

    def register_node(self, config: StorageNodeConfig) -> None:
        """Register or update a storage node at runtime."""
        self._node_configs[config.id] = config
        self._clients[config.id] = StorageNodeClient(
            node_id=config.id,
            base_url=config.url,
            shared_secret=self.settings.STORAGE_NODE_SHARED_SECRET,
            timeout=self.settings.STORAGE_NODE_TIMEOUT_SECONDS,
        )
        logger.info(f"Registered storage node: {config.id} at {config.url}")

    def list_nodes(self) -> List[StorageNodeConfig]:
        """List all registered node configs."""
        return list(self._node_configs.values())

    def get_node_config(self, node_id: str) -> Optional[StorageNodeConfig]:
        return self._node_configs.get(node_id)


# Global singleton registry instance
_registry_instance: Optional[NodeRegistry] = None


def get_node_registry() -> NodeRegistry:
    """Get singleton NodeRegistry instance."""
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = NodeRegistry()
    return _registry_instance
