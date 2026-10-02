/** Minimal key-value storage so the mock runs in the browser (localStorage) and in tests (memory). */
export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(initial));
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  };
}

/**
 * localStorage when available (browser, storage allowed); otherwise an in-memory fallback
 * so private mode or blocked storage still works for the session.
 */
export function browserStore(): KeyValueStore {
  const fallback = memoryStore();
  const ls = (): Storage | null => {
    try {
      return typeof window === "undefined" ? null : window.localStorage;
    } catch {
      return null;
    }
  };
  return {
    get: (key) => {
      try {
        return ls()?.getItem(key) ?? fallback.get(key);
      } catch {
        return fallback.get(key);
      }
    },
    set: (key, value) => {
      try {
        const storage = ls();
        if (storage) storage.setItem(key, value);
        else fallback.set(key, value);
      } catch {
        fallback.set(key, value);
      }
    },
    remove: (key) => {
      try {
        ls()?.removeItem(key);
      } catch {
        // ignore
      }
      fallback.remove(key);
    },
  };
}
