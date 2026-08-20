export type CacheEntry<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
};

const EMPTY: CacheEntry<never> = { data: null, error: null, isLoading: true };

/** Stable string for a query object, so key order never splits the cache. */
export function serialiseQuery(query: unknown): string {
  if (query === undefined || query === null) return "";
  if (typeof query !== "object") return String(query);

  const entries = Object.entries(query as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}

/**
 * Shared request store. Two components reading the same key get one request
 * and one invalidation — the job Rumour's `group` did across elements in v1.
 */
export class RequestCache {
  readonly #entries = new Map<string, CacheEntry<unknown>>();
  readonly #listeners = new Map<string, Set<() => void>>();
  readonly #generations = new Map<string, number>();
  #epoch = 0;

  read<T>(key: string, load: () => Promise<T>): CacheEntry<T> {
    const existing = this.#entries.get(key) as CacheEntry<T> | undefined;
    if (existing) return existing;

    this.#entries.set(key, EMPTY);
    const generation = (this.#generations.get(key) ?? 0) + 1;
    this.#generations.set(key, generation);
    const epoch = this.#epoch;

    void load().then(
      (data) =>
        this.#settle(
          key,
          { data, error: null, isLoading: false },
          generation,
          epoch,
        ),
      (error: unknown) =>
        this.#settle(
          key,
          {
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
          },
          generation,
          epoch,
        ),
    );

    return EMPTY as CacheEntry<T>;
  }

  subscribe(key: string, listener: () => void): () => void {
    const listeners = this.#listeners.get(key) ?? new Set();
    listeners.add(listener);
    this.#listeners.set(key, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.#listeners.delete(key);
    };
  }

  invalidate(key: string): void {
    this.#entries.delete(key);
    const generation = (this.#generations.get(key) ?? 0) + 1;
    this.#generations.set(key, generation);
    this.#notify(key);
  }

  clear(): void {
    const keys = [...this.#entries.keys()];
    this.#entries.clear();
    this.#generations.clear();
    this.#epoch++;
    for (const key of keys) this.#notify(key);
  }

  #settle(
    key: string,
    entry: CacheEntry<unknown>,
    generation: number,
    epoch: number,
  ): void {
    // Only settle if this is still the active load for this key.
    // A stale load from before an invalidate() or clear() must not
    // resurrect stale data.
    if (this.#generations.get(key) !== generation || this.#epoch !== epoch) {
      return;
    }
    this.#entries.set(key, entry);
    this.#notify(key);
  }

  #notify(key: string): void {
    for (const listener of this.#listeners.get(key) ?? []) listener();
  }
}
