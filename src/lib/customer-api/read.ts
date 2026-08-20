import { UnauthenticatedError } from "./session";

/**
 * What a link's `get` resolves with. The SDK's `Response` extends the native
 * one, so `ok` and `status` are prototype getters — destructure them, never
 * spread the response.
 */
export type ReadResponse<T> = {
  ok: boolean;
  status: number;
  json(): Promise<T>;
};

/**
 * Throws unless the response reports a successful read.
 *
 * The SDK never inspects status: `Node.get` resolves for any status and
 * `Response.json()` parses the body regardless, so a 401 body is happily
 * parsed into a resource-shaped object full of nothing. Without this, an
 * expired session renders a header full of blanks.
 *
 * 401 and 403 become `UnauthenticatedError` so the portal can route back to
 * sign-in rather than dead-ending on a retry that can never succeed.
 */
export function assertReadSucceeded(response: unknown): void {
  const { ok, status } = (response ?? {}) as Partial<ReadResponse<unknown>>;
  if (ok === true) return;

  if (status === 401 || status === 403) throw new UnauthenticatedError();

  throw new Error(
    typeof status === "number"
      ? `The API rejected this request with status ${status}.`
      : "The API rejected this request.",
  );
}
