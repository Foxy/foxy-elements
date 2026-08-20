import type { FollowableLink } from "@/lib/customer-api";

/**
 * PATCHes a resource through its own link, failing loudly if it is unwritable.
 *
 * `link.patch?.(body)` silently resolves when `patch` is absent, which makes an
 * unwritable link indistinguishable from a successful save — the caller closes
 * its dialog and reports success while nothing was written. A link without
 * `patch` means the API shape is not what we expect, so it takes the error path.
 */
export async function patchResource<T>(
  link: FollowableLink<T> | null | undefined,
  body: Partial<T>,
): Promise<void> {
  if (typeof link?.patch !== "function") {
    throw new Error("This resource cannot be updated.");
  }

  await link.patch(body);
}
