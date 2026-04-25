import { useEffect, useState, useCallback } from "react";
import { api, getMode, onModeChange, type ApiMode, type SalsaClass } from "@/lib/api";

export function useClasses(pollMs = 5000) {
  const [classes, setClasses] = useState<SalsaClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ApiMode>(getMode());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.listClasses();
      setClasses(data);
      setError(null);
      setMode(getMode());
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    const off = onModeChange((m) => setMode(m));
    // React to writes from the local store (same-tab)
    const onLocal = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("almalatina:local-update", onLocal);
      window.addEventListener("storage", onLocal);
    }
    return () => {
      clearInterval(id);
      off();
      if (typeof window !== "undefined") {
        window.removeEventListener("almalatina:local-update", onLocal);
        window.removeEventListener("storage", onLocal);
      }
    };
  }, [load, pollMs]);

  return {
    classes,
    loading,
    mode,
    live: mode === "live",
    error,
    reload: load,
  };
}
