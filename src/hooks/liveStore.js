/**
 * Tiny shared cache for Firestore listeners. Any number of components can ask
 * for the same key; one listener serves them all and stays alive for 30s
 * after the last one unmounts, so moving between pages does not refetch.
 */
const entries = new Map();
const LINGER_MS = 30_000;

function getEntry(key, start, initial) {
  let entry = entries.get(key);
  if (!entry) {
    entry = { state: { data: initial, loading: true, error: null, fromCache: true }, listeners: new Set(), stop: null, timer: null };
    const emit = (patch) => {
      entry.state = { ...entry.state, ...patch };
      entry.listeners.forEach((l) => l());
    };
    entry.begin = () => {
      entry.stop = start(
        (data, meta = {}) => emit({ data, loading: false, error: null, fromCache: Boolean(meta.fromCache) }),
        (error) => emit({ loading: false, error }),
      );
    };
    entries.set(key, entry);
  }
  return entry;
}

/** Returns { subscribe, getSnapshot } for useSyncExternalStore. */
export function liveSource(key, start, initial) {
  if (!key) {
    const idle = { data: initial, loading: false, error: null, fromCache: false };
    return { subscribe: () => () => {}, getSnapshot: () => idle };
  }
  const entry = getEntry(key, start, initial);
  return {
    getSnapshot: () => entry.state,
    subscribe(listener) {
      entry.listeners.add(listener);
      clearTimeout(entry.timer);
      if (!entry.stop) entry.begin();
      return () => {
        entry.listeners.delete(listener);
        if (entry.listeners.size === 0) {
          entry.timer = setTimeout(() => {
            entry.stop?.();
            entries.delete(key);
          }, LINGER_MS);
        }
      };
    },
  };
}

/** Drops every listener, used on sign-out so the next user starts clean. */
export function resetLiveStore() {
  for (const entry of entries.values()) {
    clearTimeout(entry.timer);
    entry.stop?.();
  }
  entries.clear();
}
