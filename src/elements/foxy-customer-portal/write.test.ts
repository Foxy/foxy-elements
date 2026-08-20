import { describe, expect, it, vi } from "vitest";
import { WriteError, type FollowableLink } from "@/lib/customer-api";
import { patchResource } from "./write";

type Body = Record<string, string>;

/**
 * The fakes here return responses, never rejections: that is what the real
 * client does. `Node.patch` resolves with a `Response` whatever the status,
 * and the SDK's `AuthError` is thrown only by `signIn`, `signUp`,
 * `sendPasswordResetEmail` and `signOut` — never by a link's `patch`.
 */
function link(response: unknown) {
  return {
    href: "/c",
    get: vi.fn(async () => ({ json: async () => ({}) as Body })),
    patch: vi.fn(async () => response as never),
  } satisfies FollowableLink<Body>;
}

/** Runs a write that is expected to fail and hands back the error it threw. */
async function failedWrite(link: FollowableLink<Body> | null, body: Body) {
  try {
    await patchResource(link, body);
  } catch (caught) {
    return caught as WriteError;
  }

  throw new Error("Expected patchResource to reject, but it resolved.");
}

describe("patchResource", () => {
  it("sends the body through the link", async () => {
    const self = link({ ok: true, status: 200 });

    await patchResource(self, { first_name: "Ada" });

    expect(self.patch).toHaveBeenCalledWith({ first_name: "Ada" });
  });

  it("resolves on a 204, which carries no body", async () => {
    await expect(
      patchResource(link({ ok: true, status: 204 }), { tax_id: "" }),
    ).resolves.toBeUndefined();
  });

  it("throws when the API rejects the write", async () => {
    await expect(
      patchResource(link({ ok: false, status: 422 }), { email: "" }),
    ).rejects.toBeInstanceOf(WriteError);
  });

  it("carries the status so callers can branch on it", async () => {
    const caught = await failedWrite(link({ ok: false, status: 401 }), {
      password: "x",
    });

    expect(caught.status).toBe(401);
    expect(caught.isUnauthorized).toBe(true);
  });

  it("treats 403 as an auth rejection too", async () => {
    const caught = await failedWrite(link({ ok: false, status: 403 }), {
      password: "x",
    });

    expect(caught.isUnauthorized).toBe(true);
  });

  it("does not treat a 422 as an auth rejection", async () => {
    const caught = await failedWrite(link({ ok: false, status: 422 }), {
      email: "nope",
    });

    expect(caught.isUnauthorized).toBe(false);
  });

  it("throws when the response cannot say whether the write happened", async () => {
    await expect(
      patchResource(link({}), { tax_id: "1" }),
    ).rejects.toBeInstanceOf(WriteError);
  });

  it("throws without a request when the link has no patch method", async () => {
    await expect(
      patchResource(
        {
          href: "/c",
          get: vi.fn(async () => ({ json: async () => ({}) as Body })),
        },
        { tax_id: "1" },
      ),
    ).rejects.toThrow(/cannot be updated/i);
  });

  it("throws for a missing link", async () => {
    await expect(patchResource(null, { tax_id: "1" })).rejects.toBeInstanceOf(
      WriteError,
    );
  });
});
