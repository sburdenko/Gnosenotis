"use client";

import { useCallback, useSyncExternalStore } from "react";

type ProgressMap = Record<string, boolean>;

/**
 * Persists a set of "done" keys (read articles, solved problems, ...) to
 * `localStorage`, replacing the hand-rolled `done`/`save()`/`updProg()` trio
 * from the legacy app for both the Reading list and LeetCode tabs.
 *
 * Learning note (React — `useSyncExternalStore`): `localStorage` is an
 * "external store" React doesn't know about, and it doesn't exist during
 * server rendering / static export at all. `useSyncExternalStore` is the
 * hook built specifically for this: it renders `getServerSnapshot()`
 * (an empty map) during the build/server pass, then — because this runs in a
 * Client Component in the browser — re-checks `getSnapshot()` right after
 * hydration and re-renders once if the real, persisted value differs. That
 * gets us the same "start empty, then load" behavior an earlier
 * effect-based version of this hook had to do by hand with
 * `useEffect` + `setState`, without the extra render pass React's lint
 * rules warn about for that pattern.
 *
 * The snapshot cache and listener set below are module-level (shared by
 * every component that calls this hook), which is exactly what
 * `useSyncExternalStore` expects: `getSnapshot` must return the *same*
 * object reference until the underlying value actually changes, or React
 * assumes it changes every render and re-renders forever.
 */
const EMPTY_PROGRESS: ProgressMap = {};
const snapshotCache = new Map<string, ProgressMap>();
const listenersByKey = new Map<string, Set<() => void>>();

function readFromStorage(key: string): ProgressMap {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {}; // Corrupt or inaccessible storage (private browsing, quota, ...) — start fresh.
  }
}

function getSnapshot(key: string): ProgressMap {
  if (!snapshotCache.has(key)) snapshotCache.set(key, readFromStorage(key));
  return snapshotCache.get(key)!;
}

function writeToStorage(key: string, next: ProgressMap) {
  snapshotCache.set(key, next);
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Best-effort persistence; the in-memory cache above still updates.
  }
  listenersByKey.get(key)?.forEach((notify) => notify());
}

export function useProgressSet(storageKey: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!listenersByKey.has(storageKey)) listenersByKey.set(storageKey, new Set());
      const listeners = listenersByKey.get(storageKey)!;
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    [storageKey],
  );

  const done = useSyncExternalStore(
    subscribe,
    useCallback(() => getSnapshot(storageKey), [storageKey]),
    () => EMPTY_PROGRESS,
  );

  const toggle = useCallback(
    (key: string) => {
      const current = getSnapshot(storageKey);
      writeToStorage(storageKey, { ...current, [key]: !current[key] });
    },
    [storageKey],
  );

  const reset = useCallback(() => writeToStorage(storageKey, {}), [storageKey]);

  const count = Object.values(done).filter(Boolean).length;

  return { done, toggle, reset, count };
}
