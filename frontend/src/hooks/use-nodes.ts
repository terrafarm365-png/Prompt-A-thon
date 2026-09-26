"use client";

import { useState, useEffect, useCallback } from "react";
import { StorageNode } from "@/types";
import { nodesApi } from "@/lib/api/nodes";

export function useNodes() {
  const [nodes, setNodes] = useState<StorageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await nodesApi.getNodes();
      setNodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load nodes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await nodesApi.getNodes();
        if (!ignore) {
          setNodes(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load nodes");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { nodes, loading, error, refetch: fetchNodes };
}
