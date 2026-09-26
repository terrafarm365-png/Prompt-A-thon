"use client";

import { useState, useEffect, useCallback } from "react";
import { VaultObject } from "@/types";
import { objectsApi, GetObjectsParams } from "@/lib/api/objects";

export function useObjects(params?: GetObjectsParams) {
  const [objects, setObjects] = useState<VaultObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = params?.search;
  const status = params?.status;
  const sortBy = params?.sortBy;
  const sortOrder = params?.sortOrder;

  const fetchObjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objectsApi.getObjects({ search, status, sortBy, sortOrder });
      setObjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load objects");
    } finally {
      setLoading(false);
    }
  }, [search, status, sortBy, sortOrder]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await objectsApi.getObjects({ search, status, sortBy, sortOrder });
        if (!ignore) {
          setObjects(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load objects");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [search, status, sortBy, sortOrder]);

  const deleteObject = async (id: string) => {
    await objectsApi.deleteObject(id);
    setObjects((prev) => prev.filter((o) => o.id !== id));
  };

  return { objects, loading, error, refetch: fetchObjects, deleteObject };
}
