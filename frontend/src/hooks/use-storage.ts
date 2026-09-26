"use client";

import { useState, useEffect, useCallback } from "react";
import { StorageMetrics } from "@/types";
import { storageApi } from "@/lib/api/storage";

export function useStorage() {
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageApi.getStorageMetrics();
      setStorageMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load storage telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await storageApi.getStorageMetrics();
        if (!ignore) {
          setStorageMetrics(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load storage telemetry");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { storageMetrics, loading, error, refetch: fetchStorage };
}
