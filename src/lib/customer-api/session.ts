import type { API, StoredSession } from "@foxy.io/sdk/customer";

/** Key of the saved session inside the portal's scoped storage. */
const SESSION_KEY = "session";

/** Storage each API's session is saved to by `persistSession`. */
const storages = new WeakMap<API, Storage>();

/** Thrown by a read whose response says the customer is not authenticated. */
export class UnauthenticatedError extends Error {
  constructor(message = "This request requires a signed-in customer.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

/**
 * True when the API holds a session the SDK would still send.
 *
 * Having a session is not enough: the SDK compares `date_created + expires_in`
 * against the clock on every request and drops the session when it has
 * passed. Picking the initial screen on presence alone lands an expired
 * session on the account screen, where the first request drops it and comes
 * back 401.
 */
export function hasValidSession(api: Pick<API, "session">): boolean {
  const session = api.session;
  if (!session) return false;

  const createdAt = new Date(session.date_created).getTime();
  return !(createdAt + session.expires_in * 1000 < Date.now());
}

/**
 * Keeps the API's session across reloads. The SDK holds it in memory only, so
 * this restores the saved one into the API, then saves every `session` event
 * and removes the saved copy when the session ends. A saved session the SDK
 * rejects is removed, so the customer signs in again.
 */
export function persistSession(api: API, storage: Storage): void {
  storages.set(api, storage);

  const raw = storage.getItem(SESSION_KEY);
  if (raw) {
    try {
      api.setSession(JSON.parse(raw) as StoredSession);
    } catch {
      storage.removeItem(SESSION_KEY);
    }
  }

  api.addEventListener("session", (event) => {
    if (event.detail) storage.setItem(SESSION_KEY, JSON.stringify(event.detail));
    else storage.removeItem(SESSION_KEY);
  });
}

/**
 * Forgets the session without a request, in the API and in the storage
 * `persistSession` saves it to. `setSession` dispatches no `session` event, so
 * the saved copy has to be removed here.
 */
export function forgetSession(api: API): void {
  api.setSession(null);
  storages.get(api)?.removeItem(SESSION_KEY);
}
