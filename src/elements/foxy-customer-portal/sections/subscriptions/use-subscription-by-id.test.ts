import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ApiProvider, RequestCache } from "@/lib/customer-api";
import { useSubscriptionById } from "./use-subscription-by-id";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise -- see `../../test-utils.ts`, which sets this for
// every screen test. This file renders a bare probe component directly
// (there is no screen to mount), so it sets the same flag itself.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

function renderHook(link: unknown, id: string) {
  let result: ReturnType<typeof useSubscriptionById> | undefined;

  function Probe() {
    result = useSubscriptionById(link as never, id);
    return null;
  }

  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);

  act(() => {
    root!.render(
      createElement(ApiProvider, {
        api: {} as never,
        cache: new RequestCache(),
        onUnauthenticated: vi.fn(),
        children: createElement(Probe),
      }),
    );
  });

  return () => result!;
}

function collectionLink(
  get: (query?: Record<string, unknown>) => Promise<unknown>,
) {
  return { href: "https://demo.foxycart.com/s/customer/subscriptions", get };
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe("useSubscriptionById", () => {
  it("scans the unfiltered collection page for a matching id", async () => {
    // Two items, only one matching -- proves the hook actually discriminates
    // between them rather than trivially returning `items[0]`. See this
    // hook's doc comment: no `filters` key is sent, because a live-store
    // check of `filters: ["id=<value>"]` was not possible in the
    // implementing environment, so this is the documented client-side
    // fallback instead.
    const spy = vi.fn(async (_query?: Record<string, unknown>) => ({
      ok: true,
      status: 200,
      json: async () => ({
        total_items: 2,
        _embedded: {
          "fx:subscriptions": [
            { _links: { self: { href: "/s/7" } } },
            { _links: { self: { href: "/s/42" } } },
          ],
        },
      }),
    }));

    const getResult = renderHook(collectionLink(spy), "42");
    await flush();

    expect(getResult().subscription).toMatchObject({
      _links: { self: { href: "/s/42" } },
    });
    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(query).toMatchObject({ limit: 100 });
    expect(query).not.toHaveProperty("filters");
  });

  it("returns null without erroring when nothing matches", async () => {
    const getResult = renderHook(
      collectionLink(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ total_items: 0, _embedded: {} }),
      })),
      "does-not-exist",
    );
    await flush();

    expect(getResult().subscription).toBeNull();
    expect(getResult().error).toBeNull();
  });

  it("skips the request entirely when the link is null", async () => {
    const getResult = renderHook(null, "42");
    await flush();

    expect(getResult().subscription).toBeNull();
    expect(getResult().isLoading).toBe(false);
  });
});
