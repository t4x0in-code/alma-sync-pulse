import { useEffect, useState, useCallback } from "react";
import { api, MOCK_CLASSES, type SalsaClass } from "@/lib/api";

export function useClasses(pollMs = 5000) {
  const [classes, setClasses] = useState<SalsaClass[]>(MOCK_CLASSES);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.listClasses();
      setClasses(data);
      setLive(true);
      setError(null);
    } catch (e) {
      setLive(false);
      setError(e instanceof Error ? e.message : "offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  return { classes, loading, live, error, reload: load };
}
