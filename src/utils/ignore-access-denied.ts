import { isAccessDenied } from './is-access-denied';

/**
 * Resolves with the result of the given request, or with `undefined` if the request
 * failed because the token lacks a scope for it. Use it for requests that only
 * enrich a resource that was already loaded. Any other failure is thrown again.
 *
 * Expects failed requests to reject with a `Response`, like `NucleonElement#_fetch` does.
 */
export async function ignoreAccessDenied<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request;
  } catch (err) {
    if (err instanceof Response && (await isAccessDenied(err))) return undefined;
    throw err;
  }
}
