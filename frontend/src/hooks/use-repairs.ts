"use client";

import { useState, useEffect, useCallback } from "react";
import { RepairTask } from "@/types";
import { repairsApi } from "@/lib/api/repairs";

export function useRepairs() {
  const [repairs, setRepairs] = useState<RepairTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairsApi.getRepairs();
      setRepairs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repair tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await repairsApi.getRepairs();
        if (!ignore) {
          setRepairs(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load repair tasks");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { repairs, loading, error, refetch: fetchRepairs };
}
