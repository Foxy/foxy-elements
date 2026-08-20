const PREFIX = "foxy";

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
      if (key?.startsWith(this.#prefix)) keys.push(key.slice(this.#prefix.length));
    }

    return keys;
  }
}
