import { API } from "@foxy.io/sdk/customer";

/** The parts of the SDK's stored session that decide whether it is still usable. */
type StoredSession = { date_created?: string; expires_in?: number };

/** Thrown by a read whose response says the customer is not authenticated. */
export class UnauthenticatedError extends Error {
  constructor(message = "This request requires a signed-in customer.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

/**
 * True when storage holds a session the SDK would still send.
 *
 * The presence of the session key is not enough: `API.__fetch` compares
 * `date_created + expires_in` against the clock on every request and signs the
 * customer out when it has passed. Picking the initial screen on presence alone
 * lands an expired session on the account screen, where the first request
 * clears the session and comes back 401.
 *
 * Two deliberate details:
 *
 * - A session that cannot be parsed counts as no session. The SDK would throw
 *   on it inside `__fetch`; treating it as absent is a strict improvement.
 * - A session missing `date_created` or `expires_in` counts as valid, because
 *   the arithmetic yields `NaN` and `NaN < Date.now()` is `false`. That is what
 *   the SDK does, and diverging here would sign out sessions the SDK accepts.
 */
export function hasValidSession(api: Pick<API, "storage">): boolean {
  const raw = api.storage.getItem(API.SESSION);
  if (!raw) return false;

  let session: StoredSession | null;

  try {
    session = JSON.parse(raw) as StoredSession | null;
  } catch {
    return false;
  }

  if (typeof session !== "object" || session === null) return false;

  const createdAt = new Date(session.date_created as string).getTime();
  const expiresAt = createdAt + (session.expires_in as number) * 1000;

  return !(expiresAt < Date.now());
}
