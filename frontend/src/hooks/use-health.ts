"use client";

import { useState, useEffect, useCallback } from "react";
import { HealthMetrics, ActivityEvent } from "@/types";
import { healthApi } from "@/lib/api/health";

export function useHealth() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [hData, aData] = await Promise.all([
        healthApi.getHealthMetrics(),
        healthApi.getActivity(),
      ]);
      setMetrics(hData);
      setActivity(aData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [hData, aData] = await Promise.all([
          healthApi.getHealthMetrics(),
          healthApi.getActivity(),
        ]);
        if (!ignore) {
          setMetrics(hData);
          setActivity(aData);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load health telemetry");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { metrics, activity, loading, error, refetch: fetchHealth };
}
