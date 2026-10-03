"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LocalStorageProgressStore } from "./localStorageStore";
import { emptyProgress, type ProgressData, type ProgressStore } from "./types";

type ProgressContextValue = {
  /** False until progress has been read from storage (always false on the server). */
  ready: boolean;
  data: ProgressData;
  store: ProgressStore;
  /** Run a store action, then refresh `data` so the UI updates. */
  act: <T>(fn: (store: ProgressStore) => Promise<T>) => Promise<T>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo<ProgressStore>(() => new LocalStorageProgressStore(), []);
  const [data, setData] = useState<ProgressData>(emptyProgress);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setData(await store.load());
    setReady(true);
  }, [store]);

  useEffect(() => {
    refresh();
    // Keep several open tabs in step.
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const act = useCallback(
    async <T,>(fn: (s: ProgressStore) => Promise<T>) => {
      const result = await fn(store);
      await refresh();
      return result;
    },
    [store, refresh],
  );

  const value = useMemo(() => ({ ready, data, store, act }), [ready, data, store, act]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
