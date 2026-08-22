import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ApiProvider, RequestCache } from "@/lib/customer-api";
import { useAddressById } from "./use-address-by-id";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

function renderHook(link: unknown, id: string) {
  let result: ReturnType<typeof useAddressById> | undefined;

  function Probe() {
    result = useAddressById(link as never, id);
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

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe("useAddressById", () => {
  it("requests the collection (unfiltered, capped at 100) and picks the matching id client-side", async () => {
    const spy = vi.fn(async (_query?: Record<string, unknown>) => ({
      ok: true,
      status: 200,
      json: async () => ({
        total_items: 2,
        _embedded: {
          "fx:customer_addresses": [
            { _links: { self: { href: "/a/3" } } },
            { _links: { self: { href: "/a/7" } } },
          ],
        },
      }),
    }));

    const getResult = renderHook(
      { href: "https://demo.foxycart.com/s/customer/addresses", get: spy },
      "7",
    );
    await flush();

    expect(getResult().address).toMatchObject({
      _links: { self: { href: "/a/7" } },
    });
    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(query).toMatchObject({ limit: 100 });
  });

  it("returns null without erroring when nothing matches", async () => {
    const getResult = renderHook(
      {
        href: "/addresses",
        get: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ total_items: 0, _embedded: {} }),
        }),
      },
      "missing",
    );
    await flush();

    expect(getResult().address).toBeNull();
    expect(getResult().error).toBeNull();
  });
});
