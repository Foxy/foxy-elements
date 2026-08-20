import {
  WriteError,
  assertWriteSucceeded,
  type FollowableLink,
} from "@/lib/customer-api";

/**
 * PATCHes a resource through its own link, failing loudly if it is unwritable
 * or if the API rejected the request.
 *
 * Two ways a write silently "succeeds" without this:
 *
 * - `link.patch?.(body)` resolves with `undefined` when `patch` is absent, so an
 *   unwritable link is indistinguishable from a saved one. A link without
 *   `patch` means the API shape is not what we expect, so it takes the error
 *   path.
 * - The SDK is a traversal client and never inspects HTTP status, so a 401 or a
 *   422 resolves exactly like a 200. `assertWriteSucceeded` is what turns those
 *   into failures, and it carries the status so a caller can tell an auth
 *   rejection from anything else.
 */
export async function patchResource<T>(
  link: FollowableLink<T> | null | undefined,
  body: Partial<T>,
): Promise<void> {
  if (typeof link?.patch !== "function") {
    throw new WriteError("This resource cannot be updated.");
  }

  assertWriteSucceeded(await link.patch(body));
}
