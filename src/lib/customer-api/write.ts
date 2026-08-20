/**
 * The SDK is a traversal client and never inspects HTTP status. `Node.patch`
 * returns the response as-is, and `Response.json()` parses the body whatever
 * the status is, so a 4xx resolves exactly like a success. Every write has to
 * check `ok` itself, or a rejected save reports success to the customer.
 */
export type WriteResponse = { ok: boolean; status: number };

/** Thrown when a write did not happen. Carries the HTTP status when there was one. */
export class WriteError extends Error {
  /** HTTP status of the rejected write, or `null` when no request was made. */
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "WriteError";
    this.status = status;
  }

  /**
   * 401 and 403 mean the API refused the credentials the write carried: a wrong
   * `password_old`, or a session that is no longer valid. Callers turn this
   * into a field-level error; every other failure stays form-level.
   */
  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Throws unless the response reports a successful request.
 *
 * Anything that does not say `ok === true` is a failure, including a response
 * that carries no status at all — an object that cannot tell us the write
 * succeeded is not evidence that it did.
 */
export function assertWriteSucceeded(response: unknown): void {
  const { ok, status } = (response ?? {}) as Partial<WriteResponse>;
  if (ok === true) return;

  const hasStatus = typeof status === "number";

  throw new WriteError(
    hasStatus
      ? `The API rejected this request with status ${status}.`
      : "The API rejected this request.",
    hasStatus ? status : null,
  );
}
