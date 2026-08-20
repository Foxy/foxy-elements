const PREFIX = "foxy";

/** Key written and read once to prove the backing store actually works. */
const PROBE_KEY = "__probe__";

/**
 * A `Storage` view over another `Storage`, namespaced by `scope`.
 *
 * The SDK writes session data under the fixed key `API.SESSION` ("session").
 * Two Foxy stores served from the same origin would therefore share one
 * session slot, and signing into the second would silently overwrite the
 * first. Scoping by the resolved base URL keeps them apart.
 */
export class ScopedStorage implements Storage {
  readonly #prefix: string;
  readonly #backing: Storage;

  constructor(scope: string, backing: Storage = localStorage) {
    this.#prefix = `${PREFIX}:${scope}:`;
    this.#backing = backing;
  }

  get length(): number {
    return this.#ownKeys().length;
  }

  key(index: number): string | null {
    return this.#ownKeys()[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.#backing.getItem(this.#prefix + key);
  }

  setItem(key: string, value: string): void {
    this.#backing.setItem(this.#prefix + key, value);
  }

  removeItem(key: string): void {
    this.#backing.removeItem(this.#prefix + key);
  }

  clear(): void {
    for (const key of this.#ownKeys()) this.removeItem(key);
  }

  /** Unprefixed keys belonging to this scope, in backing-store order. */
  #ownKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < this.#backing.length; i++) {
      const key = this.#backing.key(i);
      if (key?.startsWith(this.#prefix))
        keys.push(key.slice(this.#prefix.length));
    }

    return keys;
  }
}

/** A `Storage` that keeps everything in memory and nothing across reloads. */
export class MemoryStorage implements Storage {
  readonly #entries = new Map<string, string>();

  get length(): number {
    return this.#entries.size;
  }

  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.#entries.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#entries.set(key, String(value));
  }

  removeItem(key: string): void {
    this.#entries.delete(key);
  }

  clear(): void {
    this.#entries.clear();
  }
}

/**
 * Session storage for one store, scoped by base URL.
 *
 * Reading `localStorage` throws `SecurityError` where storage is blocked — a
 * third-party iframe, or a browser set to block all cookies — and the throw
 * would otherwise escape `connectedCallback` and leave the element rendering
 * nothing at all. Falling back to memory keeps the portal usable for the length
 * of the page view: the customer can sign in and use their account, and only
 * loses the session on reload. That is a better outcome than an error screen in
 * a context where nothing can be persisted anyway.
 */
export function createScopedStorage(scope: string): ScopedStorage {
  try {
    const storage = new ScopedStorage(scope);
    // Construction alone proves little: some browsers expose `localStorage` and
    // throw only when it is written to. Round-trip a key to find out here,
    // rather than on the first sign-in.
    storage.setItem(PROBE_KEY, "1");
    storage.removeItem(PROBE_KEY);
    return storage;
  } catch {
    return new ScopedStorage(scope, new MemoryStorage());
  }
}
